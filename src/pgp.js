"use strict";
// global npm packages
const openpgp = require("openpgp");

/**
 * Creates a new pgp key pair
 * @param {Object} options
 * @param {Object} options.userIds
 * @param {String} options.userIds.name
 * @param {String} options.userIds.email
 * @param {String} options.passphrase
 * @returns {Promise}
 */
function generateKeys(options) {
    return openpgp.generateKey({
        userIds: options.userIds,
        curve: "ed25519",
        passphrase: options.passphrase
    }).then(key => {
        let privateKey = key.privateKeyArmored,
            publicKey = key.publicKeyArmored,
            revocationCertificate = key.revocationCertificate;

        return {
            privateKey: privateKey,
            publicKey: publicKey,
            revocationCertificate: revocationCertificate
        };
    });
}

/**
 * Encrypts data with public key and signs if private key is provided
 * @param {Object} options
 * @param {String} options.publicKey
 * @param {String} options.privateKey
 * @param {String} options.passphrase
 * @param {String} options.cleartext
 * @returns {Promise}
 */
async function encrypt(options) {
    let privateKeyObj,
        privateKeys;

    if (options.privateKey) {
        privateKeyObj= (await openpgp.key.readArmored(options.privateKey)).keys[0];
        await privateKeyObj.decrypt(options.passphrase);
        privateKeys = [privateKeyObj];
    }

    return openpgp.encrypt({
        message: openpgp.message.fromText(options.cleartext),
        publicKeys: (await openpgp.key.readArmored(options.publicKey)).keys,
        privateKeys: privateKeys
    }).then(ciphertext => ciphertext.data);
}

/**
 * Decrypts data with private key and checks signature if public key is provided
 * @param {Object} options
 * @param {String} options.privateKey
 * @param {String} options.passphrase
 * @param {String} [options.publicKey]
 * @param {String} options.ciphertext
 * @returns {Promise}
 */
async function decrypt(options) {
    let privateKeyObj = (await openpgp.key.readArmored(options.privateKey)).keys[0],
        publicKeys;

    await privateKeyObj.decrypt(options.passphrase);

    if (options.publicKey) {
        publicKeys = (await openpgp.key.readArmored(options.publicKey)).keys;
    }

    return openpgp.decrypt({
        message: await openpgp.message.readArmored(options.ciphertext),
        publicKeys: publicKeys,
        privateKeys: privateKeyObj
    }).then(plaintext => plaintext.data);
}

let pgp = {
    generateKeys: generateKeys,
    encrypt: encrypt,
    decrypt: decrypt
};

module.exports = pgp;
