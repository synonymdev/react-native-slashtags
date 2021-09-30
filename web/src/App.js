import { createAuth } from '@synonymdev/slashtags-auth';
import { secp256k1 as curve } from 'noise-curve-tiny-secp';
import * as SlashtagsURL from '@synonymdev/slashtags-url';
import bint from 'bint8array';

window.webAction = async (method, paramsString) => {
  const params = JSON.parse(paramsString);

  const onResult = (result) => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ method, result }))
  }

  const onError = (error) => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ method, error: error.message || error.toString() }))
  }

  try {
    switch (method) {
      case 'decode-url': {
        onResult(SlashtagsURL.parse(params.actionURL));
        break;
      }
      case 'create-key-pair': {
        onResult(curve.generateSeedKeyPair(params.seed));
        break;
      }
      case 'auth': {
        const {seed, metadata, authPayload} = params;

        const keyPair = curve.generateSeedKeyPair(seed);

        const { initiator } = createAuth(keyPair, { metadata });

        const { attestation, verifyResponder } = initiator.respond(
          bint.fromString(authPayload.remotePK, 'hex'),
          bint.fromString(authPayload.challenge, 'hex'),
        );

        const url = new URL(authPayload.cbURL);
        url.searchParams.set(
          'attestation',
          Buffer.from(attestation).toString('hex'),
        );

        const res = await fetch(url.toString());

        if (res.status !== 200) {
          onError(new Error(res.statusText));
          break;
        }

        const { responderAttestation } = await res.json();

        const { responderPK, metadata: resMetadata } = verifyResponder(
          Buffer.from(responderAttestation, 'hex'),
        );

        onResult({
          verified: true,
          metadata: resMetadata,
          responderPK: Buffer.from(responderPK).toString('hex'),
        });
      }
    }
  } catch (e) {
    onError(e);
  }
};

function App() {
  return (
    <div className="App">
      Don't look at me
    </div>
  );
}

export default App;
