const bs58 = require("bs58");

/**
 * @typedef {Object} Multihash
 * @property {string} digest The digest output of hash function in hex with prepended "0x"
 * @property {number} hashFunction The hash function code for the function used
 * @property {number} size The length of digest
 */

/**
 * Partition multihash string into object representing multihash
 *
 * @param {string} b58hash A base58 encoded multihash string
 * @returns {Multihash}
 */
function getMultihashFromBase58(b58hash) {
    const decoded = bs58.decode(b58hash);

    return {
        digest: `0x${decoded.slice(2).toString("hex")}`,
        hashFunction: decoded[0],
        size: decoded[1],
    };
}

/**
 * Encode a multihash structure into base58 encoded multihash string
 *
 * @param {Multihash} multihash
 * @returns {(string|null)} base58 encoded multihash string
 */
function getBase58FromMultihash(multihash) {
    const { digest, hashFunction, size } = multihash;
    if (size === 0) {
        return null;
    }

    // cut off leading "0x"
    const hashBytes = Buffer.from(digest.slice(2), "hex");

    // prepend hashFunction and digest size
    const multihashBytes = new (hashBytes.constructor)(2 + hashBytes.length);
    multihashBytes[0] = hashFunction;
    multihashBytes[1] = size;
    multihashBytes.set(hashBytes, 2);

    return bs58.encode(multihashBytes);
}

let multihash = {
    getMultihashFromBase58: getMultihashFromBase58,
    getBase58FromMultihash: getBase58FromMultihash,
};

module.exports = multihash;