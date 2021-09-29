import { createAuth } from '@synonymdev/slashtags-auth';
import { secp256k1 as curve } from 'noise-curve-tiny-secp';
import * as SlashtagsURL from '@synonymdev/slashtags-url';
import bint from 'bint8array';

function App() {
  window.webAction = async (method, paramsString) => {
    const params = JSON.parse(paramsString);
    let result;
    try {
      switch (method) {
        case 'decode-url': {
          result = SlashtagsURL.parse(params.actionURL);
          break;
        }
        case 'create-key-pair': {
          result = curve.generateSeedKeyPair(params.seed);
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

          alert(1);

          const res = await fetch(url.toString());
          const { responderAttestation } = await res.json();

          alert(2);

          const { responderPK, metadata: resMetadata } = verifyResponder(
            Buffer.from(responderAttestation, 'hex'),
          );

          alert(3);


          result = {
            verified: true,
            metadata: resMetadata,
            responderPK: Buffer.from(responderPK).toString('hex'),
          };


          alert(JSON.stringify(result));
        }
      }
    } catch (e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ method, error: e.toString() }))
    }

    window.ReactNativeWebView.postMessage(JSON.stringify({ method, result }))
  };

  return (
    <div className="App">
      Don't look at me
    </div>
  );
}

export default App;
