// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web build loads its SQLite engine as a .wasm file at runtime; Metro doesn't
// treat .wasm as a bundleable asset by default, which breaks `npm run web` with
// "Unable to resolve module .../wa-sqlite.wasm".
config.resolver.assetExts.push('wasm');

module.exports = config;
