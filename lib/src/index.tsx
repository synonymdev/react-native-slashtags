import React, { useEffect, forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Text } from 'react-native';

const webAppUrl = 'http://localhost:3000/';

type TWebViewResolve = (res: string) => void;
type TWebViewReject = (res: string) => void;

type TSlashtagsProps = {
	onResponse: TWebViewResolve;
};

const webCallPromises: { [key: string]: { resolve: TWebViewResolve; reject: TWebViewReject } } = {};

export const Slashtags = forwardRef(({ onResponse }: TSlashtagsProps, ref) => {
	let webViewRef = useRef<WebView>();
	const [msgIdNonce, setMsgIdNonce] = useState(0);

	const handleWebActionResponse = (event: WebViewMessageEvent): void => {
		const { msgId, method, result, error } = JSON.parse(event.nativeEvent.data);

		const cachedPromise = webCallPromises[msgId];
		if (cachedPromise) {
			if (error) {
				cachedPromise.reject(error);
			} else {
				cachedPromise.resolve(result);
			}
		}
	};

	const callWebAction = async (method: string, params: any): Promise<string> => {
		// TODO string will become the slashtag response
		const javascript = `
		        webAction('${msgIdNonce}', '${method}', '${JSON.stringify(params)}');
		        true;
		      `;
		setMsgIdNonce(msgIdNonce + 1);

		if (!webViewRef) {
			throw Error('webViewRef not set');
		}

		// @ts-expect-error it does exist
		webViewRef.injectJavaScript(javascript);

		return await new Promise(function (resolve: TWebViewResolve, reject: TWebViewReject) {
			webCallPromises[msgIdNonce] = { resolve, reject };
		});

		// TODO wait for response here
	};

	const setServerStarted = (started: boolean): void => {
		// TODO
		console.log(`WEB APP: ${started}`);
	};

	useImperativeHandle(ref, () => ({
		async callWeb() {
			return await callWebAction('todo', { time: new Date().toLocaleTimeString() });
		}
	}));

	return (
		<>
			<Text>This is a webview from the lib</Text>
			<WebView
				style={{ width: 100, height: 100, backgroundColor: 'red' }}
				ref={(r) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					webViewRef = r;
				}}
				source={{ uri: webAppUrl }}
				onLoad={() => setServerStarted(true)}
				onMessage={handleWebActionResponse}
			/>
		</>
	);
});
