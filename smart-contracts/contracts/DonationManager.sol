// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CharityRegistry.sol";

/**
 * @title DonationManager
 * @dev Manages donations, milestones, and fund distribution with escrow functionality
 */
contract DonationManager is Ownable, ReentrancyGuard {
    
    uint256 private _donationIdCounter;
    uint256 private _projectIdCounter;
    
    CharityRegistry public charityRegistry;
    
    enum ProjectStatus {
        Active,
        Completed,
        Cancelled,
        Suspended
    }
    
    enum MilestoneStatus {
        Pending,
        Submitted,
        Approved,
        Rejected
    }
    
    struct Project {
        uint256 id;
        uint256 charityId;
        string title;
        string description;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 releasedAmount;
        uint256 deadline;
        ProjectStatus status;
        uint256 createdAt;
        string[] milestoneDescriptions;
        uint256[] milestoneAmounts;
        MilestoneStatus[] milestoneStatuses;
        string[] milestoneDocuments; // IPFS hashes
    }
    
    struct Donation {
        uint256 id;
        uint256 projectId;
        address donor;
        uint256 amount;
        uint256 timestamp;
        bool refunded;
        string message;
    }
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Donation) public donations;
    mapping(uint256 => uint256[]) public projectDonations; // projectId => donationIds
    mapping(address => uint256[]) public donorDonations; // donor => donationIds
    mapping(address => bool) public authorizedAuditors;
    
    event ProjectCreated(
        uint256 indexed projectId,
        uint256 indexed charityId,
        string title,
        uint256 targetAmount,
        uint256 deadline
    );
    
    event DonationMade(
        uint256 indexed donationId,
        uint256 indexed projectId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );
    
    event MilestoneSubmitted(
        uint256 indexed projectId,
        uint256 milestoneIndex,
        string documentHash,
        uint256 timestamp
    );
    
    event MilestoneApproved(
        uint256 indexed projectId,
        uint256 milestoneIndex,
        uint256 amountReleased,
        address approvedBy
    );
    
    event FundsReleased(
        uint256 indexed projectId,
        uint256 amount,
        address recipient
    );
    
    event DonationRefunded(
        uint256 indexed donationId,
        address donor,
        uint256 amount
    );
    
    modifier onlyAuditor() {
        require(authorizedAuditors[msg.sender] || msg.sender == owner(), "Not authorized auditor");
        _;
    }
    
    modifier onlyVerifiedCharity(uint256 _charityId) {
        require(charityRegistry.isCharityVerified(_charityId), "Charity not verified");
        _;
    }
    
    constructor(address _charityRegistryAddress) Ownable(msg.sender) {
        charityRegistry = CharityRegistry(_charityRegistryAddress);
        authorizedAuditors[msg.sender] = true;
    }
    
    /**
     * @dev Create a new fundraising project
     */
    function createProject(
        uint256 _charityId,
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts
    ) external onlyVerifiedCharity(_charityId) nonReentrant {
        require(charityRegistry.getCharityIdByAddress(msg.sender) == _charityId, "Not charity owner");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_targetAmount > 0, "Target amount must be positive");
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Milestone arrays length mismatch");
        require(_milestoneDescriptions.length > 0, "At least one milestone required");
        
        // Verify milestone amounts sum to target amount
        uint256 totalMilestoneAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalMilestoneAmount += _milestoneAmounts[i];
        }
        require(totalMilestoneAmount == _targetAmount, "Milestone amounts must sum to target");
        
        _projectIdCounter++;
        uint256 newProjectId = _projectIdCounter;
        
        // Initialize milestone statuses and documents
        MilestoneStatus[] memory statuses = new MilestoneStatus[](_milestoneDescriptions.length);
        string[] memory documents = new string[](_milestoneDescriptions.length);
        
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            statuses[i] = MilestoneStatus.Pending;
            documents[i] = "";
        }
        
        projects[newProjectId] = Project({
            id: newProjectId,
            charityId: _charityId,
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            releasedAmount: 0,
            deadline: _deadline,
            status: ProjectStatus.Active,
            createdAt: block.timestamp,
            milestoneDescriptions: _milestoneDescriptions,
            milestoneAmounts: _milestoneAmounts,
            milestoneStatuses: statuses,
            milestoneDocuments: documents
        });
        
        emit ProjectCreated(newProjectId, _charityId, _title, _targetAmount, _deadline);
    }
    
    /**
     * @dev Make a donation to a project
     */
    function donate(uint256 _projectId, string memory _message) 
        external 
        payable 
        nonReentrant 
    {
        require(msg.value > 0, "Donation amount must be positive");
        require(_projectId > 0 && _projectId <= _projectIdCounter, "Invalid project ID");
        
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.Active, "Project not active");
        require(block.timestamp <= project.deadline, "Project deadline passed");
        
        _donationIdCounter++;
        uint256 newDonationId = _donationIdCounter;
        
        donations[newDonationId] = Donation({
            id: newDonationId,
            projectId: _projectId,
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            refunded: false,
            message: _message
        });
        
        project.raisedAmount += msg.value;
        projectDonations[_projectId].push(newDonationId);
        donorDonations[msg.sender].push(newDonationId);
        
        // Update charity statistics
        charityRegistry.updateCharityStats(project.charityId, msg.value);
        
        emit DonationMade(newDonationId, _projectId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Submit milestone documentation
     */
    function submitMilestone(
        uint256 _projectId,
        uint256 _milestoneIndex,
        string memory _documentHash
    ) external nonReentrant {
        require(_projectId > 0 && _projectId <= _projectIdCounter, "Invalid project ID");
        
        Project storage project = projects[_projectId];
        require(charityRegistry.getCharityIdByAddress(msg.sender) == project.charityId, "Not project owner");
        require(_milestoneIndex < project.milestoneStatuses.length, "Invalid milestone index");
        require(project.milestoneStatuses[_milestoneIndex] == MilestoneStatus.Pending, "Milestone not pending");
        require(bytes(_documentHash).length > 0, "Document hash required");
        
        project.milestoneStatuses[_milestoneIndex] = MilestoneStatus.Submitted;
        project.milestoneDocuments[_milestoneIndex] = _documentHash;
        
        emit MilestoneSubmitted(_projectId, _milestoneIndex, _documentHash, block.timestamp);
    }
    
    /**
     * @dev Approve milestone and release funds
     */
    function approveMilestone(uint256 _projectId, uint256 _milestoneIndex) 
        external 
        onlyAuditor 
        nonReentrant 
    {
        require(_projectId > 0 && _projectId <= _projectIdCounter, "Invalid project ID");
        
        Project storage project = projects[_projectId];
        require(_milestoneIndex < project.milestoneStatuses.length, "Invalid milestone index");
        require(project.milestoneStatuses[_milestoneIndex] == MilestoneStatus.Submitted, "Milestone not submitted");
        
        uint256 releaseAmount = project.milestoneAmounts[_milestoneIndex];
        require(project.raisedAmount >= project.releasedAmount + releaseAmount, "Insufficient funds");
        
        project.milestoneStatuses[_milestoneIndex] = MilestoneStatus.Approved;
        project.releasedAmount += releaseAmount;
        
        // Get charity address
        CharityRegistry.Charity memory charity = charityRegistry.getCharity(project.charityId);
        
        // Transfer funds to charity
        (bool success, ) = charity.charityAddress.call{value: releaseAmount}("");
        require(success, "Fund transfer failed");
        
        emit MilestoneApproved(_projectId, _milestoneIndex, releaseAmount, msg.sender);
        emit FundsReleased(_projectId, releaseAmount, charity.charityAddress);
        
        // Check if project is completed
        bool allMilestonesApproved = true;
        for (uint256 i = 0; i < project.milestoneStatuses.length; i++) {
            if (project.milestoneStatuses[i] != MilestoneStatus.Approved) {
                allMilestonesApproved = false;
                break;
            }
        }
        
        if (allMilestonesApproved) {
            project.status = ProjectStatus.Completed;
        }
    }
    
    /**
     * @dev Reject milestone
     */
    function rejectMilestone(uint256 _projectId, uint256 _milestoneIndex) 
        external 
        onlyAuditor 
        nonReentrant 
    {
        require(_projectId > 0 && _projectId <= _projectIdCounter, "Invalid project ID");
        
        Project storage project = projects[_projectId];
        require(_milestoneIndex < project.milestoneStatuses.length, "Invalid milestone index");
        require(project.milestoneStatuses[_milestoneIndex] == MilestoneStatus.Submitted, "Milestone not submitted");
        
        project.milestoneStatuses[_milestoneIndex] = MilestoneStatus.Rejected;
    }
    
    /**
     * @dev Refund donation (in case of project cancellation)
     */
    function refundDonation(uint256 _donationId) external nonReentrant {
        require(_donationId > 0 && _donationId <= _donationIdCounter, "Invalid donation ID");
        
        Donation storage donation = donations[_donationId];
        require(donation.donor == msg.sender, "Not donation owner");
        require(!donation.refunded, "Already refunded");
        
        Project storage project = projects[donation.projectId];
        require(project.status == ProjectStatus.Cancelled, "Project not cancelled");
        
        donation.refunded = true;
        
        (bool success, ) = msg.sender.call{value: donation.amount}("");
        require(success, "Refund failed");
        
        emit DonationRefunded(_donationId, msg.sender, donation.amount);
    }
    
    /**
     * @dev Add authorized auditor
     */
    function addAuditor(address _auditor) external onlyOwner {
        require(_auditor != address(0), "Invalid auditor address");
        authorizedAuditors[_auditor] = true;
    }
    
    /**
     * @dev Remove authorized auditor
     */
    function removeAuditor(address _auditor) external onlyOwner {
        authorizedAuditors[_auditor] = false;
    }
    
    /**
     * @dev Get project information
     */
    function getProject(uint256 _projectId) external view returns (Project memory) {
        require(_projectId > 0 && _projectId <= _projectIdCounter, "Invalid project ID");
        return projects[_projectId];
    }
    
    /**
     * @dev Get donation information
     */
    function getDonation(uint256 _donationId) external view returns (Donation memory) {
        require(_donationId > 0 && _donationId <= _donationIdCounter, "Invalid donation ID");
        return donations[_donationId];
    }
    
    /**
     * @dev Get project donations
     */
    function getProjectDonations(uint256 _projectId) external view returns (uint256[] memory) {
        return projectDonations[_projectId];
    }
    
    /**
     * @dev Get donor donations
     */
    function getDonorDonations(address _donor) external view returns (uint256[] memory) {
        return donorDonations[_donor];
    }
    
    /**
     * @dev Get total projects count
     */
    function getTotalProjects() external view returns (uint256) {
        return _projectIdCounter;
    }
    
    /**
     * @dev Get total donations count
     */
    function getTotalDonations() external view returns (uint256) {
        return _donationIdCounter;
    }
}

