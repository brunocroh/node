'use strict';

const common = require('../common');
const assert = require('node:assert');
const util = require('node:util');
const { WriteStream } = require('node:tty');

const styled = '\u001b[31mtest\u001b[39m';
const noChange = 'test';

[
  undefined,
  null,
  false,
  5n,
  5,
  Symbol(),
  () => {},
  {},
].forEach((invalidOption) => {
  assert.throws(() => {
    util.colorize.red(invalidOption);
  }, {
    code: 'ERR_INVALID_ARG_TYPE',
  }, invalidOption);
});

assert.strictEqual(
  util.colorize.red('test'),
  '\u001b[31mtest\u001b[39m',
);

assert.strictEqual(
  util.colorize.bold.red('test'),
  '\u001b[1m\u001b[31mtest\u001b[39m\u001b[22m',
);

assert.strictEqual(
  util.colorize.red('A' + util.colorize.blue('B') + 'C'),
  '\u001b[31mA\u001b[34mB\u001b[31mC\u001b[39m'
);

assert.strictEqual(
  util.colorize.red(
    'red' +
    util.colorize.blue('blue') +
    'red' +
    util.colorize.blue('blue') +
    'red',
  ),
  '\x1B[31mred\x1B[34mblue\x1B[31mred\x1B[34mblue\x1B[31mred\x1B[39m'
);

assert.strictEqual(
  util.colorize.red(
    'red' +
    util.colorize.blue('blue') +
    'red' +
    util.colorize.red('red') +
    'red' +
    util.colorize.blue('blue'),
  ),
  '\x1b[31mred\x1b[34mblue\x1b[31mred\x1b[31mred\x1b[31mred\x1b[34mblue\x1b[39m\x1b[39m'
);

assert.strictEqual(
  util.colorize.red('A' + util.colorize.bgRed.blue('B') + 'C'),
  '\x1B[31mA\x1B[41m\x1B[34mB\x1B[31m\x1B[49mC\x1B[39m'
);

assert.strictEqual(
  util.colorize.dim(
    'dim' +
    util.colorize.bold('bold') +
    'dim'
  ),
  '\x1B[2mdim\x1B[1mbold\x1B[22m\x1B[2mdim\x1B[22m'
);

assert.strictEqual(
  util.colorize.blue(
    'blue' +
    util.colorize.red(
      'red' +
      util.colorize.green('green') +
      'red'
    ) +
    'blue'
  ),
  '\x1B[34mblue\x1B[31mred\x1B[32mgreen\x1B[31mred\x1B[34mblue\x1B[39m'
);

assert.strictEqual(
  util.colorize.red(
    'red' +
    util.colorize.blue(
      'blue' +
      util.colorize.red('red') +
      'blue',
    ) +
    'red',
  ),
  '\x1b[31mred\x1b[34mblue\x1b[31mred\x1b[34mblue\x1b[31mred\x1b[39m'
);

assert.strictEqual(
  util.colorize.bold.red('test'),
  util.colorize.bold(util.colorize.red('test')),
);

assert.strictEqual(
  util.colorize.red('test'),
  styled,
);

const fd = common.getTTYfd();
if (fd !== -1) {
  const originalEnv = process.env;

  [
    { env: {}, expected: styled },
    { env: { NODE_DISABLE_COLORS: '1' }, expected: noChange },
    { env: { NO_COLOR: '1' }, expected: noChange },
    { env: { FORCE_COLOR: '1' }, expected: styled },
    { env: { FORCE_COLOR: '1', NODE_DISABLE_COLORS: '1' }, expected: styled },
    { env: { FORCE_COLOR: '1', NO_COLOR: '1', NODE_DISABLE_COLORS: '1' }, expected: styled },
    { env: { FORCE_COLOR: '1', NO_COLOR: '1', NODE_DISABLE_COLORS: '1' }, expected: styled },
  ].forEach((testCase) => {
    process.env = {
      ...process.env,
      ...testCase.env
    };
    {
      const output = util.colorize.red('test');
      assert.strictEqual(output, testCase.expected);
    }
    {
      // Check that when passing an array of styles, the output behaves the same
      const output = util.colorize.red('test');
      assert.strictEqual(output, testCase.expected);
    }
    process.env = originalEnv;
  });
} else {
  common.skip('Could not create TTY fd');
}
