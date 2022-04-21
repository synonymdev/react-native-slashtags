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

import Slashtags, {
  THexKeyPair,
  TUrlParseResult,
  TSetProfileResult,
  TSlashUrlResult,
} from '@synonymdev/react-native-slashtags';
import JSONTree from 'react-native-json-tree';

const App: () => Node = () => {
  const slashRef = useRef();
  const [message, setMessage] = useState('');
  const [keyPair, setKeyPair] = useState<THexKeyPair>('');
  const [setupSdkResult, setSetupSdkResult] = useState({});
  const [profileResult, setProfileResult] = useState<TSetProfileResult>({});
  const [parseResult, setParseResult] = useState<TUrlParseResult>({});
  const [authResult, setAuthResult] = useState<TSlashUrlResult>({});
  const [state, setState] = useState<any>({});
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
            title={'Parse URL'}
            onPress={async () => {
              try {
                const res = await slashRef.current.parseUrl(url);
                setParseResult(res);
              } catch (e) {
                setMessage(e);
              }
            }}
          />

          <Button
            title={'Setup SDK'}
            onPress={async () => {
              if (!keyPair) {
                return setMessage('Create key pair first');
              }

              try {
                await slashRef.current.setupSDK({
                  primaryKey: keyPair.secretKey,
                  relays: ['ws://localhost:8888'],
                });
                setSetupSdkResult({sdkReady: true});
              } catch (e) {
                setMessage(e.toString());
              }
            }}
          />

          <Button
            title={'Setup profile'}
            onPress={async () => {
              if (!keyPair) {
                return setMessage('Create key pair first');
              }

              try {
                const res = await slashRef.current.setProfile({
                  name: 'my-first-profile',
                  basicProfile: {
                    name: 'ReactNativeSlashtagsExample',
                    type: 'Person',
                  },
                });
                setProfileResult(res);
              } catch (e) {
                setMessage(e.toString());
              }
            }}
          />

          <Button
            title={'Auth'}
            onPress={async () => {
              try {
                const res = await slashRef.current.slashUrl(url);
                setAuthResult(res);
              } catch (e) {
                setMessage(e.toString());
              }
            }}
          />

          <Button
            title={'State'}
            onPress={async () => {
              const res = await slashRef.current.state({message: 'Hi from RN'});
              setState(res);
            }}
          />
        </View>

        <JSONTree data={keyPair} shouldExpandNode={() => true} />
        <JSONTree data={parseResult} shouldExpandNode={() => true} />
        <JSONTree data={setupSdkResult} shouldExpandNode={() => true} />
        <JSONTree data={profileResult} shouldExpandNode={() => true} />
        <JSONTree data={authResult} shouldExpandNode={() => true} />
        <JSONTree data={state} shouldExpandNode={() => true} />
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
