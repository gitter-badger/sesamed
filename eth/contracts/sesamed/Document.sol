pragma solidity >=0.4.22 <0.6.0;

contract ChannelContract {
    function existsChannel(bytes32 _channelId) public view returns (bool);
    function getChannelOwner(bytes32 _channelId) public view returns (address);
}

contract Document {
    ChannelContract channelContract;

    constructor (address _channelContractAddress) public {
        channelContract = ChannelContract(_channelContractAddress);
    }

    event newDocumentEvent (
        bytes32 indexed channelId,
        bytes32 hash,
        string ipfsHash
    );

    function sendDocument(bytes32 _channelId, bytes32 _hash, string memory _ipfsHash) public returns (bool sucess) {
        require(channelContract.getChannelOwner(_channelId) == msg.sender);

        emit newDocumentEvent (
            _channelId,
            _hash,
            _ipfsHash
        );

        return true;
    }
}

