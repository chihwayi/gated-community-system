const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..'); // .../gated-community-system

const normalizePathForRegex = (p) => p.replace(/[/\\]/g, '[\\/]');

const blockList = exclusionList([
  new RegExp(`${normalizePathForRegex(path.resolve(workspaceRoot, 'backend'))}[/\\\\].*`),
  new RegExp(`${normalizePathForRegex(path.resolve(workspaceRoot, 'web-portal'))}[/\\\\].*`),
  new RegExp(`${normalizePathForRegex(path.resolve(workspaceRoot, 'nginx'))}[/\\\\].*`),
  new RegExp(`${normalizePathForRegex(path.resolve(workspaceRoot, 'static'))}[/\\\\].*`),
  new RegExp(`${normalizePathForRegex(path.resolve(workspaceRoot, '.git'))}[/\\\\].*`),
]);

module.exports = (async () => {
  const config = getDefaultConfig(projectRoot);

  // Only watch the mobile-app directory to avoid EMFILE errors
  config.watchFolders = [projectRoot];
  config.resolver.blockList = blockList;

  return config;
})();
