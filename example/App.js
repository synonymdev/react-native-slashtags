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
import {TSetupParams} from '@synonymdev/react-native-slashtags';
import {TKeyPairResult} from '@synonymdev/react-native-slashtags';

const App: () => Node = () => {
  const [message, setMessage] = useState('');
  const [seed, setSeed] = useState('');
  const [keyPair, setKeyPair] = useState<TKeyPairResult>(undefined);
  const [setupParams, setSetupParams] = useState<TSetupParams>(undefined);
  const [setupSdkResult, setSetupSdkResult] = useState(undefined);
  const [profileResult, setProfileResult] = useState<TSetProfileResult>({});
  const [parseResult, setParseResult] = useState<TUrlParseResult>({});
  const [authResult, setAuthResult] = useState<TSlashUrlResult>({});
  const [state, setState] = useState<any>({});
  const [url, setUrl] = useState(
    'slashauth://i5ubvtggukkuxdhyv7rkxtj2a2dulonpcurt4ftq4kot5nnkhdna?q=ij2c7zf9gu',
  );

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>Slashtags example</Text>
          <Slashtags
            onApiReady={() => setMessage('Slashtags Ready')}
            seed={seed}
            onKeyPair={setKeyPair}
            onKeyPairError={e => alert(`Keypair error: ${e.message}`)}
            setup={setupParams}
            onSetup={() => setSetupSdkResult({sdkReady: true})}
            onSetupError={e => alert(`Setup error: ${e.message}`)}
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
              setSeed(`todo ${new Date().getTime()}`);
            }}
          />
          {/*  <Button*/}
          {/*    title={'Parse URL'}*/}
          {/*    onPress={async () => {*/}
          {/*      try {*/}
          {/*        const res = await slashRef.current.parseUrl(url);*/}
          {/*        setParseResult(res);*/}
          {/*      } catch (e) {*/}
          {/*        setMessage(e);*/}
          {/*      }*/}
          {/*    }}*/}
          {/*  />*/}
          <Button
            title={'Setup SDK'}
            onPress={() => {
              if (!keyPair) {
                return alert('Create key pair first');
              }

              setSetupParams({
                primaryKey: 'keyPair.secretKey',
                relays: ['ws://localhost:8888'],
              });
            }}
          />
          {/*  <Button*/}
          {/*    title={'Setup profile'}*/}
          {/*    onPress={async () => {*/}
          {/*      if (!keyPair) {*/}
          {/*        return setMessage('Create key pair first');*/}
          {/*      }*/}
          {/*      try {*/}
          {/*        const res = await slashRef.current.setProfile({*/}
          {/*          name: 'my-first-profile',*/}
          {/*          basicProfile: {*/}
          {/*            name: 'ReactNativeSlashtagsExample',*/}
          {/*            type: 'Person',*/}
          {/*          },*/}
          {/*        });*/}
          {/*        setProfileResult(res);*/}
          {/*      } catch (e) {*/}
          {/*        setMessage(e.toString());*/}
          {/*      }*/}
          {/*    }}*/}
          {/*  />*/}
          {/*  <Button*/}
          {/*    title={'Auth'}*/}
          {/*    onPress={async () => {*/}
          {/*      try {*/}
          {/*        const res = await slashRef.current.slashUrl(url);*/}
          {/*        setAuthResult(res);*/}
          {/*      } catch (e) {*/}
          {/*        setMessage(e.toString());*/}
          {/*      }*/}
          {/*    }}*/}
          {/*  />*/}
          {/*  <Button*/}
          {/*    title={'State'}*/}
          {/*    onPress={async () => {*/}
          {/*      const res = await slashRef.current.state({message: 'Hi from RN'});*/}
          {/*      setState(res);*/}
          {/*    }}*/}
          {/*  />*/}
        </View>

        {keyPair && <JSONTree data={keyPair} shouldExpandNode={() => true} />}
        {/*<JSONTree data={parseResult} shouldExpandNode={() => true} />*/}
        {setupSdkResult && (
          <JSONTree data={setupSdkResult} shouldExpandNode={() => true} />
        )}
        {/*<JSONTree data={profileResult} shouldExpandNode={() => true} />*/}
        {/*<JSONTree data={authResult} shouldExpandNode={() => true} />*/}
        {/*<JSONTree data={state} shouldExpandNode={() => true} />*/}
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
