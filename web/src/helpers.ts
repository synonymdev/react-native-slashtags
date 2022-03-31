/**
 * Converts bytes to hex string
 * @param bytes
 * @returns {string}
 */
import {KeyPair} from "noise-curve-tiny-secp";

export const bytesToHexString = (bytes: Uint8Array): string => {
    return bytes.reduce(
        (str, byte) => str + byte.toString(16).padStart(2, '0'),
        '',
    );
};

/**
 * Converts hex string to bytes
 * @param hexString
 * @returns {Uint8Array}
 */
export const hexStringToBytes = (hexString: string): Uint8Array => {
    return new Uint8Array(
        hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    );
};


type TStringKeyPair = {
    publicKey: string,
    secretKey: string
}

/**
 * Translates a string key pair received from RN to a buffer formatted keypair that can be used with slashtags
 * @param publicKey
 * @param secretKey
 */
export const stringKeyPairToBytesKeyPair = ({publicKey, secretKey}: TStringKeyPair): KeyPair => {
    return {publicKey: Buffer.from(publicKey, 'hex'), secretKey: Buffer.from(secretKey, 'hex')}
}

/**
 * Translayes a buffer formatted keypair to a string formatted one so it can be passed back to react native
 * @param publicKey
 * @param secretKey
 * @returns {{secretKey: string, publicKey: string}}
 */
export const bytesKeyPairToStringKeyPair = ({publicKey, secretKey}: {publicKey: Buffer, secretKey: Buffer}): TStringKeyPair => {
    return {publicKey: bytesToHexString(publicKey), secretKey: bytesToHexString(secretKey)}
}
