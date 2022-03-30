/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useRef, useState} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
} from 'react-native';

import Slashtags from '@synonymdev/react-native-slashtags';

import {hexStringToBytes} from '@synonymdev/react-native-slashtags/dist/helpers';

const App: () => Node = () => {
  const slashRef = useRef();
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState(
    'slash://bq4aqaoqnddp57smqicd6ob3ntfrim6zhvjd5ji7v3aejoy423yhkutuh?act=1&tkt=zN1uoYa6AffN',
  );

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>Slashtags example</Text>
        <Slashtags ref={slashRef} onApiReady={() => setMessage('API ready')} />
        <Text>Message: {message}</Text>

        <TextInput style={styles.input} value={url} onChangeText={setUrl} />

        <Button
          title={'didKeyFromPubKey()'}
          onPress={async () => {
            const pubKey = hexStringToBytes(
              '0x6fcc37ea5e9e09fec6c83e5fbd7a745e3eee81d16ebd861c9e66f55518c19798',
            );
            const res = await slashRef.current.didKeyFromPubKey(pubKey);
            setMessage(JSON.stringify(res));
          }}
        />

        <Button
          title={'Auth'}
          onPress={async () => {
            try {
              const res = await slashRef.current.auth(
                url,
                (serverProfile, additionalItems) => {
                  setMessage(JSON.stringify(serverProfile));
                },
                (connection: any, additionalItems: any) => {
                  //TODO success
                  setMessage('Authenticated!');
                },
                error => {
                  setMessage(`Failed to auth (${error.message})`);
                },
              );

              setMessage(res);
            } catch (e) {
              setMessage(e.toString());
            }
          }}
        />

        <Button
          title={'selfTest'}
          onPress={async () => {
            const res = await slashRef.current.selfTest();
            setMessage(JSON.stringify(res));
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#e8e8e8',
    marginVertical: 20,
  },
});

export default App;
