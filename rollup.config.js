import typescriptPlugin from 'rollup-plugin-typescript2';

/** @type {import('rollup').GlobalsOption} */
const globalLibs = {
    'rxjs': 'rxjs',
    'rxjs/operators': 'rxjs.operators',
    'tslib': 'tslib',
};

/** @type {import('rollup').RollupOptions} */
module.exports = {
    input: `./src/index.ts`,
    output: {
        name: `HTMLEditor`,
        globals: globalLibs,
        format: 'esm',
        file: `dist/index.js`,
        sourcemap: true,
    },
    external: Object.keys(globalLibs),
    plugins: [
        typescriptPlugin(),
    ],
};
