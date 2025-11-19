// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Reduce the number of watched files by ignoring common directories
config.watchFolders = [__dirname];
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
];

// Increase max workers to handle file watching better
config.maxWorkers = 2;

module.exports = config;


