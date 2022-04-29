import React, {createContext, useContext, useRef} from 'react';
import Slashtags from '@synonymdev/react-native-slashtags'

export const SlashtagsContext = createContext(); //TODO set types

const SlashtagsContextStore = props => {
  const ref = useRef();
  return <SlashtagsContext.Provider value={ref}>{props.children}</SlashtagsContext.Provider>;
};

const SlashtagsInterface = () => {
  const slashtagsRef = useContext(SlashtagsContext);
  return (
    <Slashtags
      onApiReady={() => console.log("Slashtags API ready")}
      ref={slashtagsRef}
    />
  );
};

export const SlashtagsProvider = ({children}): JSX.Element => {
  return (
    <SlashtagsContextStore>
      <SlashtagsInterface />
      {children}
    </SlashtagsContextStore>
  );
};

export default SlashtagsProvider;
