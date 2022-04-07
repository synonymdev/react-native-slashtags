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
  ScrollView,
} from 'react-native';

import Slashtags, {THexKeyPair} from '@synonymdev/react-native-slashtags';
import JSONTree from 'react-native-json-tree';

const App: () => Node = () => {
  const slashRef = useRef();
  const [message, setMessage] = useState('');
  const [keyPair, setKeyPair] = useState<THexKeyPair>('');
  const [did, setDid] = useState<THexKeyPair>('');
  const [authResult, setAuthResult] = useState<THexKeyPair>({});
  const [url, setUrl] = useState('');

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>Slashtags example</Text>
          <Slashtags
            ref={slashRef}
            onApiReady={() => setMessage('Slashtags API ready')}
          />
          <Text>{message}</Text>

          <TextInput
            placeholder={'Slashtags URL'}
            style={styles.input}
            value={url}
            onChangeText={setUrl}
          />

          <Button
            title={'Generate key pair'}
            onPress={async () => {
              const res = await slashRef.current.generateSeedKeyPair(
                `todo ${new Date().getTime()}`,
              );
              setKeyPair(res);
            }}
          />

          <Button
            title={'didKeyFromPubKey()'}
            onPress={async () => {
              const res = await slashRef.current.didKeyFromPubKey(
                keyPair.publicKey,
              );
              setDid(res);
            }}
          />

          <Button
            title={'Auth'}
            onPress={async () => {
              if (!keyPair || !did) {
                return alert('First generate a key pair and DID');
              }

              const profile = {
                '@id': did,
                '@context': 'https://schema.org',
                '@type': 'Person',
                name: 'ReactNative Demo',
                image: 'https://www.example.com/logo.png',
              };

              try {
                const res = await slashRef.current.auth(url, keyPair, profile);
                setAuthResult(res);
              } catch (e) {
                setMessage(e.toString());
              }
            }}
          />

          <Button
            title={'selfTest'}
            onPress={async () => {
              const res = await slashRef.current.selfTest();
              setMessage(res);
            }}
          />
        </View>

        <JSONTree data={keyPair} shouldExpandNode={() => true} />
        <JSONTree data={did} shouldExpandNode={() => true} />
        <JSONTree data={authResult} shouldExpandNode={() => true} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#e8e8e8',
    marginVertical: 10,
  },
});

export default App;
