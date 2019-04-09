const rollup = require('rollup');
const fs = require('fs');

const typescript = require('rollup-plugin-typescript2');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify').uglify;

const rootPath = process.cwd();
// const assetsPath = `${rootPath}/src/assets`;

const playerOutputPath = `${rootPath}/src/assets/player`;
const playerEntryPath = `${rootPath}/player`;

const inputOptions = {
    input: `${playerEntryPath}/entry_point.ts`,
    plugins: [
        nodeResolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs({
            // if false then skip sourceMap generation for CommonJS modules
            sourceMap: false,
            namedExports: {
                'node_modules/lodash/lodash.js': [
                    'assign',
                    'merge',
                ],
                'node_modules/uuid/index.js': [
                    'v4'
                ]
            }
        }),
        typescript({clean: true}),
        uglify(),
    ],
};

const outputOptions = {
    // file: `${playerPath}/dist/bundle.js`,
    format: 'iife',
    name: 'Player'
};

(async function() {
    const bundle = await rollup.rollup(inputOptions);
    const { code } = await bundle.generate(outputOptions);
    const template = fs.readFileSync(`${playerEntryPath}/template.html`, 'utf8');

    const output = template.replace('{%INLINE_BUNDLE_PLACEHOLDER%}', code.replace('★', '\\u2605'));

    if (!fs.existsSync(playerOutputPath)) {
        fs.mkdirSync(playerOutputPath);
    }

    fs.writeFileSync(`${playerOutputPath}/index.html`, output, 'utf8')

})();

