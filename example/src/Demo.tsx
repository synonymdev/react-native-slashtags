import {SlashtagsContext} from '../SlashtagsProvider';
import React, {useContext, useEffect, useState} from 'react';
import {Button, Text, View, SafeAreaView} from 'react-native';
import {
  THexKeyPair,
  TSetProfileResult,
  TSlashUrlResult,
  TUrlParseResult,
} from '@synonymdev/react-native-slashtags';

const Demo = () => {
  const [message, setMessage] = useState('');
  const [keyPair, setKeyPair] = useState<THexKeyPair>('');
  const [setupSdkResult, setSetupSdkResult] = useState({});
  const [profileResult, setProfileResult] = useState<TSetProfileResult>({});
  const [parseResult, setParseResult] = useState<TUrlParseResult>({});
  const [authResult, setAuthResult] = useState<TSlashUrlResult>({});
  const [state, setState] = useState<any>({});
  const [url, setUrl] = useState('');

  const slashContext = useContext(SlashtagsContext);
  const [slashRef, setSlashRef] = useState();
  useEffect(() => {
    setSlashRef(slashContext);
  }, [slashContext]);

  return (
    <SafeAreaView>
      <View>
        <Button
          title={'Setup profile (Buttons)'}
          onPress={async () => {
            try {
              const res = await slashRef.current.parseUrl(
                'slashauth://i5ubvtggukkuxdhyv7rkxtj2a2dulonpcurt4ftq4kot5nnkhdna?q=ij2c7zf9gu',
              );
              alert(JSON.stringify(res));
            } catch (e) {
              alert(e);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Demo;
