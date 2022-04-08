# react-native-slashtags

:warning: This is under active development. Please use as your own risk.

## Description

An easy-to-implement React Native wrapper for [Slashtags](https://github.com/synonymdev/slashtags).

## Getting started

```bash
yarn add @synonymdev/react-native-slashtags react-native-webview
#or
npm i -s @synonymdev/react-native-slashtags react-native-webview

# iOS installation
cd ios && pod install && cd ../
```

## Usage

```javascript
import Slashtags from "@synonymdev/react-native-slashtags";
```

```javascript
const App: () => Node = () => {
  // Reference used to call all available Slashtags functions
  const slashRef = useRef();

  // Slashtags component must be included once in your app. Prefereably in the app root.
  return (
    <View>
      <Slashtags
        ref={slashRef}
        onApiReady={() => setMessage("Slashtags API ready")}
      />

      <Button
        title={"Self Test"}
        onPress={async () => {
          const res = await slashRef.current.selfTest();
          alert(res);
        }}
      />
    </View>
  );
};
```

## Project breakdown

- [lib](https://github.com/synonymdev/react-native-slashtags/tree/main/lib):
  The React Native package that is published to NPM. Responsible for interfacing with the bundled slashtags web app. This will include the prebuilt web app containing all the actual code.
- [web](https://github.com/synonymdev/react-native-slashtags/tree/main/web):
  A simple web app responsible for executing all Slashtags logic and communicating results back to the React Native library.
- [example](https://github.com/synonymdev/react-native-slashtags/tree/main/example):
  An example React Native app demonstrating all available functionality

## Development

### 1. Build web app

```shell
 cd web
 yarn && yarn build
 cd ../
```

### 2. Bundle web app code into React Native lib

```shell
 # From root dir bundle up the web app into a javascript file (lib/src/web-interface.ts)
 node post-build-bundle.js
```

### 3. Run example

```shell
cd example
yarn && yarn add ../lib
yarn ios
# or
yarn android
```

### 4. Adding functions
1. Add method to web app [Interface.tsx](https://github.com/synonymdev/react-native-slashtags/blob/96673a60742a79f05aeafebe86d2857ed4c2c79f/web/src/Interface.tsx#L39)
2. Add corresponding React Native method in lib [index.tsx](https://github.com/synonymdev/react-native-slashtags/blob/96673a60742a79f05aeafebe86d2857ed4c2c79f/lib/src/index.tsx#L77)
