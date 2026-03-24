const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add .wasm to asset extensions so Metro can resolve wa-sqlite.wasm for expo-sqlite web support
config.resolver.assetExts.push('wasm');

module.exports = withNativewind(config, {
  input: './src/global.css',
});
