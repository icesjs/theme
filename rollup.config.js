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
  const paths = ['types/react', 'types/vue']
  for (const p of paths) {
    const dir = path.resolve(p)
    if (fs.existsSync(dir)) {
      for (const dts of fs.readdirSync(dir)) {
        fs.renameSync(path.join(dir, dts), path.join(path.resolve(p.replace(/^types\//, '')), dts))
      }
    }
  }
}

function rewriteExternalPath(id, externals, lib) {
  for (const e of externals) {
    if (id === path.resolve(`src/${e}`)) {
      return path.relative(path.resolve(lib), path.resolve(`dist/${e}`)).replace(/\\/g, '/')
    }
  }
  return id
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
      removeComments: true,
      noUnusedLocals: !isEnvDevelopment,
      target: 'es5',
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
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap,
    },
    plugins: getPlugins('es'),
  },
  {
    input,
    output: {
      file: pkg.main,
      exports: 'auto',
      format: 'cjs',
      sourcemap,
    },
    plugins: getPlugins('cjs'),
  },
  {
    input: 'src/react/index.tsx',
    external: ['../index', '../theme'],
    output: {
      file: 'react/index.js',
      paths: (id) => rewriteExternalPath(id, ['index', 'theme'], 'react'),
      format: 'es',
      sourcemap,
    },
    plugins: getPlugins('es'),
  },
  {
    input: 'src/react/index.tsx',
    external: ['../index', '../theme'],
    output: {
      file: 'react/index.cjs.js',
      paths: (id) => rewriteExternalPath(id, ['index', 'theme'], 'react'),
      exports: 'auto',
      format: 'cjs',
      sourcemap,
    },
    plugins: getPlugins('cjs', true),
  },
]
