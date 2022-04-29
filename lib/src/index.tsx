import React, { createContext, useContext, useRef } from 'react';
import RNInterface from './rn-interface';

export type THexKeyPair = { publicKey: string; secretKey: string };
export type TUrlParseResult = { protocol: string; key: string; query: any };
export type TBasicProfile = { type: string; name: string };
export type TSetupParams = {
	primaryKey: Uint8Array | string;
	relays: string[];
};
export type TSetProfileParams = {
	name: string;
	basicProfile: TBasicProfile;
};
export type TSetProfileResult = {
	name: string;
	isNew: boolean;
	slashtag: string;
};
export type TSlashUrlResult = { loginSuccess: boolean; loginError?: Error };

export const SlashtagsContext = createContext({ current: undefined }); // TODO set types

const SlashtagsContextStore = (props: any): JSX.Element => {
	const ref = useRef();
	return <SlashtagsContext.Provider value={ref}>{props.children}</SlashtagsContext.Provider>;
};

const SlashtagsInterface = (): JSX.Element => {
	const slashtagsRef = useContext(SlashtagsContext);
	return <RNInterface onApiReady={() => console.log('Slashtags API ready')} ref={slashtagsRef} />;
};

export const SlashtagsProvider = ({ children }: { children: any }): JSX.Element => {
	return (
		<SlashtagsContextStore>
			<SlashtagsInterface />
			{children}
		</SlashtagsContextStore>
	);
};

export default SlashtagsProvider;
