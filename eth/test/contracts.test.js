const expect = require("chai").expect;
const truffleAssert = require("truffle-assertions");

const Account = artifacts.require("./Account.sol");
const Channel = artifacts.require("./Channel.sol");
const Document = artifacts.require("./Document.sol");

contract("Sesamed",  function (accounts) {
    var account1 = accounts[0],
        account2 = accounts[1],
        account3 = accounts[2],
        account4 = accounts[3],
        name1 = "Jochen",
        name2 = "Jan",
        name3 = "Katy",
        publicKey1 = "publicKey1",
        publicKey2 = "publicKey2",
        publicKey3 = "publicKey3",
        channelId12 = web3.utils.randomHex(32),
        channelId21 = web3.utils.randomHex(32),
        channelId31 = web3.utils.randomHex(32),
        channelId41 = web3.utils.randomHex(32),
        ipfsHash12 = "ipfs12",
        ipfsHash21 = "ipfs21",
        ipfsHash31 = "ipfs31",
        ipfsHash41 = "ipfs41",
        blockNumberAtStart;

    var accountContract;
    var channelContract;
    var documentContract;

    (async function() {
        accountContract = await Account.deployed();
        channelContract = await Channel.deployed();
        documentContract = await Document.deployed();
        blockNumberAtStart = await web3.eth.getBlockNumber();
    })();

    describe("Account", async function () {
        describe("register()", async function () {
            it("should add account Jochen from account 1", async function () {
                var response = await accountContract.register(name1, publicKey1, {from: account1});
                truffleAssert.eventEmitted(response, "newAccountEvent", (ev) => {
                    return (ev.owner === account1
                        && ev.name === name1
                        && ev.hashedName === web3.utils.sha3(name1)
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
                        &&  ev.hashedName === web3.utils.sha3(name2)
                        && ev.publicPgpKey === publicKey2
                    );
                });
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
                var response = await accountContract.register(name3, publicKey3, {from: account3});
                truffleAssert.eventEmitted(response, "newAccountEvent", (ev) => {
                    return (ev.owner === account3
                        && ev.name === name3
                        &&  ev.hashedName === web3.utils.sha3(name3)
                        && ev.publicPgpKey === publicKey3
                    );
                });
            });
        });

        describe("the event log", async function () {
            it("should contain the three correct entries", async function () {

                let logs = (await accountContract.getPastEvents(
                    "newAccountEvent",
                    {
                        filter: {
                            hashedName: [
                                web3.utils.sha3(name1),
                                web3.utils.sha3(name2),
                                web3.utils.sha3(name3)
                            ]
                        },
                        fromBlock: blockNumberAtStart,
                        toBlock: "latest"
                    }
                )).map(function (item) {
                    return item.args;
                });

                expect(logs.length).to.equal(3);
                expect(logs[0].name).to.equal(name1);
                expect(logs[1].name).to.equal(name2);
                expect(logs[2].name).to.equal(name3);
            });
        });
            
    });

    describe("Channel", async function () {
        describe("createChannel", async function () {
            it("should create channel12 from account1 successfully", async function () {
                let ciphertext = "cipher12";

                let response = await channelContract.createChannel(channelId12, ciphertext);
                truffleAssert.eventEmitted(response, "newChannelEvent", (ev) => {
                    return (
                        ev.owner === account1
                        && ev.channelId === channelId12
                        && ev.ciphertext === ciphertext
                    );
                });
            });


            it("should create channel31 from account3 successfully", async function () {
                let ciphertext = "cipher31";

                let response = await channelContract.createChannel(channelId31, ciphertext, {from: account3});
                truffleAssert.eventEmitted(response, "newChannelEvent", (ev) => {
                    return (
                        ev.owner === account3
                        && ev.channelId === channelId31
                        && ev.ciphertext === ciphertext
                    );

                });
            });

            it("should create channel31 from account2 and get reverted", async function () {
                let ciphertext = "cipher31";

                await truffleAssert.fails(
                    channelContract.createChannel(channelId31, ciphertext, {from: account2}),
                    truffleAssert.ErrorType.REVERT
                );
            });

            it("should create channel21 from account2 successfully", async function () {
                let ciphertext = "cipher21";

                let response = await channelContract.createChannel(channelId21, ciphertext, {from: account2});
                truffleAssert.eventEmitted(response, "newChannelEvent", (ev) => {
                    return (
                        ev.owner === account2
                        && ev.channelId === channelId21
                        && ev.ciphertext === ciphertext
                    );

                });
            });


            it("should create channel41 from (not registered) account4 an get reverted", async function () {
                let ciphertext = "cipher41";

                await truffleAssert.fails(
                    channelContract.createChannel(channelId41, ciphertext, {from: account4}),
                    truffleAssert.ErrorType.REVERT
                );
            });

        });
        describe("the event log", async function () {
            it("should contain the three correct entries", async function () {

                let logs = (await channelContract.getPastEvents(
                    "newChannelEvent",
                    {
                        fromBlock: blockNumberAtStart,
                        toBlock: "latest"
                    }
                )).map(function (item) {
                    return item.args;
                });

                expect(logs.length).to.equal(3);
                expect(logs[0].channelId).to.equal(channelId12);
                expect(logs[1].channelId).to.equal(channelId31);
                expect(logs[2].channelId).to.equal(channelId21);
            });
        });
    });

    describe("Document", async function () {

        describe("sendDocument", async function () {

            it("should sendDocument from account1 to channel12 successfully", async function () {
                let hash = web3.utils.sha3(ipfsHash12);
                
                let response = await documentContract.sendDocument(channelId12, hash, ipfsHash12);
                truffleAssert.eventEmitted(response, "newDocumentEvent", (ev) => {
                    return (
                        ev.channelId === channelId12
                        && ev.hash === hash
                        && ev.ipfsHash === ipfsHash12
                    );
                });
            });

            it("sendDocument from account1 to channelId31 and get reverted", async function () {
                let hash = web3.utils.sha3(ipfsHash31);

                await truffleAssert.fails(
                    documentContract.sendDocument(channelId31, hash, ipfsHash31),
                    truffleAssert.ErrorType.REVERT
                );
            });

            it("sendDocument from account2 with channelId12 and get reverted", async function () {
                let hash = web3.utils.sha3(ipfsHash12);

                await truffleAssert.fails(
                    documentContract.sendDocument(channelId12, hash, ipfsHash12, {from: account2}),
                    truffleAssert.ErrorType.REVERT
                );
            });

            it("sendDocument from account4 with channelId12 and get reverted", async function () {
                let hash = web3.utils.sha3(ipfsHash12);

                await truffleAssert.fails(
                    documentContract.sendDocument(channelId12, hash, ipfsHash12, {from: account4}),
                    truffleAssert.ErrorType.REVERT
                );
            });

            it("sendDocument from account4 with channelId41 and get reverted", async function () {
                let hash = web3.utils.sha3(ipfsHash41);

                await truffleAssert.fails(
                    documentContract.sendDocument(channelId41, hash, ipfsHash41, {from: account4}),
                    truffleAssert.ErrorType.REVERT
                );
            });

            it("should sendDocument from account2 to channel21 successfully", async function () {
                let hash = web3.utils.sha3(ipfsHash21);

                let response = await documentContract.sendDocument(channelId21, hash, ipfsHash21, {from: account2});
                truffleAssert.eventEmitted(response, "newDocumentEvent", (ev) => {
                    return (
                        ev.channelId === channelId21
                        && ev.hash === hash
                        && ev.ipfsHash === ipfsHash21
                    );
                });
            });

            describe("the event log", async function () {
                it("should contain one entry for channel21", async function () {

                    let logs = (await documentContract.getPastEvents(
                        "newDocumentEvent",
                        {
                            filter: {
                                channelId: channelId21
                            },
                            fromBlock: blockNumberAtStart,
                            toBlock: "latest"
                        }
                    )).map(function (item) {
                        return item.args;
                    });

                    expect(logs.length).to.equal(1);
                    expect(logs[0].channelId).to.equal(channelId21);
                    expect(logs[0].ipfsHash).to.equal(ipfsHash21);
                });

                it("should contain the two correct entries", async function () {

                    let logs = (await documentContract.getPastEvents(
                        "newDocumentEvent",
                        {
                            filter: {
                                channelId: [channelId12, channelId21]
                            },
                            fromBlock: blockNumberAtStart,
                            toBlock: "latest"
                        }
                    )).map(function (item) {
                        return item.args;
                    });

                    expect(logs.length).to.equal(2);
                    expect(logs[0].channelId).to.equal(channelId12);
                    expect(logs[1].channelId).to.equal(channelId21);
                    expect(logs[0].ipfsHash).to.equal(ipfsHash12);
                    expect(logs[1].ipfsHash).to.equal(ipfsHash21);
                });

            });

        });
    });
});
