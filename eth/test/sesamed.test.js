const truffleAssert = require("truffle-assertions"),
    openpgp = require("openpgp"),
    ethers = require("ethers"),
    pgpKeys = require("./pgpkeys"),
    IPFS = require("ipfs-mini"),
    ipfs = new IPFS({host: "ipfs.infura.io", port: 5001, protocol: "https"}),
    sesamed = require("../../src/sesamed.js");


const Account = artifacts.require("./Account.sol");
const Channel = artifacts.require("./Channel.sol");
const Document = artifacts.require("./Document.sol");

let provider = new ethers.providers.JsonRpcProvider("http://localhost:9545");


/*
function getLogEntries(from, to, contractAddress, eventName, params) {
    var filter = {
            fromBlock: from,
            toBlock: to,
            address contractAddress,
            topics: [
                ethers.utils.id(eventName + "(" + params.join(",") + ")")
            ]
        },
        decodeData = async function (item) {
            item.data = ethers.utils.defaultAbiCoder.decode(
                params.slice(1),
                item.data
            );
            return item;
        };

    return provider.getLogs(filter).then(function (messages) {
        return Promise.all(messages.map(decodeData));
    });
}
*/

function getNewDocumentEvents(from, to, channelIds) {
    var filter = {
            fromBlock: from,
            toBlock: to,
            topics: [
                ethers.utils.id("newDocumentEvent(bytes32,string,string)"),
                channelIds
            ]
        },
        decodeData = async function (item) {
            var decodedData = ethers.utils.defaultAbiCoder.decode(
                ["string", "string"],
                item.data
            );
            item.data = {
                hash: decodedData[0],
                cipherText: await ipfs.cat(decodedData[1])
            };
            return item;
        };
    return provider.getLogs(filter).then(function (messages) {
        return Promise.all(messages.map(decodeData));
    });
}

/**
 *
 * @param from
 * @param to
 * @returns {Promise}
 */
function getNewChannelEvents(from, to) {
    var filter = {
        fromBlock: from,
        toBlock: to,
        topics: [
            ethers.utils.id("newChannelEvent(address,bytes32,string)")
        ]
    };

    return provider.getLogs(filter).then(logs => {
        return logs.map(function (item) {
            var decodedData = ethers.utils.defaultAbiCoder.decode(
                ["bytes32", "string"],
                item.data
            );
            item.data = {
                channelId: decodedData[0],
                cipherText: decodedData[1]
            };
            return item;
        });
    });
}

/**
 *
 * @param channels
 * @param privateKey
 * @param passphrase
 * @returns {Array}
 */
async function getFittingChannels(channels, privateKey, passphrase) {
    let channelIds = [];

    for (let i = 0; i < channels.length; i++) {
        try {
            await pgpDecrypt({
                privateKey: privateKey,
                passphrase: passphrase,
                cipherText: channels[i].data.cipherText
            });
            channelIds.push(channels[i].data.channelId);
        } catch (e) {
            (function(){}());
        }
    }
    return channelIds;
}

async function pgpEncrypt(options) {
    let publicKey = (await openpgp.key.readArmored(options.publicKey)).keys[0],
        privateKey,
        cipherText;

    if (options.privateKey) {
        privateKey = (await openpgp.key.readArmored(options.privateKey)).keys[0];
        await privateKey.decrypt(options.passphrase);
    }

    cipherText = await openpgp.encrypt({
        message: openpgp.message.fromText(options.clearText),
        publicKeys: publicKey,
        privateKeys: privateKey
    });

    return cipherText.data;
}

async function pgpDecrypt(options) {
    let privateKey = (await openpgp.key.readArmored(options.privateKey)).keys[0],
        publicKey,
        plainText;

    await privateKey.decrypt(options.passphrase);

    if (options.publicKey) {
        publicKey = (await openpgp.key.readArmored(options.publicKey)).keys[0];
    }

    plainText = await openpgp.decrypt({
        message: await openpgp.message.readArmored(options.cipherText),
        publicKeys: publicKey,
        privateKeys: privateKey
    });

    return plainText.data;
}

