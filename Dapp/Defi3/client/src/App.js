import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, contract: null, voters: null, proposals: null, winner: null, };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Voting.networks[networkId];
      const instance = new web3.eth.Contract(
        Voting.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.run);
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
    await contract.events.VoterRegistered(() => {
      this.run();
    });
    await contract.events.ProposalRegistered(() => {
      this.run();
    });
    await contract.events.Voted(() => {
      this.run();
    });
  }

  run = async () => {
    const { contract } = this.state;

    // Get the values from the contract.
    const voters = await contract.methods.getVoter().call();
    const proposals = await contract.methods.getProposals().call();

    const status = await contract.methods.status.call().call();
    if (status === 5) {
      const winner = await contract.methods.getWinner().call();
      alert("Proposition retenue: " + winner);
    }

    // Update state with the results.
    this.setState({ voters: voters, proposals: proposals });
  };

  // Execute "registerVoter" function in the contract
  registerVoter = async () => {
    const { accounts, contract } = this.state;
    const address = this.address.value;

    await contract.methods.registerVoter(address).send({ from: accounts[0] });
    this.run();
  };

  // Execute "changeStatus" function in the contract
  changeStatus = async () => {
    const { accounts, contract } = this.state;
    const status = this.status.value;

    await contract.methods.changeStatus(status).send({ from: accounts[0] });
    this.run();
  };

  // Execute "proposalRegistration" function in the contract
  proposalRegistration = async () => {
    const { accounts, contract } = this.state;
    const description = this.description.value;

    await contract.methods.proposalRegistration(description).send({ from: accounts[0] });
    this.run();
  };

  // Execute "vote" function in the contract
  vote = async () => {
    const { accounts, contract } = this.state;
    const propositionId = this.propositionId.value;

    await contract.methods.vote(propositionId).send({ from: accounts[0] });
    this.run();
  };

  // Execute "tally" function in the contract
  tally = async () => {
    const { accounts, contract } = this.state;

    await contract.methods.tally().send({ from: accounts[0] });
    this.run();
  };

  render() {
    const { voters, proposals, accounts } = this.state;
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div>
          <h2 className="text-center">Système de vote</h2>
          <p className="text-center">{accounts[0]}</p>
          <hr></hr>
          <br></br>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Liste des votants enregistrés</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voters !== null &&
                        voters.map((a) => <tr><td>{a}</td></tr>)
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <br></br>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Liste des propositions enregistrées</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <tbody>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Description</th>
                        <th scope="col">Votes</th>
                      </tr>
                      {proposals !== null &&
                        proposals.map((a, index) =>
                          <tr>
                            <td>{index}</td>
                            <td>{a[0]}</td>
                            <td>{a[1]}</td>
                          </tr>
                        )
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Form.Group>
                  <Form.Control type="text" id="propositionId" placeholder="ID de la proposition"
                    ref={(input) => { this.propositionId = input }}
                  />
                </Form.Group>
                <Button onClick={this.vote} variant="dark" > Voter </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
        <br></br>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Faire une proposition</strong></Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Control type="text" id="description" placeholder="Entrer une proposition"
                  ref={(input) => { this.description = input }}
                />
              </Form.Group>
              <Button onClick={this.proposalRegistration} variant="dark" > Proposer </Button>
            </Card.Body>
          </Card>
        </div>
        <br></br>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Administrer</strong></Card.Header>
            <Card.Body>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Form.Group>
                  <Form.Control type="text" id="address" placeholder="Entrer un nouveau votant"
                    ref={(input) => { this.address = input }}
                  />
                </Form.Group>
                <Button onClick={this.registerVoter} variant="dark" > Autoriser </Button>
              </div>
              <br></br>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Form.Group>
                  <Form.Select ref={(value) => { this.status = value }}>
                    <option>Changer de status</option>
                    <option value="0">RegisteringVoters</option>
                    <option value="1">ProposalsRegistrationStarted</option>
                    <option value="2">ProposalsRegistrationEnded</option>
                    <option value="3">VotingSessionStarted</option>
                    <option value="4">VotingSessionEnded</option>
                    <option value="5">VotesTallied</option>
                  </Form.Select>
                </Form.Group>
                <Button onClick={this.changeStatus} variant="dark" > Changer </Button>
              </div>
              <br></br>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button onClick={this.tally} variant="dark" > Décompter </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }
}

export default App;
