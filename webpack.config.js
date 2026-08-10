const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const webpack = require('webpack');
const path = require('path');

// Single source of truth for the Module Federation container name. Used as the
// ModuleFederationPlugin `name` AND injected via DefinePlugin as `__MF_NAME__`,
// so App.tsx passes it to useRemoteApp without retyping the string.
const MODULE_FEDERATION_NAME = 'horizonExtensionDemo';

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: argv.mode || 'development',
    entry: './src/App.tsx',
    // Bundle verification (SDK 0.2.x) rejects a bundle with no source maps, and the
    // maps must carry `sourcesContent` — so never `noSources`, and dist/*.map ships.
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: isProduction ? 'auto' : 'http://localhost:5005/',
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[id].[contenthash].js' : '[id].js',
      // Required for Subresource Integrity: the browser cannot verify an integrity
      // value against an opaque cross-origin response. Without this, the integrity
      // values below are emitted but never actually checked.
      crossOriginLoading: 'anonymous',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
            },
          },
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: MODULE_FEDERATION_NAME,
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App',
          './pages/DemoPage': './src/pages/DemoPage',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^19.2.0', eager: false },
          'react-dom': {
            singleton: true,
            requiredVersion: '^19.2.0',
            eager: false,
          },
          loglevel: {
            singleton: true,
            requiredVersion: '^1.9.2',
            eager: false,
          },
          // '@netsapiens/horizon-sdk' is intentionally NOT listed here. The host does
          // not register the SDK as a shared module, so declaring it shared cannot
          // resolve to a host copy — and bundle verification rejects a bundle that
          // declares it. Bundle it normally.
          //
          // MUI and i18next are intentionally NOT listed here either. The host's federation
          // loader does not register them as shared modules — declaring them as
          // singletons here causes an "Unsatisfied version" crash at load time.
          //
          // Instead: consume MUI via horizonContext.ui, and translations via
          // useLocale() from the SDK — both are provided by the host through context.
        },
      }),
      new webpack.DefinePlugin({
        // Inject the MF container name so App.tsx can reference it without
        // retyping the string — defined once above as MODULE_FEDERATION_NAME.
        __MF_NAME__: JSON.stringify(MODULE_FEDERATION_NAME),
      }),
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
      // Emits sha384 integrity values for every chunk the entry loads. The platform
      // pins a hash of remoteEntry.js itself; without these, nothing that entry
      // pulls in afterwards is covered. Production only — the plugin warns under
      // `mode: development` and provides nothing useful for the dev server.
      ...(isProduction
        ? [new SubresourceIntegrityPlugin({ hashFuncNames: ['sha384'] })]
        : []),
    ],
    devServer: {
      port: 5005,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
};
