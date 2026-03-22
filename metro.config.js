const { getDefaultConfig } = require("expo/metro-config");
const { withTamagui } = require("@tamagui/metro-plugin");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("wasm");

module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./src/theme/tamagui.config.ts",
  outputCSS: "./src/theme/tamagui-web.css",
});
