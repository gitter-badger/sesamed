pragma solidity >=0.4.22 <0.6.0;

contract Account {
    mapping(address => bool) existsAddress;
    mapping(bytes32 => bool) existsName;

    event newAccountEvent (
        bytes32 indexed hashedName,
        string name,
        address owner,
        string  publicPgpKey
    );

    constructor () public {}

    function register(string memory _name, string memory _publicPgpKey) public returns (bool success) {
        bytes32 hashedName = keccak256(bytes(_name));

        require(!existsAddress[msg.sender]);
        require(!existsName[hashedName]);

        existsAddress[msg.sender] = true;
        existsName[hashedName] = true;

        emit newAccountEvent(
            hashedName,
            _name,
            msg.sender,
            _publicPgpKey
        );

        return true;
    }

    function existsAccount(address _owner) public view returns (bool) {
        require(existsAddress[_owner]);

        return true;
    }
}

