import {ClassType} from "react";

declare global {
    interface Window {
        webAction: any;
        ReactNativeWebView: any;
    }
}


window.webAction = (msgId: string, method: string, paramsString: string) => {
    const params = JSON.parse(paramsString);

    const onResult = (result: any) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ msgId, method, result }))
    }

    const onError = (error: any) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ msgId, method, error: error.message || error.toString() }))
    }

    setTimeout(() => {
        onResult({todo: `Hello from web app after 1sec. You called ${method} as ${params.time}. msgId: ${msgId}`});
    }, 1000);

    // try {
    //     switch (method) {
    //         case 'decode-url': {
    //             onResult("TODO");
    //             break;
    //         }
    //         case 'create-key-pair': {
    //             onResult("TODO");
    //             break;
    //         }
    //     }
    // } catch (e) {
    //     onError(e);
    // }
};

function App() {
  return (
    <div className="App">
      ReactNative Slashtags web wrapper. Nothing to see here.
    </div>
  );
}

export default App;
