// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AuditTrail
 * @dev Maintains immutable audit logs and transaction records for transparency
 */
contract AuditTrail is Ownable {
    
    uint256 private _auditIdCounter;
    
    enum AuditType {
        CharityRegistration,
        CharityVerification,
        ProjectCreation,
        Donation,
        MilestoneSubmission,
        MilestoneApproval,
        FundRelease,
        Refund,
        SystemUpdate
    }
    
    struct AuditRecord {
        uint256 id;
        AuditType auditType;
        address actor; // Who performed the action
        address target; // Who/what was affected
        uint256 entityId; // Related entity ID (charity, project, donation)
        uint256 amount; // Amount involved (if applicable)
        string description;
        string documentHash; // IPFS hash for supporting documents
        uint256 timestamp;
        bytes32 transactionHash;
    }
    
    mapping(uint256 => AuditRecord) public auditRecords;
    mapping(address => uint256[]) public actorAudits; // actor => audit IDs
    mapping(uint256 => uint256[]) public entityAudits; // entityId => audit IDs
    mapping(AuditType => uint256[]) public typeAudits; // auditType => audit IDs
    
    // Authorized contracts that can create audit records
    mapping(address => bool) public authorizedContracts;
    
    event AuditRecordCreated(
        uint256 indexed auditId,
        AuditType indexed auditType,
        address indexed actor,
        address target,
        uint256 entityId,
        uint256 timestamp
    );
    
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized to create audit records");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Owner is automatically authorized
        authorizedContracts[msg.sender] = true;
    }
    
    /**
     * @dev Create an audit record
     */
    function createAuditRecord(
        AuditType _auditType,
        address _actor,
        address _target,
        uint256 _entityId,
        uint256 _amount,
        string memory _description,
        string memory _documentHash
    ) public onlyAuthorized returns (uint256) {
        _auditIdCounter++;
        uint256 newAuditId = _auditIdCounter;
        
        auditRecords[newAuditId] = AuditRecord({
            id: newAuditId,
            auditType: _auditType,
            actor: _actor,
            target: _target,
            entityId: _entityId,
            amount: _amount,
            description: _description,
            documentHash: _documentHash,
            timestamp: block.timestamp,
            transactionHash: blockhash(block.number - 1)
        });
        
        // Index the audit record
        actorAudits[_actor].push(newAuditId);
        if (_target != address(0) && _target != _actor) {
            actorAudits[_target].push(newAuditId);
        }
        if (_entityId > 0) {
            entityAudits[_entityId].push(newAuditId);
        }
        typeAudits[_auditType].push(newAuditId);
        
        emit AuditRecordCreated(
            newAuditId,
            _auditType,
            _actor,
            _target,
            _entityId,
            block.timestamp
        );
        
        return newAuditId;
    }
    
    /**
     * @dev Batch create audit records for efficiency
     */
    function createBatchAuditRecords(
        AuditType[] memory _auditTypes,
        address[] memory _actors,
        address[] memory _targets,
        uint256[] memory _entityIds,
        uint256[] memory _amounts,
        string[] memory _descriptions,
        string[] memory _documentHashes
    ) external onlyAuthorized returns (uint256[] memory) {
        require(
            _auditTypes.length == _actors.length &&
            _actors.length == _targets.length &&
            _targets.length == _entityIds.length &&
            _entityIds.length == _amounts.length &&
            _amounts.length == _descriptions.length &&
            _descriptions.length == _documentHashes.length,
            "Array lengths must match"
        );
        
        uint256[] memory auditIds = new uint256[](_auditTypes.length);
        
        for (uint256 i = 0; i < _auditTypes.length; i++) {
            auditIds[i] = createAuditRecord(
                _auditTypes[i],
                _actors[i],
                _targets[i],
                _entityIds[i],
                _amounts[i],
                _descriptions[i],
                _documentHashes[i]
            );
        }
        
        return auditIds;
    }
    
    /**
     * @dev Add authorized contract
     */
    function addAuthorizedContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid contract address");
        authorizedContracts[_contract] = true;
    }
    
    /**
     * @dev Remove authorized contract
     */
    function removeAuthorizedContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
    }
    
    /**
     * @dev Get audit record by ID
     */
    function getAuditRecord(uint256 _auditId) external view returns (AuditRecord memory) {
        require(_auditId > 0 && _auditId <= _auditIdCounter, "Invalid audit ID");
        return auditRecords[_auditId];
    }
    
    /**
     * @dev Get audit records by actor
     */
    function getAuditsByActor(address _actor) external view returns (uint256[] memory) {
        return actorAudits[_actor];
    }
    
    /**
     * @dev Get audit records by entity ID
     */
    function getAuditsByEntity(uint256 _entityId) external view returns (uint256[] memory) {
        return entityAudits[_entityId];
    }
    
    /**
     * @dev Get audit records by type
     */
    function getAuditsByType(AuditType _auditType) external view returns (uint256[] memory) {
        return typeAudits[_auditType];
    }
    
    /**
     * @dev Get audit records within time range
     */
    function getAuditsByTimeRange(
        uint256 _startTime,
        uint256 _endTime
    ) external view returns (uint256[] memory) {
        require(_startTime <= _endTime, "Invalid time range");
        
        uint256 totalAudits = _auditIdCounter;
        uint256[] memory tempResults = new uint256[](totalAudits);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalAudits; i++) {
            if (auditRecords[i].timestamp >= _startTime && auditRecords[i].timestamp <= _endTime) {
                tempResults[count] = i;
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory results = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            results[i] = tempResults[i];
        }
        
        return results;
    }
    
    /**
     * @dev Get audit records by actor and type
     */
    function getAuditsByActorAndType(
        address _actor,
        AuditType _auditType
    ) external view returns (uint256[] memory) {
        uint256[] memory actorAuditIds = actorAudits[_actor];
        uint256[] memory tempResults = new uint256[](actorAuditIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < actorAuditIds.length; i++) {
            if (auditRecords[actorAuditIds[i]].auditType == _auditType) {
                tempResults[count] = actorAuditIds[i];
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory results = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            results[i] = tempResults[i];
        }
        
        return results;
    }
    
    /**
     * @dev Get total audit records count
     */
    function getTotalAuditRecords() external view returns (uint256) {
        return _auditIdCounter;
    }
    
    /**
     * @dev Verify audit record integrity
     */
    function verifyAuditRecord(uint256 _auditId) external view returns (bool) {
        require(_auditId > 0 && _auditId <= _auditIdCounter, "Invalid audit ID");
        
        AuditRecord memory record = auditRecords[_auditId];
        
        // Basic integrity checks
        return (
            record.id == _auditId &&
            record.timestamp > 0 &&
            record.timestamp <= block.timestamp &&
            record.actor != address(0)
        );
    }
    
    /**
     * @dev Get audit statistics
     */
    function getAuditStatistics() external view returns (
        uint256 totalRecords,
        uint256 totalCharityRegistrations,
        uint256 totalDonations,
        uint256 totalMilestoneApprovals,
        uint256 totalFundReleases
    ) {
        totalRecords = _auditIdCounter;
        totalCharityRegistrations = typeAudits[AuditType.CharityRegistration].length;
        totalDonations = typeAudits[AuditType.Donation].length;
        totalMilestoneApprovals = typeAudits[AuditType.MilestoneApproval].length;
        totalFundReleases = typeAudits[AuditType.FundRelease].length;
    }
}

