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

 /**
  * @fileoverview
  *   Identifies stylesheets, HTML Imports, and scripts that potentially block
  *   the first paint of the page by running several scripts in the page context.
  *   Candidate blocking tags are collected by querying for all script tags in
  *   the head of the page and all link tags that are either matching media
  *   stylesheets or non-async HTML imports. These are then compared to the
  *   network requests to ensure they were initiated by the parser and not
  *   injected with script. To avoid false positives from strategies like
  *   (http://filamentgroup.github.io/loadCSS/test/preload.html), a separate
  *   script is run to flag all links that at one point were rel=preload.
  */

'use strict';

const Gatherer = require('../gatherer');

/* global document,window */

/* istanbul ignore next */
function saveAsyncLinks() {
  function checkForLinks() {
    document.querySelectorAll('link').forEach(link => {
      if (link.rel === 'preload' || link.disabled) {
        window.__asyncLinks[link.href] = true;
      }
    });
  }

  window.__asyncLinks = window.__asyncLinks || {};
  setInterval(checkForLinks, 100);
  checkForLinks();
}

/* istanbul ignore next */
function collectTagsThatBlockFirstPaint() {
  return new Promise((resolve, reject) => {
    try {
      const tagList = [...document.querySelectorAll('link, head script[src]')]
        .filter(tag => {
          if (tag.tagName === 'SCRIPT') {
            return !tag.hasAttribute('async') &&
                !tag.hasAttribute('defer') &&
                !/^data:/.test(tag.src);
          }

          // Filter stylesheet/HTML imports that block rendering.
          // https://www.igvita.com/2012/06/14/debunking-responsive-css-performance-myths/
          // https://www.w3.org/TR/html-imports/#dfn-import-async-attribute
          const blockingStylesheet = (tag.rel === 'stylesheet' &&
              window.matchMedia(tag.media).matches && !tag.disabled);
          const blockingImport = tag.rel === 'import' && !tag.hasAttribute('async');
          return blockingStylesheet || blockingImport;
        })
        .map(tag => {
          return {
            tagName: tag.tagName,
            url: tag.tagName === 'LINK' ? tag.href : tag.src,
            src: tag.src,
            href: tag.href,
            rel: tag.rel,
            media: tag.media,
            disabled: tag.disabled
          };
        })
        .filter(tag => !window.__asyncLinks[tag.url]);
      resolve(tagList);
    } catch (e) {
      const friendly = 'Unable to gather Scripts/Stylesheets/HTML Imports on the page';
      reject(new Error(`${friendly}: ${e.message}`));
    }
  });
}

function filteredAndIndexedByUrl(networkRecords) {
  return networkRecords.reduce((prev, record) => {
    // Filter stylesheet, javascript, and html import mimetypes.
    const isHtml = record._mimeType.indexOf('html') > -1;
    // A stylesheet only blocks script if it was initiated by the parser
    // https://html.spec.whatwg.org/multipage/semantics.html#interactions-of-styling-and-scripting
    const isParserScriptOrStyle = /(css|script)/.test(record._mimeType) &&
        record._initiator.type === 'parser';
    if (isHtml || isParserScriptOrStyle) {
      prev[record._url] = {
        transferSize: record._transferSize,
        startTime: record._startTime,
        endTime: record._endTime
      };
    }
    return prev;
  }, {});
}

class TagsBlockingFirstPaint extends Gatherer {
  constructor() {
    super();
    this._filteredAndIndexedByUrl = filteredAndIndexedByUrl;
  }

  static findBlockingTags(driver, networkRecords) {
    const scriptSrc = `(${collectTagsThatBlockFirstPaint.toString()}())`;
    return driver.evaluateAsync(scriptSrc).then(tags => {
      const requests = filteredAndIndexedByUrl(networkRecords);

      let totalTransferSize = 0;
      let totalSpendTime = 0;

      const blockingTags = tags.reduce((prev, tag) => {
        const request = requests[tag.url];
        if (request) {
          const data = {
            tag,
            transferSize: request.transferSize,
            spendTime: Math.round((request.endTime - request.startTime) * 1000)
          };
          totalTransferSize += data.transferSize;
          totalSpendTime += data.spendTime;
          prev.push(data);
        }
        return prev;
      }, []);

      return {
        items: blockingTags,
        total: {
          transferSize: totalTransferSize,
          spendTime: totalSpendTime
        }
      };
    });
  }

  beforePass(options) {
    const scriptSrc = `(${saveAsyncLinks.toString()})()`;
    return options.driver.evaluateScriptOnLoad(scriptSrc);
  }

  afterPass(options, tracingData) {
    return TagsBlockingFirstPaint
      .findBlockingTags(options.driver, tracingData.networkRecords)
      .catch(err => {
        return {
          value: -1,
          debugString: err.message
        };
      });
  }
}

module.exports = TagsBlockingFirstPaint;
