pragma solidity >=0.4.22 <0.6.0;

contract AccountContract {
    function existsAccount(address _owner) public view returns (bool);
}

contract Channel {
    AccountContract accountContract;

    constructor (address _accountContractAddress) public {
        accountContract = AccountContract(_accountContractAddress);
    }

    struct channelStruct {
        address owner;
        bool exists;
    }

    mapping(bytes32 => channelStruct) channel;


    event newChannelEvent (
        address indexed owner,
        bytes32 channelId,
        string ciphertext
    );

    function createChannel(bytes32 _channelId, string memory _ciphertext) public returns (bool) {
        require(accountContract.existsAccount(msg.sender));
        require(!channel[_channelId].exists);

        channelStruct memory newChannel;
        newChannel.owner = msg.sender;
        newChannel.exists = true;
        channel[_channelId] = newChannel;

        emit newChannelEvent(
            msg.sender,
            _channelId,
            _ciphertext
        );

        return true;
    }

    function existsChannel(bytes32 _channelId) public view returns (bool) {
        return channel[_channelId].exists;
    }

    function getChannelOwner(bytes32 _channelId) public view returns (address) {
        return channel[_channelId].owner;
    }
}

