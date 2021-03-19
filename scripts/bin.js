#!/usr/bin/env node
// eslint-disable-next-line import/no-extraneous-dependencies
const { execSync } = require('child_process');

const register = require.resolve('esbuild-register');

const argv = process.argv
    .slice(2)
    .map((i) => `"${i}"`)
    .join(' ');

execSync(`node -r ${register} ./scripts/runner.ts ${argv}`, {
    stdio: 'inherit',
});
