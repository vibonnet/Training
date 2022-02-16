// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

contract AuctionVulnerable {
    address highestBidder;
    uint256 highestBid;

    function bid() public payable {
        require(msg.value >= highestBid);

        if (highestBidder != address(0)) {
            (bool success, ) = highestBidder.call{value: highestBid}("");
            require(success); // if highestBidder ca not receive found it constently fails and no one else can bid (DoS)
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
    }
}

contract AuctionFixed {
    address highestBidder;
    uint256 highestBid;
    mapping(address => uint256) refunds;

    function bid() external payable {
        require(msg.value >= highestBid);

        if (highestBidder != address(0)) {
            refunds[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function withdraw() external payable {
        require(refunds[msg.sender] >= 0);
        uint256 refund = refunds[msg.sender];
        refunds[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: refund}("");
        require(success);
    }
}
