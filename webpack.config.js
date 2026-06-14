const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const webpack = require('webpack');
const path = require('path');

// Single source of truth for the Module Federation container name. Used as the
// ModuleFederationPlugin `name` AND injected via DefinePlugin as `__MF_NAME__`,
// so App.tsx passes it to useRemoteApp without retyping the string.
const MODULE_FEDERATION_NAME = 'ucaasExtensionDemo';

module.exports = (_env, argv) => ({
  mode: argv.mode || 'development',
  entry: './src/App.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: argv.mode === 'production' ? 'auto' : 'http://localhost:5005/',
    filename:
      argv.mode === 'production' ? '[name].[contenthash].js' : '[name].js',
    chunkFilename:
      argv.mode === 'production' ? '[id].[contenthash].js' : '[id].js',
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
        loglevel: { singleton: true, requiredVersion: '^1.9.2', eager: false },
        '@netsapiens/horizon-sdk': {
          singleton: true,
          requiredVersion: '^0.1.0',
          eager: false,
        },
        // MUI and i18next are intentionally NOT listed here. The host's federation
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
  ],
  devServer: {
    port: 5005,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
