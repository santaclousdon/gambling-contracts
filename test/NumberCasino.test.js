const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("NumberCasino", function () {
  let NumberCasino, betting, owner, addr1, addr2, addr3, addrs;

  async function deployTokenFixture() {
    NumberCasino = await ethers.getContractFactory("NumberCasino");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    betting = await NumberCasino.deploy();
    // const initialBalance = await ethers.provider.getBalance(addr1.address);
    // console.log(initialBalance);
    return { betting, owner, addr1, addr2, addr3, ...addrs };
  }

  it("Should allow the owner to start and end betting", async function () {
    const { betting, owner } = await loadFixture(deployTokenFixture);
    await betting.connect(owner).startBetting();
    expect(await betting.bettingActive()).to.be.true;

    await betting.connect(owner).endBetting();
    expect(await betting.bettingActive()).to.be.false;
  });

  it("Should allow users to place bets when betting is active", async function () {
    const { betting, owner } = await loadFixture(deployTokenFixture);

    await betting.connect(owner).startBetting();
    await betting
      .connect(addr1)
      .placeBet(5, { value: ethers.parseEther("1.0") });

    expect(await betting.numberToTotalBet(5)).to.equal(
      ethers.parseEther("1.0")
    );
  });

  it("Should allow winners to withdraw their winnings", async function () {
    // Assuming you have a way to ensure addr1 is the winner for this test
    const { betting, owner, addr1, addr2, addr3 } = await loadFixture(
      deployTokenFixture
    );

    await betting.connect(owner).startBetting();
    await betting
      .connect(addr1)
      .placeBet(5, { value: ethers.parseEther("500.0") });
    await betting
      .connect(addr2)
      .placeBet(2, { value: ethers.parseEther("200.0") });
    await betting
      .connect(addr3)
      .placeBet(3, { value: ethers.parseEther("300.0") });
    await betting.connect(owner).endBetting();

    const winningNumber = await betting.winningNumber();
    console.log("winningNumber", winningNumber);
    if (winningNumber === 5n) {
      const addr_initialBalance = await ethers.provider.getBalance(
        addr1.address
      );
      console.log("addr initialBalance", addr_initialBalance);
      await expect(
        betting.connect(addr1).withdrawWinnings()
      ).not.to.be.revertedWith("Not a winner this round.");
      const addr_finalBalance = await ethers.provider.getBalance(addr1.address);
      console.log("addr finalBalance", addr_finalBalance);
      expect(addr_finalBalance).to.be.above(addr_initialBalance);
      // expect(addr_initialBalance).to.be.above(addr_finalBalance);
    } else if (winningNumber === 2n) {
      await expect(
        betting.connect(addr2).withdrawWinnings()
      ).not.to.be.revertedWith("Not a winner this round.");
    } else if (winningNumber === 3n) {
      await expect(
        betting.connect(addr3).withdrawWinnings()
      ).not.to.be.revertedWith("Not a winner this round.");
    } else {
      await expect(
        betting.connect(addr1).withdrawWinnings()
      ).to.be.revertedWith("Not a winner this round.");
      await expect(
        betting.connect(addr2).withdrawWinnings()
      ).to.be.revertedWith("Not a winner this round.");
      await expect(
        betting.connect(addr3).withdrawWinnings()
      ).to.be.revertedWith("Not a winner this round.");
    }

    // const addr_finalBalance = await ethers.provider.getBalance(addr1.address);
    // console.log("addr finalBalance", addr_finalBalance);
  });

  it("Should allow the owner to withdraw house earnings", async function () {
    const { betting, owner, addr1, addr2, addr3 } = await loadFixture(
      deployTokenFixture
    );
    const winningNumber = await betting.winningNumber();
    console.log("winningNumber", winningNumber);
    // Setup bets and end betting to ensure there are house earnings
    const owner_initialBalance = await ethers.provider.getBalance(
      owner.address
    );
    console.log("owner initialBalance", owner_initialBalance);

    await betting.connect(owner).startBetting();
    await betting
      .connect(addr1)
      .placeBet(5, { value: ethers.parseEther("200.0") });
    await betting
      .connect(addr2)
      .placeBet(2, { value: ethers.parseEther("500.0") });
    await betting
      .connect(addr3)
      .placeBet(3, { value: ethers.parseEther("300.0") });
    await betting.connect(owner).endBetting();

    await betting.connect(owner).withdrawHouseEarnings();
    const owner_finalBalance = await ethers.provider.getBalance(owner.address);
    console.log("owner finalBalance", owner_finalBalance);
    const addr1_finalBalance = await ethers.provider.getBalance(addr1.address);
    // console.log("addr finalBalance", addr1_finalBalance);

    expect(owner_finalBalance).to.be.above(owner_initialBalance);
  });

  it("Should not allow non-owners to start/end betting or withdraw house earnings", async function () {
    const { betting, addr1 } = await loadFixture(deployTokenFixture);

    await expect(betting.connect(addr1).startBetting()).to.be.revertedWith(
      "Only the owner can perform this action."
    );
    await expect(betting.connect(addr1).endBetting()).to.be.revertedWith(
      "Only the owner can perform this action."
    );
    await expect(
      betting.connect(addr1).withdrawHouseEarnings()
    ).to.be.revertedWith("Only the owner can perform this action.");
  });
});
