var Account = artifacts.require("./sesamed/Account.sol");
var Channel = artifacts.require("./sesamed/Channel.sol");
var Document = artifacts.require("./sesamed/Document.sol");

module.exports = function (deployer) {
    deployer.deploy(Account)
        .then(function (accountContract) {
            return deployer.deploy(Channel, accountContract.address);
        }).then(
            function (channelContract) {
                return deployer.deploy(Document, channelContract.address);
            }
        );
};
