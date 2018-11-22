const gulp = require('gulp'),
    rollup = require('rollup').rollup;
    rollupTypescript = require('rollup-plugin-typescript2'),
    minify = require('rollup-plugin-babel-minify');

function rollupCompiler(isMminify) {
    const rollupOptions = {
        input: './html-editor.ts',
        external: ['rxjs', 'rxjs/operators'],
        plugins: [
            rollupTypescript({
                tsconfigOverride: {
                    compilerOptions: {
                        module: "ES2015",
                        removeComments: !!isMminify,
                    },
                    exclude: ["node_modules"]
                },
                clean: true,
            }),
        ]
    };
    if (isMminify) {
        rollupOptions.plugins.push(minify())
    }
    return rollup(rollupOptions).then(bundle => {
            return bundle.write({
                file: `html-editor.umd${isMminify? '.min': ''}.js`,
                format: 'umd',
                name: 'HTMLEditor',
                globals: {
                    rxjs: 'rxjs',
                    'rxjs/operators': 'rxjs.operators',
                },
                sourcemap: false,
            });
        });
}

gulp.task('build-umd', rollupCompiler.bind(null, false));

gulp.task('build-umd-min', rollupCompiler.bind(null, true));