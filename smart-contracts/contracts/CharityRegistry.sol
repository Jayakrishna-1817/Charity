// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CharityRegistry
 * @dev Manages charity registration, verification, and profile management
 */
contract CharityRegistry is Ownable, ReentrancyGuard {
    
    uint256 private _charityIdCounter;
    
    enum CharityStatus {
        Pending,
        Verified,
        Suspended,
        Rejected
    }
    
    struct Charity {
        uint256 id;
        address charityAddress;
        string name;
        string description;
        string website;
        string documentHash; // IPFS hash for verification documents
        CharityStatus status;
        uint256 totalReceived;
        uint256 totalDonations;
        uint256 registrationDate;
        address verifiedBy;
    }
    
    mapping(uint256 => Charity) public charities;
    mapping(address => uint256) public charityAddressToId;
    mapping(address => bool) public authorizedVerifiers;
    
    event CharityRegistered(
        uint256 indexed charityId,
        address indexed charityAddress,
        string name,
        uint256 timestamp
    );
    
    event CharityVerified(
        uint256 indexed charityId,
        address indexed verifier,
        CharityStatus status,
        uint256 timestamp
    );
    
    event CharityUpdated(
        uint256 indexed charityId,
        string name,
        string description,
        uint256 timestamp
    );
    
    event VerifierAdded(address indexed verifier, uint256 timestamp);
    event VerifierRemoved(address indexed verifier, uint256 timestamp);
    
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }
    
    modifier onlyRegisteredCharity() {
        require(charityAddressToId[msg.sender] != 0, "Not a registered charity");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        authorizedVerifiers[msg.sender] = true;
    }
    
    /**
     * @dev Register a new charity
     */
    function registerCharity(
        string memory _name,
        string memory _description,
        string memory _website,
        string memory _documentHash
    ) external nonReentrant {
        require(charityAddressToId[msg.sender] == 0, "Charity already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_documentHash).length > 0, "Document hash required");
        
        _charityIdCounter++;
        uint256 newCharityId = _charityIdCounter;
        
        charities[newCharityId] = Charity({
            id: newCharityId,
            charityAddress: msg.sender,
            name: _name,
            description: _description,
            website: _website,
            documentHash: _documentHash,
            status: CharityStatus.Pending,
            totalReceived: 0,
            totalDonations: 0,
            registrationDate: block.timestamp,
            verifiedBy: address(0)
        });
        
        charityAddressToId[msg.sender] = newCharityId;
        
        emit CharityRegistered(newCharityId, msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Verify or reject a charity
     */
    function verifyCharity(uint256 _charityId, CharityStatus _status) 
        external 
        onlyVerifier 
        nonReentrant 
    {
        require(_charityId > 0 && _charityId <= _charityIdCounter, "Invalid charity ID");
        require(_status == CharityStatus.Verified || _status == CharityStatus.Rejected || _status == CharityStatus.Suspended, "Invalid status");
        
        Charity storage charity = charities[_charityId];
        charity.status = _status;
        charity.verifiedBy = msg.sender;
        
        emit CharityVerified(_charityId, msg.sender, _status, block.timestamp);
    }
    
    /**
     * @dev Update charity information
     */
    function updateCharityInfo(
        string memory _name,
        string memory _description,
        string memory _website
    ) external onlyRegisteredCharity nonReentrant {
        uint256 charityId = charityAddressToId[msg.sender];
        Charity storage charity = charities[charityId];
        
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        charity.name = _name;
        charity.description = _description;
        charity.website = _website;
        
        emit CharityUpdated(charityId, _name, _description, block.timestamp);
    }
    
    /**
     * @dev Add authorized verifier
     */
    function addVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        authorizedVerifiers[_verifier] = true;
        emit VerifierAdded(_verifier, block.timestamp);
    }
    
    /**
     * @dev Remove authorized verifier
     */
    function removeVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = false;
        emit VerifierRemoved(_verifier, block.timestamp);
    }
    
    /**
     * @dev Update charity donation statistics (called by DonationManager)
     */
    function updateCharityStats(uint256 _charityId, uint256 _amount) external {
        // This will be called by the DonationManager contract
        require(charities[_charityId].id != 0, "Charity does not exist");
        
        charities[_charityId].totalReceived += _amount;
        charities[_charityId].totalDonations += 1;
    }
    
    /**
     * @dev Get charity information
     */
    function getCharity(uint256 _charityId) external view returns (Charity memory) {
        require(_charityId > 0 && _charityId <= _charityIdCounter, "Invalid charity ID");
        return charities[_charityId];
    }
    
    /**
     * @dev Get charity ID by address
     */
    function getCharityIdByAddress(address _charityAddress) external view returns (uint256) {
        return charityAddressToId[_charityAddress];
    }
    
    /**
     * @dev Get total number of registered charities
     */
    function getTotalCharities() external view returns (uint256) {
        return _charityIdCounter;
    }
    
    /**
     * @dev Check if charity is verified
     */
    function isCharityVerified(uint256 _charityId) external view returns (bool) {
        return charities[_charityId].status == CharityStatus.Verified;
    }
}

