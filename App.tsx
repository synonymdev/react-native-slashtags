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

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Button
        title={'Crypto test'}
        onPress={() => {
          setMessage(crypto.randomBytes(32).toString('base64'));
        }}
      />

      <Text>{message}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default App;