contract("Sesamed", function (accounts) {
    var account1 = accounts[0],
        account2 = accounts[1],
        account3 = accounts[2],
        account4 = accounts[3],
        name1 = "Jochen",
        name2 = "Jan",
        name3 = "Katy",
        publicKey1 = pgpKeys[0].publicKeyArmored,
        publicKey2 = pgpKeys[1].publicKeyArmored,
        publicKey3 = pgpKeys[2].publicKeyArmored,
        privateKey1 = pgpKeys[0].privateKeyArmored,
        privateKey2 = pgpKeys[1].privateKeyArmored,
        privateKey3 = pgpKeys[2].privateKeyArmored,
        passphrase = "passphrase",
        channelId12 = ethers.utils.id("channel12"),
        channelId31 = ethers.utils.id("channel31"),
        blockNumberAtStart;

    var accountContract;
    var channelContract;
    var documentContract;

    (async function () {

        accountContract = await Account.deployed();
        channelContract = await Channel.deployed();
        documentContract = await Document.deployed();
        await sesamed.init({
            rpc: "http://localhost:9545",
            privateKey: "70c62bca8dcfb7720dcc89b135c1e3f991eed90c0e32c01caff85db085031651",
            accountContractAddress: accountContract.address
        });
    })();

    describe("Account", async function () {
        it("should add account Jochen from account 1", async function () {

            var response = await accountContract.register(name1, publicKey1, {from: account1});
            truffleAssert.eventEmitted(response, "newAccountEvent", (ev) => {
                return (ev.owner === account1
                    && ev.name === name1
                    && ev.hashedName === ethers.utils.id(name1)
                    && ev.publicPgpKey === publicKey1
                );
            });
        });

        it("should add account Jan from account 1 and get reverted", async function () {
            await truffleAssert.fails(
                accountContract.register(name2, publicKey2, {from: account1}),
                truffleAssert.ErrorType.REVERT
            );
        });

        it("should add account Jan from account 2", async function () {
            let response = await accountContract.register(name2, publicKey2, {from: account2});
            truffleAssert.eventEmitted(response, "newAccountEvent", (ev) => {
                return (ev.owner === account2
                    && ev.name === name2
                    && ev.hashedName === ethers.utils.id(name2)
                    && ev.publicPgpKey === publicKey2
                );
            });
        });

        it("should call existsAccount with account3 and get reverted", async function () {
            await truffleAssert.fails(
                accountContract.existsAccount(account3),
                truffleAssert.ErrorType.REVERT
            );
        });

        it("should add account Jochen from account3 and get reverted", async function () {
            await truffleAssert.fails(
                accountContract.register(name1, publicKey1, {from: account3}),
                truffleAssert.ErrorType.REVERT
            );
        });

        it("should add account Katy from account2 and get reverted", async function () {
            await truffleAssert.fails(
                accountContract.register(name3, publicKey1, {from: account2}),
                truffleAssert.ErrorType.REVERT
            );
        });

        it("should add account Katy from account3", async function () {
            let response = await accountContract.register(name3, publicKey3, {from: account3});
            truffleAssert.eventEmitted(response, "newAccountEvent", (ev) => {
                return (ev.owner === account3
                    && ev.name === name3
                    && ev.hashedName === ethers.utils.id(name3)
                    && ev.publicPgpKey === publicKey3
                );
            });
        });

        it("should read all new accounts", async function () {
            // var newAccounts = await sesamed.getNewAccounts();
        });

    });

    xdescribe("Channel", async function () {
        it("should connect account 1 with account 2", async function () {
            var account = await accountContract.getAccountByName(name2);
            var channelId = ethers.utils.id("channel12");
            var cipherText = await pgpEncrypt({
                publicKey: account.publicPgpKey,
                privateKey: privateKey1,
                passphrase: passphrase,
                clearText: channelId
            });

            let response = await channelContract.connectWithAccount(channelId, cipherText);
            truffleAssert.eventEmitted(response, "newchannel", (ev) => {
                return (
                    ev.owner === account1
                    && ev.hashedName === ethers.utils.id(name1)
                    && ev.name === name1
                    && ev.channelId === channelId
                );
            });
        });

        it("should check if channelId channel12 exists", async function () {
            var channelId = ethers.utils.id("channel12");
            var exists = await channelContract.existschannelId(channelId);
            assert.equal(exists, true);
        });


        it("should connect account 3 with account 1", async function () {
            var account = await accountContract.getAccountByName(name1);
            var channelId = ethers.utils.id("channel31");

            var cipherText = await pgpEncrypt({
                publicKey: account.publicPgpKey,
                privateKey: privateKey1,
                passphrase: passphrase,
                clearText: channelId
            });

            var response = await channelContract.connectWithAccount(channelId, cipherText, {from: account3});
            truffleAssert.eventEmitted(response, "newchannel", (ev) => {
                return (
                    ev.owner === account3
                    && ev.hashedName === ethers.utils.id(name3)
                    && ev.name === name3
                    && ev.channelId === channelId
                );

            });
        });

        it("should connect account 2 with account 1 and get reverted", async function () {
            var account = await accountContract.getAccountByName(name1);
            var channelId = ethers.utils.id("channel31");

            var cipherText = await pgpEncrypt({
                publicKey: account.publicPgpKey,
                privateKey: privateKey1,
                passphrase: passphrase,
                clearText: channelId
            });

            await truffleAssert.fails(
                channelContract.connectWithAccount(channelId, cipherText, {from: account2}),
                truffleAssert.ErrorType.REVERT
            );
        });

        it("should connect account 2 with account 1", async function () {
            var account = await accountContract.getAccountByName(name1);
            var channelId = ethers.utils.id("channel21");

            var cipherText = await pgpEncrypt({
                publicKey: account.publicPgpKey,
                privateKey: privateKey1,
                passphrase: passphrase,
                clearText: channelId
            });

            var response = await channelContract.connectWithAccount(channelId, cipherText, {from: account2});
            truffleAssert.eventEmitted(response, "newchannel", (ev) => {
                return (
                    ev.owner === account2
                    && ev.hashedName === ethers.utils.id(name2)
                    && ev.name === name2
                    && ev.channelId === channelId
                );

            });
        });


        it("should connect account 4 with account 1 and get reverted", async function () {
            var cipherText = "test";

            await truffleAssert.fails(
                channelContract.connectWithAccount(ethers.utils.id(cipherText), cipherText, {from: account4}),
                truffleAssert.ErrorType.REVERT
            );
        });

        it("should get all (=3) connect events out of the log ", async function () {
            let requests = await getNewChannelEvents(blockNumberAtStart, "latest");
            assert.equal(requests.length, 3);
        });

        it("should detect correctly which channel belongs to whom", async function () {
            let requests = await getNewChannelEvents(blockNumberAtStart, "latest");
            let channelIds1 = await getFittingChannels(requests, privateKey1, passphrase);
            let channelIds2 = await getFittingChannels(requests, privateKey2, passphrase);
            let channelIds3 = await getFittingChannels(requests, privateKey3, passphrase);

            assert.deepEqual(channelIds1, [ethers.utils.id("channel31"), ethers.utils.id("channel21")]);
            assert.deepEqual(channelIds2, [ethers.utils.id("channel12")]);
            assert.deepEqual(channelIds3, []);
        });

    });
    xdescribe("Document", async function () {
        it("sendDocument from account1 to channelId12", async function () {
            let channelId = channelId12;
            let cipherText = await pgpEncrypt({
                publicKey: publicKey2,
                privateKey: privateKey1,
                passphrase: passphrase,
                clearText: "Hello, World!"
            });

            let hash = await ipfs.add(cipherText);

            let response = await documentContract.sendDocument(channelId, hash);
            truffleAssert.eventEmitted(response, "newDocument", (ev) => {
                return (
                    ev.channelId === channelId
                    && ev.name === name1
                    && ev.hash === hash
                );
            });
        });

        it("sendDocument from account1 with channelId31 and get reverted", async function () {
            await truffleAssert.fails(
                documentContract.sendDocument(channelId31, "egal"),
                truffleAssert.ErrorType.REVERT
            );
        });

        it("sendDocument from account2 with channelId12 and get reverted", async function () {
            await truffleAssert.fails(
                documentContract.sendDocument(channelId12, "egal", {from: account2}),
                truffleAssert.ErrorType.REVERT
            );
        });

        it("getDocument with channelId12 and decrypt with account1 and fail", async function () {
            let documentsEvents = await getNewDocumentEvents(
                blockNumberAtStart,
                "latest",
                [channelId12]
            );
            try {
                await pgpDecrypt({
                    privateKey: privateKey1,
                    passphrase: passphrase,
                    cipherText: documentsEvents[0].data.cipherText
                });
                assert.equal(true, false);
            } catch (e) {
                assert.equal(e.message, "Error decrypting message: Session key decryption failed.");
            }
        });

        it("getDocument with channelId12 and decrypt with account2", async function () {
            let documentEvents = await getNewDocumentEvents(blockNumberAtStart, "latest", [channelId12]);
            let clearText = await pgpDecrypt({
                privateKey: privateKey2,
                passphrase: passphrase,
                cipherText: documentEvents[0].data.cipherText
            });

            assert.equal(clearText, "Hello, World!");
        });

    });
});

