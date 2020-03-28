require('dotenv').config()
const appCfg = require('./config/server')

const glob = require('glob')

const PurgecssPlugin = require('purgecss-webpack-plugin')

export default (config, env, helpers) => {
  if (env.production) {
    // Disable sourcemaps
    config.devtool = false
  } else {
    config.devServer.proxy = {
      '/api': 'http://localhost:3000'
    }
  }

  // The webpack base config has minicssextractplugin already loaded
  config.plugins.push(
    new PurgecssPlugin({
      paths: glob.sync(env.source('**/*'), { nodir: true })
    })
  )

  // Remove .svg from preconfigured webpack file-loader
  const fileLoader = helpers.getLoadersByName(config, 'file-loader')
  fileLoader.map(entry => { entry.rule.test = /\.(woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i })

  const urlLoader = helpers.getLoadersByName(config, 'url-loader')
  urlLoader.map(entry => { entry.rule.test = /\.(woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i })

  config.module.rules.push({
    test: /\.svg$/,
    loader: 'preact-svg-loader'
  })

  const HtmlWebpackPluginWrapper = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0]
  if (HtmlWebpackPluginWrapper !== undefined) {
    const HtmlWebpackPlugin = HtmlWebpackPluginWrapper.plugin
    HtmlWebpackPlugin.options.view = {
      ctfName: appCfg.ctfName
    }
  }
}
