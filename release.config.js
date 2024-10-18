/* global module */
module.exports = {
  extends: 'scratch-semantic-release-config',
  branches: [
    {
      name: 'develop'
      // default channel
    },
    {
      name: 'alpha',
      prerelease: true
    },
    {
      name: 'beta',
      prerelease: true
    }
  ]
};
