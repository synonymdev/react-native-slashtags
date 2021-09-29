yarn add react-native-crypto
yarn add react-native-randombytes

cd ios && pod install && cd ../

yarn add rn-nodeify -D
./node_modules/.bin/rn-nodeify --install os,crypto,assert,process,buffer,stream,events --hack
