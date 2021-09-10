/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useState} from 'react';
import {
  Button,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import './shim.js';
import crypto from 'crypto';
import sodium from 'react-native-libsodium';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Button
        title={'Crypto test'}
        onPress={() => {
          const randomBytes = crypto.randomBytes(32).toString('base64');
          setMessage(`Random bytes:\n${randomBytes}`);
        }}
      />

      <Button
        title={'Sodium test'}
        onPress={() => {
          const key = sodium.sodium_malloc(sodium.crypto_kdf_KEYBYTES);
          setMessage(`Key:\n${JSON.stringify(key)}`);
        }}
      />

      <Text>{message}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default App;
