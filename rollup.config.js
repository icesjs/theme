import * as path from 'path'
import * as fs from 'fs'
import cp from 'child_process'
import typescript from '@rollup/plugin-typescript'
import externals from 'rollup-plugin-node-externals'
import pkg from './package.json'

const isEnvDevelopment = process.env.NODE_ENV === 'development'
const input = 'src/index.ts'
const webpackPlugin = `@ices/theme-webpack-plugin`
const sourcemap = !isEnvDevelopment || 'inline'

function writeFileSync(filePath, content) {
  const unExistsDirs = []
  let file = filePath
  while (!fs.existsSync((file = path.dirname(file)))) {
    unExistsDirs.unshift(file)
  }
  for (const dir of unExistsDirs) {
    fs.mkdirSync(dir)
  }
  fs.writeFileSync(filePath, content)
}

function makeFakeThemeFile() {
  writeFileSync(
    path.join(path.resolve(path.dirname(pkg.main)), 'theme.js'),
    `// Auto generated code
throw new Error(
  \`Please add ThemeWebpackPlugin from '${webpackPlugin}' to your config of webpack first:
  // webpack.config.js
  const ThemeWebpackPlugin = require('${webpackPlugin}')
  module.exports = {
    plugins: [new ThemeWebpackPlugin()]
  }\`
)
`
  )
}

function makeTypesFile() {
  cp.execSync('yarn types', { stdio: 'ignore' })
}

function getPlugins(format, makeTypes) {
  return [
    externals({
      builtins: true,
      deps: true,
      peerDeps: true,
      exclude: 'tslib',
    }),
    typescript({
      removeComments: !isEnvDevelopment,
      noUnusedLocals: !isEnvDevelopment,
      target: format === 'es' ? 'esnext' : 'es5',
    }),
    makeTypes && {
      name: 'make-types',
      generateBundle: makeTypesFile,
    },
  ].filter(Boolean)
}

makeFakeThemeFile()

export default [
  {
    input,
    external: ['./theme'],
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap,
    },
    plugins: getPlugins('es'),
  },
  {
    input,
    external: ['./theme'],
    output: {
      file: pkg.main,
      exports: 'auto',
      format: 'cjs',
      sourcemap,
    },
    plugins: getPlugins('cjs', true),
  },
]
