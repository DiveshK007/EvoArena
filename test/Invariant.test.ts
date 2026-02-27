import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Invariant / Fuzz-Style Tests
 *
 * Exercises the pool with randomized inputs to verify:
 * 1. K (reserve product) never decreases after a swap
 * 2. LP tokens maintain proportional value
 * 3. Reserves always stay positive
 * 4. Fee collection is monotonically increasing
 * 5. TWAP accumulators are monotonically increasing
 */
describe("Invariant Tests", function () {
  let pool: any;
  let tokenA: any;
  let tokenB: any;
  let owner: SignerWithAddress;
  let lp: SignerWithAddress;
  let trader: SignerWithAddress;
  let controller: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("10000000");
  const SEED = ethers.parseEther("100000");

  beforeEach(async function () {
    [owner, lp, trader, controller] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("EvoToken");
    tokenA = await TokenFactory.deploy("Token A", "TKA", INITIAL_SUPPLY, owner.address);
    tokenB = await TokenFactory.deploy("Token B", "TKB", INITIAL_SUPPLY, owner.address);

    const PoolFactory = await ethers.getContractFactory("EvoPool");
    pool = await PoolFactory.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress(),
      30,   // fee bps
      5000, // beta
      owner.address
    );

    await pool.setController(controller.address);

    // Seed liquidity
    await tokenA.transfer(lp.address, SEED);
    await tokenB.transfer(lp.address, SEED);
    await tokenA.connect(lp).approve(await pool.getAddress(), SEED);
    await tokenB.connect(lp).approve(await pool.getAddress(), SEED);
    await pool.connect(lp).addLiquidity(SEED, SEED);

    // Fund trader
    const traderFunds = ethers.parseEther("500000");
    await tokenA.transfer(trader.address, traderFunds);
    await tokenB.transfer(trader.address, traderFunds);
    await tokenA.connect(trader).approve(await pool.getAddress(), traderFunds);
    await tokenB.connect(trader).approve(await pool.getAddress(), traderFunds);
  });

  function getK(r0: bigint, r1: bigint): bigint {
    return r0 * r1;
  }

  describe("K invariant — reserve product never decreases on swap", function () {
    const SWAP_SIZES = [
      ethers.parseEther("1"),
      ethers.parseEther("10"),
      ethers.parseEther("100"),
      ethers.parseEther("500"),
      ethers.parseEther("1000"),
      ethers.parseEther("5000"),
      ethers.parseEther("10000"),
    ];

    for (const size of SWAP_SIZES) {
      it(`K non-decreasing for swap size ${ethers.formatEther(size)} (token0→token1)`, async function () {
        const [r0Before, r1Before] = await pool.getReserves();
        const kBefore = getK(r0Before, r1Before);

        await pool.connect(trader).swap(true, size, 0);

        const [r0After, r1After] = await pool.getReserves();
        const kAfter = getK(r0After, r1After);

        expect(kAfter).to.be.gte(kBefore);
      });

      it(`K non-decreasing for swap size ${ethers.formatEther(size)} (token1→token0)`, async function () {
        const [r0Before, r1Before] = await pool.getReserves();
        const kBefore = getK(r0Before, r1Before);

        await pool.connect(trader).swap(false, size, 0);

        const [r0After, r1After] = await pool.getReserves();
        const kAfter = getK(r0After, r1After);

        expect(kAfter).to.be.gte(kBefore);
      });
    }
  });

  describe("K invariant across all 3 curve modes", function () {
    const modes = [0, 1, 2]; // Normal, Defensive, VolatilityAdaptive
    const modeNames = ["Normal", "Defensive", "VolatilityAdaptive"];

    for (let i = 0; i < modes.length; i++) {
      it(`K non-decreasing in ${modeNames[i]} mode after 10 alternating swaps`, async function () {
        // Set curve mode via controller (updateParameters takes 4 args: fee, beta, mode, agent)
        await pool.connect(controller).updateParameters(30, 5000, modes[i], controller.address);

        const [r0Init, r1Init] = await pool.getReserves();
        let prevK = getK(r0Init, r1Init);

        for (let j = 0; j < 10; j++) {
          const direction = j % 2 === 0;
          const amount = ethers.parseEther(String(50 + Math.floor(Math.random() * 450)));
          await pool.connect(trader).swap(direction, amount, 0);

          const [r0, r1] = await pool.getReserves();
          const currentK = getK(r0, r1);
          expect(currentK).to.be.gte(prevK, `K decreased on swap ${j + 1} in ${modeNames[i]} mode`);
          prevK = currentK;
        }
      });
    }
  });

  describe("Reserve positivity — reserves never hit zero", function () {
    it("reserves stay positive after 20 random swaps", async function () {
      for (let i = 0; i < 20; i++) {
        const direction = i % 3 !== 0; // mix of directions
        const amount = ethers.parseEther(String(10 + Math.floor(Math.random() * 990)));
        await pool.connect(trader).swap(direction, amount, 0);

        const [r0, r1] = await pool.getReserves();
        expect(r0).to.be.gt(0, `Reserve0 hit zero on swap ${i + 1}`);
        expect(r1).to.be.gt(0, `Reserve1 hit zero on swap ${i + 1}`);
      }
    });
  });

  describe("Fee accumulation is monotonic", function () {
    it("cumulative volume only increases", async function () {
      let prevVol0 = 0n;
      let prevVol1 = 0n;

      for (let i = 0; i < 10; i++) {
        const direction = i % 2 === 0;
        await pool.connect(trader).swap(direction, ethers.parseEther("100"), 0);

        const vol0 = await pool.cumulativeVolume0();
        const vol1 = await pool.cumulativeVolume1();

        expect(vol0).to.be.gte(prevVol0);
        expect(vol1).to.be.gte(prevVol1);
        prevVol0 = vol0;
        prevVol1 = vol1;
      }
    });

    it("trade count strictly increases", async function () {
      const countBefore = await pool.tradeCount();

      await pool.connect(trader).swap(true, ethers.parseEther("100"), 0);
      await pool.connect(trader).swap(false, ethers.parseEther("100"), 0);

      const countAfter = await pool.tradeCount();
      expect(countAfter).to.equal(countBefore + 2n);
    });
  });

  describe("TWAP accumulator monotonicity", function () {
    it("price accumulators never decrease over multiple blocks", async function () {
      // Do initial swap to start accumulators
      await pool.connect(trader).swap(true, ethers.parseEther("100"), 0);

      // Advance time
      await ethers.provider.send("evm_increaseTime", [15]);
      await ethers.provider.send("evm_mine", []);

      const accum0Before = await pool.price0CumulativeLast();

      // Another swap updates accumulators
      await pool.connect(trader).swap(false, ethers.parseEther("100"), 0);

      await ethers.provider.send("evm_increaseTime", [15]);
      await ethers.provider.send("evm_mine", []);

      // One more swap
      await pool.connect(trader).swap(true, ethers.parseEther("50"), 0);
      const accum0After = await pool.price0CumulativeLast();

      expect(accum0After).to.be.gte(accum0Before);
    });
  });

  describe("LP token proportionality", function () {
    it("LP gets proportional share on second deposit", async function () {
      const lpTokensBefore = await pool.balanceOf(lp.address);
      const totalSupplyBefore = await pool.totalSupply();
      const [r0Before] = await pool.getReserves();

      // Second deposit (smaller)
      const addAmount = ethers.parseEther("10000");
      await tokenA.transfer(lp.address, addAmount);
      await tokenB.transfer(lp.address, addAmount);
      await tokenA.connect(lp).approve(await pool.getAddress(), addAmount);
      await tokenB.connect(lp).approve(await pool.getAddress(), addAmount);
      await pool.connect(lp).addLiquidity(addAmount, addAmount);

      const lpTokensAfter = await pool.balanceOf(lp.address);
      const newTokens = BigInt(lpTokensAfter) - BigInt(lpTokensBefore);
      const expectedTokens = (BigInt(addAmount) * BigInt(totalSupplyBefore)) / BigInt(r0Before);

      // Allow 0.1% tolerance for rounding
      const diff = newTokens > expectedTokens
        ? newTokens - expectedTokens
        : expectedTokens - newTokens;
      expect(diff * 1000n / expectedTokens).to.be.lte(1n);
    });

    it("remove liquidity returns proportional reserves", async function () {
      const lpTokens = await pool.balanceOf(lp.address);
      const totalSupply = await pool.totalSupply();
      const [r0, r1] = await pool.getReserves();

      const burnAmount = lpTokens / 4n; // burn 25%
      const expectedA = (burnAmount * r0) / totalSupply;
      const expectedB = (burnAmount * r1) / totalSupply;

      const balABefore = await tokenA.balanceOf(lp.address);
      const balBBefore = await tokenB.balanceOf(lp.address);

      await pool.connect(lp).removeLiquidity(burnAmount);

      const balAAfter = await tokenA.balanceOf(lp.address);
      const balBAfter = await tokenB.balanceOf(lp.address);

      const gotA = BigInt(balAAfter) - BigInt(balABefore);
      const gotB = BigInt(balBAfter) - BigInt(balBBefore);

      // Within 0.1% of expected
      expect(gotA * 1000n / BigInt(expectedA)).to.be.gte(999n);
      expect(gotB * 1000n / BigInt(expectedB)).to.be.gte(999n);
    });
  });

  describe("Stress test — high-frequency trading", function () {
    it("pool remains consistent after 50 rapid swaps", async function () {
      const [r0Init, r1Init] = await pool.getReserves();
      const kInit = getK(r0Init, r1Init);

      for (let i = 0; i < 50; i++) {
        const direction = i % 2 === 0;
        const amount = ethers.parseEther(String(5 + (i % 20)));
        await pool.connect(trader).swap(direction, amount, 0);
      }

      const [r0Final, r1Final] = await pool.getReserves();
      const kFinal = getK(r0Final, r1Final);

      // K should have grown from accumulated fees
      expect(kFinal).to.be.gt(kInit);

      // Reserves still positive
      expect(r0Final).to.be.gt(0);
      expect(r1Final).to.be.gt(0);

      // Trade count correct
      expect(await pool.tradeCount()).to.equal(50);
    });
  });
});
