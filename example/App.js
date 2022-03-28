/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useRef, useState} from 'react';
import type {Node} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Button} from 'react-native';

import {Slashtags} from '@synonymdev/react-native-slashtags';

const App: () => Node = () => {
  const slashRef = useRef();
  const [res, setRes] = useState('');

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>Slashtags example</Text>
        <Slashtags
          ref={slashRef}
          onResponse={res => setRes(JSON.stringify(res))}
        />
        <Text>Web res: {res}</Text>

        <Button
          title={'Press me'}
          onPress={async () => {
            const res = await slashRef.current.callWeb();
            alert(JSON.stringify(res));
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
});

export default App;
