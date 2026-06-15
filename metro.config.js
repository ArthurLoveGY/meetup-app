const { getDefaultConfig } = require('expo/metro-config')
const { getMetroConfig } = require('@tarojs/rn-supporter')
const path = require('path')

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {}

module.exports = (async function () {
  const defaultConfig = await getDefaultConfig(__dirname)
  const taroConfig = await getMetroConfig()

  // Merge Taro RN config into Expo default config
  return {
    ...defaultConfig,
    ...taroConfig,
    transformer: {
      ...defaultConfig.transformer,
      ...taroConfig.transformer,
      // Use custom transformer that handles SCSS → StyleSheet.create() correctly
      babelTransformerPath: path.resolve(__dirname, 'custom-metro-transformer.js'),
    },
    resolver: {
      ...defaultConfig.resolver,
      ...taroConfig.resolver,
      // Merge sourceExts and assetExts arrays
      sourceExts: [
        ...new Set([
          ...(defaultConfig.resolver?.sourceExts || []),
          ...(taroConfig.resolver?.sourceExts || []),
        ]),
      ],
      assetExts: [
        ...new Set([
          ...(defaultConfig.resolver?.assetExts || []),
          ...(taroConfig.resolver?.assetExts || []),
        ]),
      ],
    },
    server: {
      ...defaultConfig.server,
      ...taroConfig.server,
    },
  }
})()
