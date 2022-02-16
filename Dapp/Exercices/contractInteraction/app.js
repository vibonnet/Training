const Web3 = require("web3");
const web3 = new Web3("https://ropsten.infura.io/v3/e8246a50717946f0ae86d5eb657c3c67");

const address = "0x8cD906ff391b25304E0572b92028bE24eC1eABFb"
const ABI = [
	{
		"inputs": [],
		"name": "get",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const simpleStorage = new web3.eth.Contract(ABI, address);

simpleStorage.methods.get().call((err,data) => {
    if (err) console.log(err);
    else console.log(data);
});