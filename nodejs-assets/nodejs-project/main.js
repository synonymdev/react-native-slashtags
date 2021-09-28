// Rename this sample file to main.js to use on your project.
// The main.js file will be overwritten in updates/reinstalls.

var rn_bridge = require('rn-bridge');
var SlashtagsURL = require('@synonymdev/slashtags-url');

// Echo every message received from react-native.
rn_bridge.channel.on('message', msg => {
  rn_bridge.channel.send(msg);
});

rn_bridge.channel.on('decode-url', actionURL => {
  const decoded = SlashtagsURL.parse(actionURL);

  rn_bridge.channel.post('decode-url', decoded);
});

// Inform react-native node is initialized.
rn_bridge.channel.send('Slashtags auth server initialized.');
