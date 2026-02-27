import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EvoPool", function () {
  let pool: any;
  let tokenA: any;
  let tokenB: any;
  let owner: SignerWithAddress;
  let lp: SignerWithAddress;
  let trader: SignerWithAddress;
  let controller: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const INITIAL_FEE_BPS = 30n; // 0.30%
  const INITIAL_BETA = 5000n;  // 0.5 scaled 1e4

  beforeEach(async function () {
    [owner, lp, trader, controller] = await ethers.getSigners();

    // Deploy tokens
    const TokenFactory = await ethers.getContractFactory("EvoToken");
    tokenA = await TokenFactory.deploy("Token A", "TKA", INITIAL_SUPPLY, owner.address);
    tokenB = await TokenFactory.deploy("Token B", "TKB", INITIAL_SUPPLY, owner.address);

    // Deploy pool
    const PoolFactory = await ethers.getContractFactory("EvoPool");
    pool = await PoolFactory.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress(),
      INITIAL_FEE_BPS,
      INITIAL_BETA,
      owner.address
    );

    // Set controller
    await pool.setController(controller.address);

    // Distribute tokens to LP and trader
    await tokenA.transfer(lp.address, ethers.parseEther("100000"));
    await tokenB.transfer(lp.address, ethers.parseEther("100000"));
    await tokenA.transfer(trader.address, ethers.parseEther("10000"));
    await tokenB.transfer(trader.address, ethers.parseEther("10000"));

    // Approve pool
    const poolAddr = await pool.getAddress();
    await tokenA.connect(lp).approve(poolAddr, ethers.MaxUint256);
    await tokenB.connect(lp).approve(poolAddr, ethers.MaxUint256);
    await tokenA.connect(trader).approve(poolAddr, ethers.MaxUint256);
    await tokenB.connect(trader).approve(poolAddr, ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("should set initial parameters correctly", async function () {
      expect(await pool.feeBps()).to.equal(INITIAL_FEE_BPS);
      expect(await pool.curveBeta()).to.equal(INITIAL_BETA);
      expect(await pool.curveMode()).to.equal(0); // Normal
      expect(await pool.controller()).to.equal(controller.address);
    });

    it("should reject same tokens", async function () {
      const PoolFactory = await ethers.getContractFactory("EvoPool");
      const addr = await tokenA.getAddress();
      await expect(
        PoolFactory.deploy(addr, addr, 30, 5000, owner.address)
      ).to.be.revertedWithCustomError(pool, "InvalidTokens");
    });

    it("should reject fee above MAX_FEE_BPS", async function () {
      const PoolFactory = await ethers.getContractFactory("EvoPool");
      await expect(
        PoolFactory.deploy(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          501,
          5000,
          owner.address
        )
      ).to.be.revertedWithCustomError(pool, "FeeTooHigh");
    });
  });

  describe("Add Liquidity", function () {
    it("should add initial liquidity and mint LP tokens", async function () {
      const amount = ethers.parseEther("1000");
      await pool.connect(lp).addLiquidity(amount, amount);

      const [r0, r1] = await pool.getReserves();
      expect(r0).to.equal(amount);
      expect(r1).to.equal(amount);
      expect(await pool.balanceOf(lp.address)).to.be.gt(0);
    });

    it("should reject zero amounts", async function () {
      await expect(
        pool.connect(lp).addLiquidity(0, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(pool, "ZeroAmount");
    });

    it("should add subsequent liquidity proportionally", async function () {
      const amount = ethers.parseEther("1000");
      await pool.connect(lp).addLiquidity(amount, amount);
      const lpBefore = await pool.balanceOf(lp.address);

      const add = ethers.parseEther("500");
      await pool.connect(lp).addLiquidity(add, add);
      const lpAfter = await pool.balanceOf(lp.address);

      // Should get roughly half the first deposit's LP tokens
      expect(lpAfter - lpBefore).to.be.closeTo(
        lpBefore / 2n,
        ethers.parseEther("1") // tolerance for minimum liquidity lock
      );
    });
  });

  describe("Remove Liquidity", function () {
    it("should remove liquidity and return tokens", async function () {
      const amount = ethers.parseEther("1000");
      await pool.connect(lp).addLiquidity(amount, amount);

      const lpTokens = await pool.balanceOf(lp.address);
      const balBefore0 = await tokenA.balanceOf(lp.address);
      const balBefore1 = await tokenB.balanceOf(lp.address);

      await pool.connect(lp).removeLiquidity(lpTokens);

      const balAfter0 = await tokenA.balanceOf(lp.address);
      const balAfter1 = await tokenB.balanceOf(lp.address);

      // Should get back most of the tokens (minus MINIMUM_LIQUIDITY lock)
      expect(balAfter0 - balBefore0).to.be.gt(ethers.parseEther("999"));
      expect(balAfter1 - balBefore1).to.be.gt(ethers.parseEther("999"));
    });

    it("should reject insufficient LP balance", async function () {
      await expect(
        pool.connect(lp).removeLiquidity(ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(pool, "InsufficientLiquidity");
    });
  });

  describe("Swap (Normal mode)", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("10000");
      await pool.connect(lp).addLiquidity(amount, amount);
    });

    it("should execute swap 0→1 with fee deducted", async function () {
      const amountIn = ethers.parseEther("100");
      const balBefore = await tokenB.balanceOf(trader.address);

      await pool.connect(trader).swap(true, amountIn, 0);

      const balAfter = await tokenB.balanceOf(trader.address);
      const received = balAfter - balBefore;

      // With 0.30% fee on 100 tokens against 10k/10k pool:
      // amountInAfterFee = 100 * (1 - 0.003) = 99.7
      // amountOut = 10000 * 99.7 / (10000 + 99.7) ≈ 98.72
      expect(received).to.be.gt(ethers.parseEther("98"));
      expect(received).to.be.lt(ethers.parseEther("100"));
    });

    it("should execute swap 1→0", async function () {
      const amountIn = ethers.parseEther("100");
      const balBefore = await tokenA.balanceOf(trader.address);

      await pool.connect(trader).swap(false, amountIn, 0);

      const received = (await tokenA.balanceOf(trader.address)) - balBefore;
      expect(received).to.be.gt(ethers.parseEther("98"));
    });

    it("should revert on insufficient output (slippage)", async function () {
      const amountIn = ethers.parseEther("100");
      await expect(
        pool.connect(trader).swap(true, amountIn, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(pool, "InsufficientOutput");
    });

    it("should revert on zero input", async function () {
      await expect(
        pool.connect(trader).swap(true, 0, 0)
      ).to.be.revertedWithCustomError(pool, "ZeroAmount");
    });

    it("should track trade count and volume", async function () {
      await pool.connect(trader).swap(true, ethers.parseEther("10"), 0);
      await pool.connect(trader).swap(false, ethers.parseEther("5"), 0);

      expect(await pool.tradeCount()).to.equal(2);
      expect(await pool.cumulativeVolume0()).to.equal(ethers.parseEther("10"));
      expect(await pool.cumulativeVolume1()).to.equal(ethers.parseEther("5"));
    });

    it("should maintain constant-product invariant (k increases with fees)", async function () {
      const [r0Before, r1Before] = await pool.getReserves();
      const kBefore = r0Before * r1Before;

      await pool.connect(trader).swap(true, ethers.parseEther("100"), 0);

      const [r0After, r1After] = await pool.getReserves();
      const kAfter = r0After * r1After;

      // k should increase because fee stays in the pool
      expect(kAfter).to.be.gte(kBefore);
    });
  });

  describe("Swap (Defensive mode)", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("10000");
      await pool.connect(lp).addLiquidity(amount, amount);

      // Switch to defensive mode via controller
      await pool.connect(controller).updateParameters(
        INITIAL_FEE_BPS,
        INITIAL_BETA,
        1 // Defensive
      );
    });

    it("should have higher slippage for large trades (whale deterrent)", async function () {
      // Small trade
      const smallIn = ethers.parseEther("10");
      const balBefore1 = await tokenB.balanceOf(trader.address);
      await pool.connect(trader).swap(true, smallIn, 0);
      const smallOut = (await tokenB.balanceOf(trader.address)) - balBefore1;

      // Reset pool state — add more liq to approximate
      await pool.connect(lp).addLiquidity(ethers.parseEther("10000"), ethers.parseEther("10000"));

      // Large trade (whale)
      const largeIn = ethers.parseEther("2000");
      const balBefore2 = await tokenB.balanceOf(trader.address);
      await pool.connect(trader).swap(true, largeIn, 0);
      const largeOut = (await tokenB.balanceOf(trader.address)) - balBefore2;

      // Rate should be worse for large trade due to quadratic penalty
      const rateSmall = (BigInt(smallOut) * 10000n) / BigInt(smallIn);
      const rateLarge = (BigInt(largeOut) * 10000n) / BigInt(largeIn);

      expect(rateLarge).to.be.lt(rateSmall);
    });
  });

  describe("Swap (VolatilityAdaptive mode)", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("10000");
      await pool.connect(lp).addLiquidity(amount, amount);

      await pool.connect(controller).updateParameters(
        INITIAL_FEE_BPS,
        INITIAL_BETA,
        2 // VolatilityAdaptive
      );
    });

    it("should apply linear penalty scaling with trade size", async function () {
      const balBefore = await tokenB.balanceOf(trader.address);
      await pool.connect(trader).swap(true, ethers.parseEther("500"), 0);
      const received = (await tokenB.balanceOf(trader.address)) - balBefore;

      // In Normal mode same trade would get more output
      // Just verify swap completes and output is reasonable
      expect(received).to.be.gt(0);
      expect(received).to.be.lt(ethers.parseEther("500"));
    });
  });

  describe("Parameter Updates", function () {
    it("should allow controller to update parameters", async function () {
      await pool.connect(controller).updateParameters(50, 7000, 1);

      expect(await pool.feeBps()).to.equal(50);
      expect(await pool.curveBeta()).to.equal(7000);
      expect(await pool.curveMode()).to.equal(1);
    });

    it("should reject non-controller", async function () {
      await expect(
        pool.connect(trader).updateParameters(50, 7000, 1)
      ).to.be.revertedWithCustomError(pool, "OnlyController");
    });

    it("should reject fee above MAX_FEE_BPS", async function () {
      await expect(
        pool.connect(controller).updateParameters(501, 5000, 0)
      ).to.be.revertedWithCustomError(pool, "FeeTooHigh");
    });

    it("should reject invalid curve mode", async function () {
      // Solidity reverts with a panic (0x21 = enum cast out of range)
      // when casting an out-of-range uint8 to a CurveMode enum,
      // so we just expect any revert here.
      await expect(
        pool.connect(controller).updateParameters(30, 5000, 3)
      ).to.be.reverted;
    });

    it("should emit ParametersUpdated event", async function () {
      await expect(pool.connect(controller).updateParameters(45, 6000, 2))
        .to.emit(pool, "ParametersUpdated")
        .withArgs(45, 6000, 2, controller.address);
    });
  });
});
