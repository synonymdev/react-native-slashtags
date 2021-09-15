/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = {
  resolver: {
    extraNodeModules: {
      'sodium-native': path.resolve(
        __dirname,
        './node_modules/react-native-libsodium',
      ),
      'sodium-universal': path.resolve(
        __dirname,
        './node_modules/react-native-libsodium',
      ),
      crypto: path.resolve(__dirname, './node_modules/react-native-crypto'),
      os: path.resolve(__dirname, './node_modules/react-native-os'),
      'secp256k1-native': path.resolve(
        __dirname,
        './node_modules/tiny-secp256k1',
      ),
    },
    blacklistRE: exclusionList([/node_modules\/sodium-native\/.*/]),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
