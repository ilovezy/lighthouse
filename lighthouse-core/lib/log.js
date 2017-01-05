/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const debug = require('debug');
const EventEmitter = require('events').EventEmitter;

// process.browser is set when browserify'd via the `process` npm module
const isBrowser = process.browser;

const colors = {
  red: isBrowser ? 'crimson' : 1,
  yellow: isBrowser ? 'gold' : 3,
  cyan: isBrowser ? 'darkturquoise' : 6,
  green: isBrowser ? 'forestgreen' : 2,
  blue: isBrowser ? 'steelblue' : 4,
  magenta: isBrowser ? 'palevioletred' : 5
};

// whitelist non-red/yellow colors for debug()
debug.colors = [colors.cyan, colors.green, colors.blue, colors.magenta];

class Emitter extends EventEmitter {
  /**
   * Fires off all status updates. Listen with
   * `require('lib/log').events.addListener('status', callback)`
   */
  issueStatus(title, args) {
    if (title === 'status' || title === 'statusEnd') {
      this.emit(title, args);
    }
  }

  /**
   * Fires off all warnings. Listen with
   * `require('lib/log').events.addListener('warning', callback)`
   */
  issueWarning(args) {
    this.emit('warning', args);
  }
}

const loggersByTitle = {};
const loggingBufferColumns = 25;

class Log {

  static _logToStdErr(title, argsArray) {
    const args = [...argsArray];
    const log = Log.loggerfn(title);
    log(...args);
  }

  static loggerfn(title) {
    let log = loggersByTitle[title];
    if (!log) {
      log = debug(title);
      loggersByTitle[title] = log;
      // errors with red, warnings with yellow.
      if (title.endsWith('error')) {
        log.color = colors.red;
      } else if (title.endsWith('warn')) {
        log.color = colors.yellow;
      }
    }
    return log;
  }

  static setLevel(level) {
    switch (level) {
      case 'silent':
        debug.disable();
        break;
      case 'verbose':
        debug.enable('*');
        break;
      case 'error':
        debug.enable('*:error');
        break;
      default:
        debug.enable('*, -*:verbose');
    }
  }

  /**
   * A simple formatting utility for event logging.
   * @param {string} prefix
   * @param {!Object} data A JSON-serializable object of event data to log.
   * @param {string=} level Optional logging level. Defaults to 'log'.
   */
  static formatProtocol(prefix, data, level) {
    const columns = (!process || process.browser) ? Infinity : process.stdout.columns;
    const maxLength = columns - data.method.length - prefix.length - loggingBufferColumns;
    // IO.read blacklisted here to avoid logging megabytes of trace data
    const snippet = (data.params && data.method !== 'IO.read') ?
      JSON.stringify(data.params).substr(0, maxLength) : '';
    Log._logToStdErr(`${prefix}:${level || ''}`, [data.method, snippet]);
  }

  static log(title) {
    Log.events.issueStatus(title, arguments);
    return Log._logToStdErr(title, Array.from(arguments).slice(1));
  }

  static warn(title) {
    Log.events.issueWarning(arguments);
    return Log._logToStdErr(`${title}:warn`, Array.from(arguments).slice(1));
  }

  static error(title) {
    return Log._logToStdErr(`${title}:error`, Array.from(arguments).slice(1));
  }

  static verbose(title) {
    Log.events.issueStatus(title);
    return Log._logToStdErr(`${title}:verbose`, Array.from(arguments).slice(1));
  }
}
Log.events = new Emitter();

module.exports = Log;
