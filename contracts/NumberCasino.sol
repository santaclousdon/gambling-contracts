// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NumberCasino {
    address public owner;
    bool public bettingActive = false;
    mapping(uint256 => uint256) public numberToTotalBet; // Maps number to total ETH bet on it
    mapping(uint256 => address[]) public numberToBettors; // Maps number to bettors
    mapping(address => uint256) public bettorToAmount; // Maps bettor to amount they bet
    uint256 public houseEarnings;
    uint256 public winningNumber;
    uint256 private totalBetAmount;
    uint256 private seed;

    event BetPlaced(address bettor, uint256 amount, uint256 numberSelected);
    event BettingStarted();
    event BettingEnded(uint256 winningNumber);
    event WinningsWithdrawn(address winner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function startBetting() public onlyOwner {
        require(!bettingActive, "Betting round already active.");
        bettingActive = true;
        emit BettingStarted();
    }

    function endBetting() public onlyOwner {
        require(bettingActive, "No betting round active.");
        bettingActive = false;
        winningNumber =
            (uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.difficulty, seed++)
                )
            ) % 10) +
            1; // Simple RNG
        houseEarnings += (totalBetAmount * 10) / 100; // 10% to house
        emit BettingEnded(winningNumber);
    }

    function placeBet(uint256 number) public payable {
        require(bettingActive, "No betting round active.");
        require(
            number >= 1 && number <= 10,
            "Number must be between 1 and 10."
        );
        require(msg.value > 0, "Must bet some ETH.");
        numberToTotalBet[number] += msg.value;
        numberToBettors[number].push(msg.sender);
        bettorToAmount[msg.sender] += msg.value;
        totalBetAmount += msg.value;
        emit BetPlaced(msg.sender, msg.value, number);
    }

    function withdrawWinnings() public {
        require(!bettingActive, "Betting round must be ended to withdraw.");
        require(bettorToAmount[msg.sender] > 0, "No bet placed.");
        require(isWinner(msg.sender), "Not a winner this round.");

        uint256 winnerTotalBet = numberToTotalBet[winningNumber];
        uint256 winnerShare = (totalBetAmount * 90) / 100; // 90% split among winners
        uint256 amountToWithdraw = (bettorToAmount[msg.sender] * winnerShare) /
            winnerTotalBet;

        // Ensure winnings can't be withdrawn more than once
        bettorToAmount[msg.sender] = 0;

        payable(msg.sender).transfer(amountToWithdraw);
        emit WinningsWithdrawn(msg.sender, amountToWithdraw);
    }

    function isWinner(address bettor) public view returns (bool) {
        for (uint256 i = 0; i < numberToBettors[winningNumber].length; i++) {
            if (numberToBettors[winningNumber][i] == bettor) {
                return true;
            }
        }
        return false;
    }

    // Allows the contract owner to withdraw house earnings
    function withdrawHouseEarnings() public onlyOwner {
        payable(owner).transfer(houseEarnings);
        houseEarnings = 0;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
