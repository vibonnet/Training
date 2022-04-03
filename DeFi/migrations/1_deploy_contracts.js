const Token = artifacts.require("Token.sol");
const VaultToken = artifacts.require("VaultToken.sol");
const Vault = artifacts.require("VaultContract.sol");

module.exports = function (deployer) {
  deployer.deploy(Vault, Token_address, VaultToken_address);
};

module.exports = async function (deployer) {
  await deployer.deploy(Token, "TheToken", "THT", BigInt(1e20));
  const token = await Token.deployed();
  await deployer.deploy(VaultToken, "ProofToken", "PTK");
  const vaultToken = await VaultToken.deployed();
  await deployer.deploy(Vault, token.address, vaultToken.address);
  const vault = await Vault.deployed();
};