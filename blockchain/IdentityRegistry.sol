// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IdentityRegistry
 * @dev Manages decentralized identities anchoring IPFS CIDs and hashes to Ethereum addresses.
 */
contract IdentityRegistry {
    struct Identity {
        string ipfsCid;
        string dataHash;
        bool isRegistered;
        uint256 timestamp;
    }

    mapping(address => Identity) private identities;

    event IdentityRegistered(address indexed user, string ipfsCid, string dataHash, uint256 timestamp);
    event IdentityUpdated(address indexed user, string ipfsCid, string dataHash, uint256 timestamp);

    /**
     * @dev Register a new identity.
     * @param _ipfsCid The IPFS CID containing the encrypted biometric/identity data.
     * @param _dataHash The SHA-256 hash of the unencrypted biometric embedding to ensure integrity.
     */
    function registerIdentity(string memory _ipfsCid, string memory _dataHash) public {
        require(!identities[msg.sender].isRegistered, "Identity already registered.");

        identities[msg.sender] = Identity({
            ipfsCid: _ipfsCid,
            dataHash: _dataHash,
            isRegistered: true,
            timestamp: block.timestamp
        });

        emit IdentityRegistered(msg.sender, _ipfsCid, _dataHash, block.timestamp);
    }

    /**
     * @dev Update an existing identity.
     * @param _ipfsCid The new IPFS CID.
     * @param _dataHash The new SHA-256 hash.
     */
    function updateIdentity(string memory _ipfsCid, string memory _dataHash) public {
        require(identities[msg.sender].isRegistered, "Identity not registered.");

        identities[msg.sender].ipfsCid = _ipfsCid;
        identities[msg.sender].dataHash = _dataHash;
        identities[msg.sender].timestamp = block.timestamp;

        emit IdentityUpdated(msg.sender, _ipfsCid, _dataHash, block.timestamp);
    }

    /**
     * @dev Get the identity record of a user.
     * @param _user The address of the user.
     * @return ipfsCid The IPFS CID of the encrypted data.
     * @return dataHash The stored SHA-256 hash.
     * @return isRegistered Whether the user is registered.
     */
    function getIdentity(address _user) public view returns (string memory ipfsCid, string memory dataHash, bool isRegistered) {
        Identity memory id = identities[_user];
        return (id.ipfsCid, id.dataHash, id.isRegistered);
    }
}
