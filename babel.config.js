module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    // Add these if needed (uncomment what you use):
    // '@babel/plugin-transform-class-properties',
    // '@babel/plugin-transform-object-rest-spread',
    // ['@babel/plugin-proposal-decorators', { legacy: true }], // Only if using decorators
    // 'react-native-reanimated/plugin' // Must be last if using Reanimated
  ],
};