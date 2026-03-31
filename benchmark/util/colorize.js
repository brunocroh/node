'use strict';

const common = require('../common.js');

const { colorize } = require('node:util');
const assert = require('node:assert');

const bench = common.createBenchmark(main, {
  messageType: ['string', 'invalid'],
  format: ['red', 'italic', 'invalid'],
  validateStream: [1, 0],
  n: [1e3],
});

function main({ messageType, format, validateStream, n }) {
  let str;
  switch (messageType) {
    case 'string':
      str = 'hello world';
      break;
    case 'invalid':
      str = undefined;
      break;
  }

  bench.start();
  for (let i = 0; i < n; i++) {
    let colored = '';
    try {
      colored = colorize[format](str);
      assert.ok(colored); // Attempt to avoid dead-code elimination
    } catch {
      // eslint-disable no-empty
    }
  }
  bench.end(n);
}
