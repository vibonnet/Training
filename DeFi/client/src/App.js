import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import VaultContract from "./contracts/VaultContract.json";
import TokenContract from "./contracts/Token.json";
import VaultTokenContract from "./contracts/VaultToken.json";
import getWeb3 from "./getWeb3";
import "./App.css";

const BigNumber = require('bignumber.js');

class App extends Component {
  state = { web3: null, accounts: null, vault: null, token: null, vaultToken: null, ethprice: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork1 = VaultContract.networks[networkId];

      const vault_instance = new web3.eth.Contract(
        VaultContract.abi,
        deployedNetwork1 && deployedNetwork1.address,
      );

      const deployedNetwork2 = TokenContract.networks[networkId];
      const token_instance = new web3.eth.Contract(
        TokenContract.abi,
        deployedNetwork2 && deployedNetwork2.address,
      );

      const deployedNetwork3 = VaultTokenContract.networks[networkId];
      const vaultToken_instance = new web3.eth.Contract(
        VaultTokenContract.abi,
        deployedNetwork3 && deployedNetwork3.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, vault: vault_instance, token: token_instance, vaultToken: vaultToken_instance }, this.runExample);
      this.run()
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  // Update state when an event occur
  componentDidUpdate = async () => {
    const { contract } = this.state;
    await window.ethereum.on('accountsChanged', (accounts) => {
      this.setState({ accounts });
    });
  }

  run = async () => {
    await this.getPrice();
  };

  // Init balance and ownership
  init = async () => {
    const { accounts, vaultToken, vault, token } = this.state;
    let amount = new BigNumber(50000).shiftedBy(18);
    await token.methods.transfer(vault._address, amount).send({ from: accounts[0] });
    await vaultToken.methods.transferOwnership(vault._address).send({ from: accounts[0] });
    this.run();
  };

  // Get ETH price
  getPrice = async () => {
    const { vault } = this.state;
    const res = await vault.methods.getLatestPrice().call()
    const price = new BigNumber(res).shiftedBy(-8);
    this.setState({ ethprice: price.c[0] })
  }

  // Execute "depositToken" function in the contract
  deposit = async () => {
    const { accounts, token, vault } = this.state;
    const amount = new BigNumber(this.deposit_amount.value).shiftedBy(18);
    console.log(amount)
    // Approve
    await token.methods.approve(vault._address, amount).send({ from: accounts[0] });
    await vault.methods.depositToken(amount).send({ from: accounts[0] });
  };

  // Execute "withdrawToken" function in the contract
  withdraw = async () => {
    const { accounts, vault } = this.state;
    const amount = new BigNumber(this.withdraw_amount.value).shiftedBy(18);
    console.log(this.withdraw_amount.value)
    await vault.methods.withdrawToken(amount).send({ from: accounts[0] });
  };

  render() {
    const { accounts, ethprice } = this.state;
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div>
          <h2 className="text-center">Token Staking</h2>
          <p className="text-center">{accounts[0]}</p>
          <p className="text-center">ETH={ethprice}$</p>
          <hr></hr>
          <br></br>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Deposit Token</strong></Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Control type="text" id="deposit" placeholder="Entrer amount"
                  ref={(input) => { this.deposit_amount = input }}
                />
              </Form.Group>
              <Button onClick={this.deposit} variant="dark" > Stake </Button>
            </Card.Body>
          </Card>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Withdraw Token</strong></Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Control type="text" id="withdraw" placeholder="Entrer amount"
                  ref={(input) => { this.withdraw_amount = input }}
                />
              </Form.Group>
              <Button onClick={this.withdraw} variant="dark" > Unstake </Button>
            </Card.Body>
          </Card>
        </div>
      </div>

    );
  }
}

export default App;