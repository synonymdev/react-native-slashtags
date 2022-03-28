## Intro
lib dir is the actual wrapper library projects will install

## Usage
yarn add react-native-slashtags react-native-webview
cd ios && pod install && cd ../


Web view is required to execute the slashtags logic, react-native-slashtags is just the interface for RN.

## Development

From the web dir (Spin up the web app environment)
yarn start

From the lib dir
yarn build

From the example dir
yarn add ../lib && yarn start 