// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 public tokenCounter;
    uint96 public constant DECIMALS = 1e18;

    struct Listing {
        address owner;
        uint96 price;
        bool isSold;
    }

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256) public pendingWithdrawals;

    event ItemListed(uint256 indexed tokenId, address owner, uint96 price);
    event ItemSold(uint256 indexed tokenId, address buyer, uint96 price);

    constructor() ERC721("NFTMarket", "NFTM") {
        tokenCounter = 0;
    }

    function mintAndList(string memory _uri, uint96 _price) external {
        require(_price > 0, "Price must be > 0");

        uint256 tokenId = tokenCounter;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uri);

        listings[tokenId] = Listing(msg.sender, _price, false);
        tokenCounter++;

        emit ItemListed(tokenId, msg.sender, _price);
    }

    function buy(uint256 _tokenId) external payable nonReentrant {
        Listing storage item = listings[_tokenId];
        require(!item.isSold, "Already sold");
        require(msg.value == item.price, "Incorrect price");

        item.isSold = true;
        pendingWithdrawals[item.owner] += msg.value;

        _transfer(item.owner, msg.sender, _tokenId);
        emit ItemSold(_tokenId, msg.sender, item.price);
    }

    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds");
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function getListing(
        uint256 _tokenId
    ) external view returns (address, uint96, bool) {
        Listing memory item = listings[_tokenId];
        return (item.owner, item.price, item.isSold);
    }
}
