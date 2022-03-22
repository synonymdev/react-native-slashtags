/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import '../shim.js';
import React, {useState} from 'react';
import {
  Button,
  SafeAreaView,
  StatusBar,
  Text,
  useColorScheme,
  NativeModules,
} from 'react-native';

import SlashtagsServer from './SlashtagsServer';
import SlashtagsWeb from './SlashtagsWeb';
import {WebView} from 'react-native-webview';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/*<SlashtagsServer />*/}
      <SlashtagsWeb />

      <Text>{message}</Text>
    </SafeAreaView>
  );
};

export default App;