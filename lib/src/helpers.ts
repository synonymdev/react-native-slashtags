/**
 * Converts bytes to hex string
 * @param bytes
 * @returns {string}
 */
export const bytesToHexString = (bytes: Uint8Array): string => {
	return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};

/**
 * Converts hex string to bytes
 * @param hexString
 * @returns {Uint8Array}
 */
export const hexStringToBytes = (hexString: string): Uint8Array => {
	return new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
};
