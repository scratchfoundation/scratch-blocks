/* global module */
module.exports = {
  extends: 'scratch-semantic-release-config',
  branches: [
    {
      name: 'develop'
      // default channel
    },
    {
      name: 'beta/*',
      channel: 'beta',
      prerelease: 'beta'
    },
    {
      name: 'hotfix/*',
      channel: 'hotfix',
      prerelease: 'hotfix'
    }
  ]
};
