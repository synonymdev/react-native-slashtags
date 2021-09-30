import React, {useState, useEffect, useRef} from 'react';
import {Button, Text, TextInput, View} from 'react-native';

import {RNCamera} from 'react-native-camera';

const Scanner = ({onRead}: {onRead: Function}) => {
  const [_data, setData] = useState('');

  return (
    <RNCamera
      captureAudio={false}
      style={{
        flex: 1,
        backgroundColor: 'transparent',
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: 1000,
      }}
      onBarCodeRead={({data}): void => {
        if (_data !== data) {
          setData(data);
          onRead(data);
        }
      }}
      onMountError={(): void => {
        console.log(
          'An error was encountered when loading the camera. Please ensure Backpack has permission to use this feature in your phone settings.',
        );
        // onClose();
      }}
      notAuthorizedView={<Text>Missing camera permissions</Text>}
      type={RNCamera.Constants.Type.back}
      flashMode={RNCamera.Constants.FlashMode.on}
      androidCameraPermissionOptions={{
        title: 'Permission to use camera',
        message: 'Backpack needs permission to use your camera',
        buttonPositive: 'Okay',
        buttonNegative: 'Cancel',
      }}>
      {/*<View color={'transparent'} style={styles.content}>*/}
      {/*  {children}*/}
      {/*</View>*/}
    </RNCamera>
  );
};

export default Scanner;
