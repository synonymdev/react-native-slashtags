/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useContext, useEffect, useRef, useState} from 'react';
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
  TSetupParams,
  TKeyPairResult,
  TSetProfileParams,
} from '@synonymdev/react-native-slashtags';
import JSONTree from 'react-native-json-tree';
import SlashtagsProvider from './SlashtagsProvider';
import Demo from './src/Demo';

const App = () => {
  return (
    <SlashtagsProvider>
      <Demo />
      {/*<View>*/}
      {/*  <Text>REF: {JSON.stringify(divRef?.current && divRef.current)}</Text>*/}
      {/*  <Button*/}
      {/*    title={'Setup profile APP'}*/}
      {/*    onPress={async () => {*/}
      {/*      try {*/}
      {/*        const res = await divRef.current.parseUrl(*/}
      {/*          'slashauth://i5ubvtggukkuxdhyv7rkxtj2a2dulonpcurt4ftq4kot5nnkhdna?q=ij2c7zf9gu',*/}
      {/*        );*/}
      {/*        alert(JSON.stringify(res));*/}
      {/*      } catch (e) {*/}
      {/*        alert(e);*/}
      {/*      }*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</View>*/}
    </SlashtagsProvider>
  );
};

export default App;

// const App: () => Node = () => {
//   const [message, setMessage] = useState('');
//   const [seed, setSeed] = useState('');
//   const [keyPairResult, setKeyPairResult] = useState<TKeyPairResult>(undefined);
//   const [setupParams, setSetupParams] = useState<TSetupParams>(undefined);
//   const [setupSdkResult, setSetupSdkResult] = useState(false);
//   const [url, setUrl] = useState('');
//   const [profile, setProfile] = useState<TSetProfileParams>(undefined);
//   const [profileResult, setProfileResult] = useState<TSetProfileResult>({});
//   const [parseResult, setParseResult] = useState<TUrlParseResult>(undefined);
//   const [authResult, setAuthResult] = useState<TSlashUrlResult>({});
//   const [state, setState] = useState<any>({});
//   const [input, setInput] = useState(
//     'slashauth://i5ubvtggukkuxdhyv7rkxtj2a2dulonpcurt4ftq4kot5nnkhdna?q=ij2c7zf9gu',
//   );
//
//   const slashContext = useContext(SlashtagsContext);
//   const [divRef, setDivRef] = useState();
//   useEffect(() => {
//     console.info(slashContext);
//     setDivRef(slashContext);
//   }, [slashContext]);
//
//   return (
//     <SlashtagsProvider>
//       <SafeAreaView>
//         <ScrollView>
//           <View style={styles.container}>
//             <Text style={styles.title}>Slashtags example</Text>
//
//             <Text>
//               REF: {JSON.stringify(divRef?.current && divRef.current)}
//             </Text>
//
//             <Button
//               title={'Setup profile'}
//               onPress={async () => {
//                 try {
//                   const res = await divRef.current.parseUrl(
//                     'slashauth://i5ubvtggukkuxdhyv7rkxtj2a2dulonpcurt4ftq4kot5nnkhdna?q=ij2c7zf9gu',
//                   );
//                   alert(JSON.stringify(res));
//                 } catch (e) {
//                   alert(e);
//                 }
//               }}
//             />
//
//             {/*<Slashtags*/}
//             {/*  onApiReady={() => setMessage('Slashtags Ready')}*/}
//             {/*  seed={seed}*/}
//             {/*  onKeyPair={setKeyPairResult}*/}
//             {/*  onKeyPairError={e => alert(`Keypair error: ${e.message}`)}*/}
//             {/*  setup={setupParams}*/}
//             {/*  onSetup={() => setSetupSdkResult({sdkReady: true})}*/}
//             {/*  onSetupError={e => alert(`Setup error: ${e.message}`)}*/}
//             {/*  url={url}*/}
//             {/*  onUrlParse={setParseResult}*/}
//             {/*  onUrlParseError={e => alert(`Parse error: ${e.message}`)}*/}
//             {/*  profile={profile}*/}
//             {/*  onProfileSet={setProfileResult}*/}
//             {/*  onProfileSetError={e => alert(`Profile error: ${e.message}`)}*/}
//             {/*/>*/}
//             {/*<Text>{message}</Text>*/}
//             {/*<TextInput*/}
//             {/*  placeholder={'Slashtags URL'}*/}
//             {/*  style={styles.input}*/}
//             {/*  value={input}*/}
//             {/*  onChangeText={setInput}*/}
//             {/*/>*/}
//             {/*<Button*/}
//             {/*  title={'Generate key pair'}*/}
//             {/*  onPress={async () => {*/}
//             {/*    setSeed(`todo ${new Date().getTime()}`);*/}
//             {/*  }}*/}
//             {/*/>*/}
//             {/*<Button*/}
//             {/*  title={'Parse URL'}*/}
//             {/*  onPress={async () => {*/}
//             {/*    setUrl(input);*/}
//             {/*  }}*/}
//             {/*/>*/}
//             {/*<Button*/}
//             {/*  title={'Setup SDK'}*/}
//             {/*  onPress={() => {*/}
//             {/*    if (!keyPairResult) {*/}
//             {/*      return alert('Create key pair first');*/}
//             {/*    }*/}
//
//             {/*    setSetupParams({*/}
//             {/*      primaryKey: keyPairResult.keyPair.secretKey,*/}
//             {/*      relays: ['ws://localhost:8888'],*/}
//             {/*    });*/}
//             {/*  }}*/}
//             {/*/>*/}
//             {/*<Button*/}
//             {/*  title={'Setup profile'}*/}
//             {/*  onPress={async () => {*/}
//             {/*    if (!setupSdkResult) {*/}
//             {/*      return setMessage('Setup SDK first');*/}
//             {/*    }*/}
//
//             {/*    setProfile({*/}
//             {/*      name: 'my-first-profile',*/}
//             {/*      basicProfile: {*/}
//             {/*        name: 'ReactNativeSlashtagsExample',*/}
//             {/*        type: 'Person',*/}
//             {/*      },*/}
//             {/*    });*/}
//
//             {/*    // try {*/}
//             {/*    //   const res = await slashRef.current.setProfile({*/}
//             {/*    //     name: 'my-first-profile',*/}
//             {/*    //     basicProfile: {*/}
//             {/*    //       name: 'ReactNativeSlashtagsExample',*/}
//             {/*    //       type: 'Person',*/}
//             {/*    //     },*/}
//             {/*    //   });*/}
//             {/*    //   setProfileResult(res);*/}
//             {/*    // } catch (e) {*/}
//             {/*    //   setMessage(e.toString());*/}
//             {/*    // }*/}
//             {/*  }}*/}
//             {/*/>*/}
//             {/*/!*  <Button*!/*/}
//             {/*/!*    title={'Auth'}*!/*/}
//             {/*/!*    onPress={async () => {*!/*/}
//             {/*/!*      try {*!/*/}
//             {/*/!*        const res = await slashRef.current.slashUrl(url);*!/*/}
//             {/*/!*        setAuthResult(res);*!/*/}
//             {/*/!*      } catch (e) {*!/*/}
//             {/*/!*        setMessage(e.toString());*!/*/}
//             {/*/!*      }*!/*/}
//             {/*/!*    }}*!/*/}
//             {/*/!*  />*!/*/}
//             {/*/!*  <Button*!/*/}
//             {/*/!*    title={'State'}*!/*/}
//             {/*/!*    onPress={async () => {*!/*/}
//             {/*/!*      const res = await slashRef.current.state({message: 'Hi from RN'});*!/*/}
//             {/*/!*      setState(res);*!/*/}
//             {/*/!*    }}*!/*/}
//             {/*/!*  />*!/*/}
//           </View>
//
//           {keyPairResult && (
//             <JSONTree data={keyPairResult} shouldExpandNode={() => true} />
//           )}
//           {parseResult && (
//             <JSONTree data={parseResult} shouldExpandNode={() => true} />
//           )}
//           {setupSdkResult && (
//             <JSONTree data={setupSdkResult} shouldExpandNode={() => true} />
//           )}
//           {profileResult && (
//             <JSONTree data={profileResult} shouldExpandNode={() => true} />
//           )}
//           {authResult && (
//             <JSONTree data={authResult} shouldExpandNode={() => true} />
//           )}
//           {state && <JSONTree data={state} shouldExpandNode={() => true} />}
//         </ScrollView>
//       </SafeAreaView>
//     </SlashtagsProvider>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     marginTop: 16,
//     paddingHorizontal: 24,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '600',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   input: {
//     backgroundColor: '#e8e8e8',
//     marginVertical: 10,
//   },
// });
//
// export default App;
