// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    mapping (address => Voter) private _voters;
    Proposal[] public proposals;
    WorkflowStatus public status = WorkflowStatus.RegisteringVoters;
    uint winningProposalId;

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    modifier isRegistered() {
        require(_voters[msg.sender].isRegistered == true, "Voter not registered");
        _;
    }

    function changeStatus(WorkflowStatus _newStatus) public onlyOwner {
        WorkflowStatus _previousStatus = status;
        status = _newStatus;
        emit WorkflowStatusChange(_previousStatus, _newStatus);
    }

    function registerVoter(address _address) public onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "Voters registrations hasn't started yet");
        require(_voters[_address].isRegistered == false, "Voter already registered");
        _voters[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }

    function proposalRegistration(string memory _description) public isRegistered {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration hasn't started yet");
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length -1);
    }

    function vote(uint _proposalId) public isRegistered {
        require(status == WorkflowStatus.VotingSessionStarted, "Voting session hasn't started yet");
        require(_proposalId < proposals.length, "Proposal not found");
        require(_voters[msg.sender].hasVoted == false, "Voter has already voted");
        _voters[msg.sender].votedProposalId = _proposalId;
        _voters[msg.sender].hasVoted = true;
        proposals[_proposalId].voteCount ++;
        emit Voted(msg.sender, _proposalId);        
    }

    function tally() public onlyOwner returns(uint) {
        require(status == WorkflowStatus.VotingSessionEnded, "Voting session hasn't ended yet");
        require(proposals.length != 0, "There is not proposal");
        for (uint i = 0; i < proposals.length; i++) {
            if (winningProposalId < proposals[i].voteCount) {
                winningProposalId = proposals[i].voteCount;
            }
        }
        status = WorkflowStatus.VotesTallied;        
        return winningProposalId;
    }

    function getWinner() public view returns(Proposal memory) {
        require(status == WorkflowStatus.VotesTallied, "Talling session isn't finish");
        return proposals[winningProposalId];
    }

    function getProposals() public view returns(Proposal[] memory) {
        return proposals;
    }

    function getVoter(address _address) public view onlyOwner returns(Voter memory) {
        return _voters[_address];
    }
}