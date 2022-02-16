'use strict';

const { expectRevert, expectEvent, BN } = require('@openzeppelin/test-helpers');

const Voting = artifacts.require('Voting');

contract('Voting', function (accounts) {
    const owner = accounts[0];
    const participant1 = accounts[1];
    const participant2 = accounts[2];

    it('Only owner can register voter', async function () {
        const VotingIntance = await Voting.deployed();

        const registerVoter = await VotingIntance.registerVoter(participant1, { from: owner });

        await expectEvent(registerVoter, 'VoterRegistered', { voterAddress: participant1 });
        await expectRevert(VotingIntance.registerVoter(participant1, { from: participant1 }), "Ownable: caller is not the owner");
    });

    it('Only Owner can change status', async function () {
        const VotingIntance = await Voting.deployed();
        const previousStatus = await VotingIntance.status.call();

        const changeStatus = await VotingIntance.changeStatus(1, { from: owner });
        const newStatus = await VotingIntance.status.call();

        await expectEvent(changeStatus, 'WorkflowStatusChange', { previousStatus: previousStatus, newStatus: newStatus });
        await expectRevert(VotingIntance.changeStatus(2, { from: participant1 }), "Ownable: caller is not the owner");
    });

    it('Only voters can rergister proposal', async function () {
        const VotingIntance = await Voting.deployed();

        const proposalRegistration = await VotingIntance.proposalRegistration("First proposal", { from: participant1 });
        const proposalId = new BN(0);

        await expectEvent(proposalRegistration, 'ProposalRegistered', { proposalId: proposalId });
        await expectRevert(VotingIntance.proposalRegistration({ from: participant2 }), "Voter not registered");
    });

    it('Only voters can vote once for existing proposal', async function () {
        const VotingIntance = await Voting.deployed();
        await VotingIntance.changeStatus(3, { from: owner });

        const proposalId = new BN(0);
        const vote = await VotingIntance.vote(proposalId, { from: participant1 });

        await expectEvent(vote, 'Voted', { voter: participant1, proposalId: proposalId });
        await expectRevert(VotingIntance.vote(proposalId, { from: participant2 }), "Voter not registered");
        await expectRevert(VotingIntance.vote(proposalId, { from: participant1 }), "Voter has already voted");
        await expectRevert(VotingIntance.vote(10, { from: participant1 }), "Proposal not found");
    });

    it('Only owner can tally', async function () {
        const VotingIntance = await Voting.deployed();
        await VotingIntance.changeStatus(4, { from: owner });

        await expectRevert(VotingIntance.tally({ from: participant1 }), "Ownable: caller is not the owner");

        await VotingIntance.tally({ from: owner });        
        const result = await VotingIntance.getWinner();
        
        assert.equal(0, result, "This is not the winner");
    });
});