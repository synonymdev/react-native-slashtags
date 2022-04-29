import {SlashtagsContext} from '@synonymdev/react-native-slashtags';
import React, {useContext, useEffect, useState} from 'react';
import {
  Button,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import {
  THexKeyPair,
  TSetProfileResult,
  TSlashUrlResult,
  TUrlParseResult,
} from '@synonymdev/react-native-slashtags';
import JSONTree from 'react-native-json-tree';

const Demo = () => {
  const [message, setMessage] = useState('');
  const [keyPair, setKeyPair] = useState<THexKeyPair>(undefined);
  const [setupSdkResult, setSetupSdkResult] = useState(undefined);
  const [profileResult, setProfileResult] =
    useState<TSetProfileResult>(undefined);
  const [parseResult, setParseResult] = useState<TUrlParseResult>(undefined);
  const [authResult, setAuthResult] = useState<TSlashUrlResult>(undefined);
  const [state, setState] = useState<any>(undefined);
  const [url, setUrl] = useState('');

  const slashContext = useContext(SlashtagsContext);
  const [slashRef, setSlashRef] = useState();
  useEffect(() => {
    setSlashRef(slashContext);
  }, [slashContext]);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>Slashtags example</Text>

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

        {keyPair && (
          // @ts-ignore
          <JSONTree data={keyPair} shouldExpandNode={() => true} />
        )}
        {parseResult && (
          // @ts-ignore
          <JSONTree data={parseResult} shouldExpandNode={() => true} />
        )}
        {setupSdkResult && (
          // @ts-ignore
          <JSONTree data={setupSdkResult} shouldExpandNode={() => true} />
        )}
        {profileResult && (
          // @ts-ignore
          <JSONTree data={profileResult} shouldExpandNode={() => true} />
        )}
        {authResult && (
          // @ts-ignore
          <JSONTree data={authResult} shouldExpandNode={() => true} />
        )}
        {/*// @ts-ignore*/}
        {state && <JSONTree data={state} shouldExpandNode={() => true} />}
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
export default Demo;
