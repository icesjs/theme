import * as cp from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import typescript from '@rollup/plugin-typescript'
import externals from 'rollup-plugin-node-externals'
import pkg from './package.json'

const isEnvDevelopment = process.env.NODE_ENV === 'development'
const input = 'src/index.ts'
const webpackInput = 'src/webpack/index.ts'
const webpackOutputDir = 'lib/webpack'
const webpackPlugin = `${pkg.name}/${webpackOutputDir}`
const sourcemap = !isEnvDevelopment || 'inline'

const makeFakeThemeFile = () => {
  const dir = path.resolve(path.dirname(pkg.main))
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  fs.writeFileSync(
    path.join(dir, 'theme.js'),
    `
throw new Error(
  \`Please add ThemeWebpackPlugin from '${webpackPlugin}' to your config of webpack first:
  // webpack.config.js
  const ThemeWebpackPlugin = require('${webpackPlugin}')
  module.exports = {
    plugins: [ThemeWebpackPlugin]
  }\`
)
`
  )
}

function getPlugins(format, target) {
  const plugins = [
    externals({
      builtins: true,
      deps: true,
      peerDeps: true,
    }),
    typescript({
      removeComments: !isEnvDevelopment,
      noUnusedLocals: !isEnvDevelopment,
      target: target || (format === 'es' ? 'esnext' : 'es5'),
    }),
  ]
  if (format === 'es') {
    if (isEnvDevelopment) {
      plugins.push({
        generateBundle: () => cp.execSync('yarn types', { stdio: 'ignore' }),
      })
      makeFakeThemeFile()
    } else {
      plugins.push({
        buildEnd: (err) => {
          if (!err) {
            makeFakeThemeFile()
          }
        },
      })
    }
  }
  return plugins
}

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
      format: 'cjs',
      exports: 'auto',
      sourcemap,
    },
    plugins: getPlugins('cjs'),
  },
  {
    input: webpackInput,
    output: {
      dir: webpackOutputDir,
      preserveModules: true,
      format: 'cjs',
      exports: 'auto',
      sourcemap,
    },
    plugins: getPlugins('cjs', 'es2018'),
  },
]
