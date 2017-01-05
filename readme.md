# Lighthouse  [![Build Status](https://travis-ci.org/GoogleChrome/lighthouse.svg?branch=master)](https://travis-ci.org/GoogleChrome/lighthouse) [![Coverage Status](https://coveralls.io/repos/github/GoogleChrome/lighthouse/badge.svg?branch=master)](https://coveralls.io/github/GoogleChrome/lighthouse?branch=master)

> Lighthouse analyzes web apps and web pages, collecting modern performance metrics and insights on developer best practices.

HTML report:

![image](https://cloud.githubusercontent.com/assets/238208/21210165/b3c368c0-c22d-11e6-91fb-aa24959e2637.png)

Default CLI output:

![image](https://cloud.githubusercontent.com/assets/39191/19172762/60358d9a-8bd8-11e6-8c22-7fcb119ea0f5.png)

Lighthouse requires Chrome 52 or later.

## Install Chrome extension

Install from the Chrome Web Store: [chrome.google.com/webstore/detail/lighthouse/…](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk)

Quick-start guide on using the Lighthouse extension: http://bit.ly/lighthouse-quickstart

## Install CLI [![NPM lighthouse package](https://img.shields.io/npm/v/lighthouse.svg)](https://npmjs.org/package/lighthouse)

Requires Node v5+ or Node v4 w/ `--harmony`

```sh
npm install -g lighthouse
# or if you use yarn:
# yarn global add lighthouse
```

## Run
```sh
# Kick off a lighthouse run
lighthouse https://airhorner.com/

# see flags and options
lighthouse --help
```

## Lighthouse Viewer

If you run Lighthouse with the `--output=json` flag, it will generate a json dump of the run. You can view this report online by visiting http://googlechrome.github.io/lighthouse/viewer/ and dragging the file onto the app. Reports can also be shared by clicking the share icon in the top right corner and signing in to Github. 

Note: shared reports are stashed as a secret Gist in Github, under your account.

## Develop

#### Setup
```sh
git clone https://github.com/GoogleChrome/lighthouse

cd lighthouse
npm install

# The CLI is authored in TypeScript and requires compilation:
cd lighthouse-cli
npm install
npm run build

# To run the TS compiler in watch mode:
# cd lighthouse-cli && npm run dev
```

#### Run

```sh
node lighthouse-cli http://example.com
```

Geting started tip: `node --inspect --debug-brk lighthouse-cli http://example.com` to open up Chrome DevTools and step
through the entire app. See [Debugging Node.js with Chrome
DevTools](https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27#.59rma3ukm)
for more info.

## Custom run configuration

You can supply your own run configuration to customize what audits you want details on. Copy the [default.json](https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/default.json) and start customizing. Then provide to the CLI with `lighthouse --config-path=myconfig.json <url>`

## Custom audits and gatherers

The audits and gatherers checked into the lighthouse repo are available to any configuration. If you're interested in writing your own audits or gatherers, you can use them with Lighthouse without necessarily contributing upstream.

Better docs coming soon, but in the meantime look at [PR #593](https://github.com/GoogleChrome/lighthouse/pull/593), and the tests [valid-custom-audit.js](https://github.com/GoogleChrome/lighthouse/blob/3f5c43f186495a7f3ecc16c012ab423cd2bac79d/lighthouse-core/test/fixtures/valid-custom-audit.js) and [valid-custom-gatherer.js](https://github.com/GoogleChrome/lighthouse/blob/3f5c43f186495a7f3ecc16c012ab423cd2bac79d/lighthouse-core/test/fixtures/valid-custom-gatherer.js). If you have questions, please file an issue and we'll help out!

## Do Better Web

**Do Better Web** is an initiative within Lighthouse to help web developers modernize their existing web applications. By running a set of tests, developers can discover new web platform APIs, become aware of performance pitfalls, and learn (newer) best practices. In other words, do better on the web!

DBW is implemented as a set of standalone [gatherers](https://github.com/GoogleChrome/lighthouse/tree/master/lighthouse-core/gather/gatherers/dobetterweb) and [audits](https://github.com/GoogleChrome/lighthouse/tree/master/lighthouse-core/audits/dobetterweb) that are run alongside the core Lighthouse tests.

To run DBW, just run `lighthouse` against a URL. The tests show up under "Best Practices" in the report.

If you'd like to contribute, check the [list of issues](https://github.com/GoogleChrome/lighthouse/issues?q=is%3Aissue+is%3Aopen+label%3ADoBetterWeb) or propose a new audit by filing an issue.

## Lighthouse as trace processor

Lighthouse can be used to analyze trace and performance data collected from other tools (like WebPageTest and ChromeDriver). The `traces` and `performanceLog` artifact items can be provided using a string for the absolute path on disk. The perf log is captured from the Network domain (a la ChromeDriver's [`enableNetwork` option](https://sites.google.com/a/chromium.org/chromedriver/capabilities#TOC-perfLoggingPrefs-object)) and reformatted slightly. As an example, here's a trace-only run that's reporting on user timings and critical request chains:

##### `config.json`
```json
{
  "audits": [
    "user-timings",
    "critical-request-chains"
  ],

  "artifacts": {
    "traces": {
      "defaultPass": "/User/me/lighthouse/lighthouse-core/test/fixtures/traces/trace-user-timings.json"
    },
    "performanceLog": "/User/me/lighthouse/lighthouse-core/test/fixtures/traces/perflog.json"
  },

  "aggregations": [{
    "name": "Performance Metrics",
    "description": "These encapsulate your app's performance.",
    "scored": false,
    "categorizable": false,
    "items": [{
      "audits": {
        "user-timings": { "expectedValue": 0, "weight": 1 },
        "critical-request-chains": { "expectedValue": 0, "weight": 1}
      }
    }]
  }]
}
```

Then, run with: `lighthouse --config-path=config.json http://www.random.url`


## Lighthouse CLI options

```sh
$ lighthouse --help

lighthouse <url>

Logging:
  --verbose  Displays verbose logging                                                      [boolean]
  --quiet    Displays no progress or debug logs                                            [boolean]

Configuration:
  --disable-device-emulation    Disable device emulation                                   [boolean]
  --disable-cpu-throttling      Disable cpu throttling                                     [boolean]
  --disable-network-throttling  Disable network throttling                                 [boolean]
  --save-assets                 Save the trace contents & screenshots to disk              [boolean]
  --save-artifacts              Save all gathered artifacts to disk                        [boolean]
  --list-all-audits             Prints a list of all available audits and exits            [boolean]
  --list-trace-categories       Prints a list of all required trace categories and exits   [boolean]
  --config-path                 The path to the config JSON.
  --perf                        Use a performance-test-only configuration                  [boolean]

Output:
  --output       Reporter for the results
                         [choices: "pretty", "json", "html"]                     [default: "pretty"]
  --output-path  The file path to output the results
                 Example: --output-path=./lighthouse-results.html                [default: "stdout"]

Options:
  --help             Show help                                                             [boolean]
  --version          Show version number                                                   [boolean]
  --skip-autolaunch  Skip autolaunch of Chrome when accessing port 9222 fails              [boolean]
  --select-chrome    Interactively choose version of Chrome to use when multiple
                     installations are found                                          [boolean]
```

## Lighthouse w/ mobile devices

Lighthouse can run against a real mobile device. You can follow the [Remote Debugging on Android (Legacy Workflow)](https://developer.chrome.com/devtools/docs/remote-debugging-legacy) up through step 3.3, but the TL;DR is install & run adb, enable USB debugging, then port forward 9222 from the device to the machine with Lighthouse.

You'll likely want to use the CLI flags `--disable-device-emulation --disable-cpu-throttling` and potentially `--disable-network-throttling`.

```sh
$ adb kill-server

$ adb devices -l
* daemon not running. starting it now on port 5037 *
* daemon started successfully *
00a2fd8b1e631fcb       device usb:335682009X product:bullhead model:Nexus_5X device:bullhead

$ adb forward tcp:9222 localabstract:chrome_devtools_remote

$ lighthouse --disable-device-emulation --disable-cpu-throttling https://mysite.com
```

## Tests

Some basic unit tests forked are in `/test` and run via mocha. eslint is also checked for style violations.

```sh
# lint and test all files
npm test

# watch for file changes and run tests
#   Requires http://entrproject.org : brew install entr
npm run watch

## run linting and unit tests seprately
npm run lint
npm run unit
```

## Chrome Extension

The same audits are run against from a Chrome extension. See [./extension](https://github.com/GoogleChrome/lighthouse/tree/master/lighthouse-extension).


## Architecture

_Some incomplete notes_

#### Components
* **Driver** - Interfaces with [Chrome Debugging Protocol](https://developer.chrome.com/devtools/docs/debugger-protocol)  ([API viewer](https://chromedevtools.github.io/debugger-protocol-viewer/))
* **Gathers** - Requesting data from the browser (and maybe post-processing)
* **Artifacts** - The output of gatherers
* **Audits** - Non-performance evaluations of capabilities and issues. Includes a raw value and score of that value.
* **Metrics** - Performance metrics summarizing the UX
* **Diagnoses** - The perf problems that affect those metrics
* **Aggregators** - Pulling audit results, grouping into user-facing components (eg. `install_to_homescreen`) and applying weighting and overall scoring.

##### Internal module graph
![graph of lighthouse-core module dependencies](https://cloud.githubusercontent.com/assets/39191/19367685/04d4336a-9151-11e6-9ebb-3b87bdb09a4c.png)

<small><code>npm install -g js-vd; vd --exclude "node_modules|third_party|fs|path|url|log" lighthouse-core/ > graph.html</code></small>


### Protocol

* _Interacting with Chrome:_ The Chrome protocol connection maintained via [WebSocket](https://github.com/websockets/ws) for the CLI [`chrome.debuggger` API](https://developer.chrome.com/extensions/debugger) when in the Chrome extension.
* _Event binding & domains_: Some domains must be `enable()`d so they issue events. Once enabled, they flush any events that represent state. As such, network events will only issue after the domain is enabled. All the protocol agents resolve their `Domain.enable()` callback _after_ they have flushed any pending events. See example:

```js
// will NOT work
driver.sendCommand('Security.enable').then(_ => {
	driver.on('Security.securityStateChanged', state => { /* ... */ });
})

// WILL work! happy happy. :)
driver.on('Security.securityStateChanged', state => { /* ... */ }); // event binding is synchronous
driver.sendCommand('Security.enable');
```
* _Debugging the protocol_: Read [Better debugging of the Protocol](https://github.com/GoogleChrome/lighthouse/issues/184).

### Gatherers

* _Reading the DOM:_ We prefer reading the DOM right from the browser (See #77). The driver exposes a `querySelector` method that can be used along with a `getAttribute` method to read values.

### Audits

The return value of each audit takes this shape:

```js
Promise.resolve({
  name: 'audit-name',
  tags: ['what have you'],
  description: 'whatnot',
  // value: The score. Typically a boolean, but can be number 0-100
  value: 0,
  // rawValue: Could be anything, as long as it can easily be stringified and displayed,
  //   e.g. 'your score is bad because you wrote ${rawValue}'
  rawValue: {},
  // debugString: Some *specific* error string for helping the user figure out why they failed here.
  //   The reporter can handle *general* feedback on how to fix, e.g. links to the docs
  debugString: 'Your manifest 404ed',
  // fault:  Optional argument when the audit doesn't cover whatever it is you're doing,
  //   e.g. we can't parse your particular corner case out of a trace yet.
  //   Whatever is in `rawValue` and `score` would be N/A in these cases
  fault: 'some reason the audit has failed you, Anakin'
});
```

## Code Style

The `.eslintrc` defines all.

We're using [JSDoc](http://usejsdoc.org/) along with [closure annotations](https://developers.google.com/closure/compiler/docs/js-for-compiler). Annotations encouraged for all contributions.

`const` > `let` > `var`.  Use `const` wherever possible. Save `var` for emergencies only.

## Trace processing

The traceviewer-based trace processor from [node-big-rig](https://github.com/GoogleChrome/node-big-rig/tree/master/lib) was forked into Lighthouse. Additionally, the [DevTools' Timeline Model](https://github.com/paulirish/devtools-timeline-model) is available as well. There may be advantages for using one model over another.

**To update traceviewer source:**

```sh
cd lighthouse-core
# if not already there, clone catapult and copy license over
git clone --depth=1 https://github.com/catapult-project/catapult.git third_party/src/catapult
cp third_party/src/catapult/LICENSE third_party/traceviewer-js/
# pull for latest
git -C "./third_party/src/catapult/" pull
# run our conversion script
node scripts/build-traceviewer-module.js
```

<p align="center">
<img src="https://cloud.githubusercontent.com/assets/883126/13900813/10a62a14-edcc-11e5-8ad3-f927a592eeb0.png" height="300px"><br>
<b>Lighthouse</b>, ˈlītˌhous (n): a <s>tower or other structure</s> tool containing a beacon light to warn or guide <s>ships</s> developers at "sea".
</p>
