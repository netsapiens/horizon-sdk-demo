# Migrating an extension app to Horizon SDK 0.2.x

For partners with an extension app already deployed against SDK 0.1.x.

Horizon now verifies extension bundles before it will load them. On submission the
platform fetches your `remoteEntry.js`, every chunk and every source map from your
CDN, hashes them, runs a content analyser, and records a verdict. A passing version
is promoted and the host pins a SHA-384 of the exact bytes it verified.

An 0.1.x bundle will not satisfy this. What follows is the complete set of changes.

---

## What you have to change

Four things. Everything else about how you build and publish stays as it is.

|     | Change                                                 | Why                                                                            |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 1   | Emit chunk integrity values                            | The platform pins the entry; without these, nothing the entry loads is covered |
| 2   | Emit source maps with `sourcesContent`                 | **A bundle with no source maps is rejected outright**                          |
| 3   | Remove `@netsapiens/horizon-sdk` from webpack `shared` | The host does not provide it; declaring it shared is rejected                  |
| 4   | Guard the version field in CI                          | With a stable URL, a forgotten version bump silently breaks every host         |

Plus the dependency bump: `@netsapiens/horizon-sdk` → `^0.2.1`.

---

### 1. Chunk integrity

```bash
npm i -D webpack-subresource-integrity@5.1.0
```

```js
output: {
  crossOriginLoading: 'anonymous',   // REQUIRED
},
plugins: [
  new SubresourceIntegrityPlugin({ hashFuncNames: ['sha384'] }),
],
```

Both halves are required. Without `crossOriginLoading: 'anonymous'` the browser
cannot verify the integrity values webpack emitted, because Subresource Integrity
cannot check an opaque cross-origin response. The result is a security control that
is silently absent while everything appears to work.

### 2. Source maps

```js
devtool: 'source-map',
```

Do **not** set `noSources`, and do not strip `.map` files from what you publish.
The maps must carry `sourcesContent`.

This is the requirement most likely to catch you out: **missing source maps are a
rejection, not a warning.** The analyser attributes what it finds to specific source
files, and that rule cannot be relaxed by an operator. No maps, no verdict, no load.

### 3. Take the SDK out of `shared`

```js
shared: {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  loglevel: { singleton: true, requiredVersion: '^1.9.2' },
  // '@netsapiens/horizon-sdk' must NOT appear here — bundle it normally.
},
```

The host registers `react`, `react-dom`, `loglevel`, `i18next` and `react-i18next`
as shared modules, and nothing else. The SDK is not among them, so declaring it
shared cannot resolve to a host copy, and the checker rejects a bundle that declares
it.

Two related rules while you are in this block:

- **Never add MUI or i18next to `shared`.** They are not registered by the host, and
  declaring them as singletons fails at load with "Unsatisfied version". Use MUI
  through `horizonContext.ui.*` and translations through `useLocale()`.
- **Keep `react` and `react-dom` as singletons.** Your component renders inside the
  host's React tree; a second copy fails as an invalid-hook-call that names nothing
  useful.

### 4. Guard the version field

Your remote entry URL stays where it is. You publish new bytes to the same path,
and the platform re-verifies when you tell it the version changed.

That makes the version field load-bearing. **If you publish new bytes without
changing it, nothing re-verifies** — the platform goes on enforcing the previous
bytes' hash against the new ones at the same URL. Every host fails its integrity
check on the next page load and your extension simply does not appear: no verdict,
no finding, nothing in the portal explaining it.

Because that failure is silent, it needs a guard rather than a convention:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 2 # the guard diffs against the previous commit

# ... build ...

- name: Refuse to ship changed bytes under an unchanged version
  run: |
    PREV=$(git show HEAD~1:package.json 2>/dev/null | node -p "try{JSON.parse(require('fs').readFileSync(0,'utf8')).version}catch(e){''}" || echo "")
    THIS=$(node -p "require('./package.json').version")
    [ -z "$PREV" ] && exit 0
    [ "$PREV" != "$THIS" ] && exit 0
    git diff --quiet HEAD~1 HEAD -- src webpack.config.js package.json package-lock.json && exit 0
    echo "::error::Bundle inputs changed but the version is still $THIS. Bump it."
    exit 1
```

A push that touches only documentation passes untouched.

---

## Checking your work before you publish

```bash
npm run build
npx horizon-verify-bundle ./dist
```

Requires `@netsapiens/horizon-sdk@^0.2.1`. Seven checks run locally: chunk
integrity, cross-origin loading, source maps, `sourcesContent`, content rules,
SDK-not-shared, and shared-modules-host-provided. Three further items — version
bump, CORS and submission — are reported as notes, because they cannot be
determined from a local build.

Worth adding as a script:

```json
"verify": "horizon-verify-bundle ./dist"
```

A pass is not a guarantee of acceptance. CORS is probed at submission time, and an
operator may run stricter analysis rules than the shipped defaults.

---

## Publishing and submitting

1. Bump the version in `package.json` and publish your bundle as you normally do.
2. Confirm the URL serves `HTTP 200`, `content-type: application/javascript`, and an
   `Access-Control-Allow-Origin` header covering the portal origin.
3. In Horizon → Registered Apps, update the app's **version** field and save.
   Submission happens automatically — there is no button, and the remote entry URL
   does not change.
4. The verification chip shows a verdict within seconds. **Expand the row** to read
   the findings.

Your CDN origin must be on the platform's approved origins list. That is an operator
setting rather than something you control — if submission fails at the fetch stage,
ask your operator to confirm your origin is allowed.

⚠️ Between steps 1 and 3 the CDN serves new bytes while the platform still pins the
old hash. Anyone starting a fresh session in that window will not see your
extension; a reload after step 3 fixes it. Sessions already running are unaffected,
because a loaded bundle is never re-fetched. **Release in a maintenance window.**

---

## Reading a verdict

Three outcomes, and the middle one is not a failure:

| Verdict    | Loads?  | Meaning                                                                            |
| ---------- | ------- | ---------------------------------------------------------------------------------- |
| `approved` | yes     | No findings, or only informational ones                                            |
| `flagged`  | **yes** | Findings were recorded. It loads normally                                          |
| `rejected` | no      | Something disqualifying — a failed fetch, absent source maps, a disqualifying rule |

Read the **severity** of each finding, not merely its presence. A finding at `info`
contributes nothing to the verdict.

Expect a `size-delta` flag on your first 0.2.x submission. Taking the SDK out of
`shared` moves it into your bundle, and the analyser notes sharp size changes
against your last approved version. That is correct behaviour and needs no action.

---

## If something does not work

**Verified, but nothing appears.** Check the app is **Enabled** first. A disabled app
is filtered out before it is ever loaded, so it registers no routes and no zones
while still showing a healthy verification chip.

**`rejected` with `fetch-failed`.** The platform could not read the URL. Check the
stored remote entry URL character by character — a stray character from a
copy-paste produces a 404, and nothing readable means nothing pinnable.

**Saving the same version again does nothing.** The platform refuses to re-verify an
`(extension, version)` pair it has already judged, and the portal stays quiet about
it because that normally means "already verified". Bump the version.

**Your module must be exposed as `./App`.** The host requests that exact name and no
other. A bundle exposing anything else can verify perfectly and still never render.

---

## What this does not change

This migration is about the build and publish contract. It requires no changes to
your app's features, its routes, its zone extensions, or how it uses the SDK at
runtime. If one of your app's behaviours appears to conflict with a requirement
here, raise it rather than removing the behaviour.
