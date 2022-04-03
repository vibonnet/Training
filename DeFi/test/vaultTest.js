const Token = artifacts.require("Token.sol");
const VaultToken = artifacts.require("VaultToken.sol");
const Vault = artifacts.require("VaultContract.sol");
const { expectEvent } = require("@openzeppelin/test-helpers");


contract("Vault", (accounts) => {

    let token, vaultToken, vault, deposit;
    let owner = accounts[0];
    let user = accounts[1];
    let depositamount = BigInt(1e18);


    before(async () => {

        token = await Token.deployed();
        vaultToken = await VaultToken.deployed();
        vault = await Vault.deployed();
        await token.transfer(user, BigInt(1e19), { from: owner });
        await token.transfer(vault.address, BigInt(9 * 1e19), { from: owner });
        await token.approve(vault.address, BigInt(1e19), { from: user });
        await vaultToken.transferOwnership(vault.address, { from: owner });

        intialBalanceOfTokens = await token.balanceOf(user);
        initialBalanceOfProofToken = await vaultToken.balanceOf(user);

    })
        / it("should deploy all the smart contract", async () => {
            assert(token.address != undefined);
            assert(vaultToken.address != undefined);
            assert(vault.address != undefined);
        })

    describe(" First Case : user deposits THT token and receives PTK tokens ", async () => {
        before(async () => {
            deposit = await vault.depositToken(depositamount, { from: user });
            updatedTokenBalance = await token.balanceOf(user);
        })

        it("should update user balance of THT and PTK", async () => {
            newBalanceOfTokens = await token.balanceOf(user);
            newBalanceOfProofToken = await vaultToken.balanceOf(user);
            assert(intialBalanceOfTokens.cmp(newBalanceOfTokens) == 1, "user Tokens were not updated");
            assert(initialBalanceOfProofToken.cmp(newBalanceOfProofToken) == -1, "user Proof Tokens were not updated");
        })

        it("should fire a 'Deposit' event", () => {
            expectEvent(deposit, "Deposit");
        })

        it("should change user balance in the vault", async () => {
            balance = await vault.getUserDeposit(user);
            assert(balance.toString() == depositamount.toString(), "amount not depositied correctly");
        })
    })


    describe("Second case : user deposit PTK in order to withdraws THT tokens ", async () => {
        before(async () => {
            withdraw = await vault.withdrawToken(depositamount, { from: user });
            finalTokenBalance = await token.balanceOf(user);
        })

        it("should fire a 'Withdraw' event", async () => {
            expectEvent(withdraw, "Witdhraw");
        })

        it("user token balance should be zero", async () => {
            newBalance = await vault.getUserDeposit(user);
            assert(newBalance.toString() == "0", "user Token balance should be zero ");
        })

        it("should update user balance of THT and PTK", async () => {
            finalBalanceOfTokens = await token.balanceOf(user);
            finalBalanceOfProofToken = await vaultToken.balanceOf(user);
            assert(finalBalanceOfTokens.toString() == intialBalanceOfTokens.toString(), "user Tokens were not updated");
        })
    })
});