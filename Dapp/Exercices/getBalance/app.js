const Web3 = require("web3");
const web3 = new Web3("https://mainnet.infura.io/v3/e8246a50717946f0ae86d5eb657c3c67");

web3.eth.getBalance("0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c", function (err, result) {
    if (err) console.log(err);
    else console.log(web3.utils.fromWei(result, "ether") + " ETH")
});