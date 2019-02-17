"use strict";
// npm packages
const ethers = require ("ethers");

// local modules
const pgp = require("./pgp");
// const multihash = require("./multihash");

// contract json
const accountContractJson = require("../eth/build/contracts/Account.json");

// global module variables
let privateKey,
    provider,
    accountContract;

/**
 * Initializes the configuration
 * @param {Object} options
 * @param {String} options.accountCountractAddress
 * @param {String} options.rpc
 * @param {String} options.privateKey
 */
function init(options) {
    provider = new ethers.providers.JsonRpcProvider(options.rpc);
    privateKey = options.privateKey;

    let accountContractAddress = options.accountContractAddress || accountContractJson.networks["219"].address;
    let wallet = new ethers.Wallet(privateKey, provider);
    accountContract = new ethers.Contract(accountContractAddress, accountContractJson.abi, provider).connect(wallet);
}


/**
 * @alias PgpKeys
 * @memberof module:sesamed
 * @typedef {Object} PgpKeys
 * @property {String} privateKey The digest output of hash function in hex with prepended "0x"
 * @property {String} publicKey The hash function code for the function used
 */

/**
 *
 * @alias Account
 * @memberof module:sesamed
 * @typedef {Object} Account
 * @property {String} mnemonic The digest output of hash function in hex with prepended "0x"
 * @property {String} path The hash function code for the function used
 * @property {String} privateKey The length of digest
 * @property {String} address The length of digest
 * @property {PgpKeys} pgp The length of digest
 */

/**
 * creates a new account and sets
 * @alias module:sesamed.createAccount
 * @param {Object} options
 * @param {Object} options.userIds
 * @param {String} options.userIds.name - name connected with pgp keys
 * @param {String} options.userIds.email - email address connected with pgp keys
 * @param {String} options.passphrase - passphrase to encrypt private pgp key
 * @returns {Account} account
 * @example
 * ```js
 * > sesamed.createAccount()
 * {
 *     wallet: {},
 *     pgp: {}
 * }
 * ```
 */
async function createAccount(options) {
    const pgpKeys = await pgp.pgpGenerateKeys({userIds: options.userIds, passphrase: options.passphrase});
    const mnemonic = await ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    return {
        wallet: {
            mnemonic: wallet.signingKey.mnemonic,
            path: wallet.signingKey.path,
            privateKey: wallet.signingKey.privateKey,
            address: wallet.signingKey.address
        },
        pgp: pgpKeys,
    };
}

/**
 * Registers a new account
 * @alias module:sesamed.register
 * @param {String} name
 * @param {String} publicPgpKey
 * @returns {Promise}
 */
function register(name, publicPgpKey) {
    return accountContract.register(name, publicPgpKey);
}

/**
 * Get all new Accounts
 * @param {Number} [from] - Block to Start
 * @param {Number} [to] - Block to End
 * @returns {Promise}
 */
function getNewAccounts(from, to) {
    var filter = {
        fromBlock: from || 0,
        toBlock: to || "latest",
        topics: [
            ethers.utils.id("newAccountEvent(bytes32,string,address,string)")
        ]
    };

    return provider.getLogs(filter).then(logs => {
        return logs.map(function(item) {
            var decodedData = ethers.utils.defaultAbiCoder.decode(
                [ "string", "address", "string"],
                item.data
            );
            item.data = {
                name: decodedData[0],
                owner: decodedData[1],
                publicKey: decodedData[2],
            };
            return item;
        });
    });
}

var sesamed = {
    init: init,
    createAccount: createAccount,
    register: register,
    getNewAccounts: getNewAccounts,
    pgp: pgp
};

/**
 * Blockchain for the Healthcare System
 * @module sesamed
 * @typicalname sesamed
 * @example
 * ```js
 * const sesamed = require("sesamed")
 * ```
 */module.exports = sesamed;



