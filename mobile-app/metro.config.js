const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

module.exports = (async () => {
  const config = getDefaultConfig(projectRoot);

  // Only watch the mobile-app directory to avoid EMFILE errors and scanning outside
  config.watchFolders = [projectRoot];

  return config;
})();
