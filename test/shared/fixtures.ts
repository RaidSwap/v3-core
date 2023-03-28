import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockTimeRaidswapV3Pool } from '../../typechain/MockTimeRaidswapV3Pool'
import { TestERC20 } from '../../typechain/TestERC20'
import { RaidswapV3Factory } from '../../typechain/RaidswapV3Factory'
import { TestRaidswapV3Callee } from '../../typechain/TestRaidswapV3Callee'
import { TestRaidswapV3Router } from '../../typechain/TestRaidswapV3Router'
import { MockTimeRaidswapV3PoolDeployer } from '../../typechain/MockTimeRaidswapV3PoolDeployer'

import { Fixture } from 'ethereum-waffle'

interface FactoryFixture {
  factory: RaidswapV3Factory
}

async function factoryFixture(): Promise<FactoryFixture> {
  const factoryFactory = await ethers.getContractFactory('RaidswapV3Factory')
  const factory = (await factoryFactory.deploy()) as RaidswapV3Factory
  return { factory }
}

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20')
  const tokenA = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenB = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenC = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}

type TokensAndFactoryFixture = FactoryFixture & TokensFixture

interface PoolFixture extends TokensAndFactoryFixture {
  swapTargetCallee: TestRaidswapV3Callee
  swapTargetRouter: TestRaidswapV3Router
  createPool(
    fee: number,
    tickSpacing: number,
    firstToken?: TestERC20,
    secondToken?: TestERC20
  ): Promise<MockTimeRaidswapV3Pool>
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory } = await factoryFixture()
  const { token0, token1, token2 } = await tokensFixture()

  const MockTimeRaidswapV3PoolDeployerFactory = await ethers.getContractFactory('MockTimeRaidswapV3PoolDeployer')
  const MockTimeRaidswapV3PoolFactory = await ethers.getContractFactory('MockTimeRaidswapV3Pool')

  const calleeContractFactory = await ethers.getContractFactory('TestRaidswapV3Callee')
  const routerContractFactory = await ethers.getContractFactory('TestRaidswapV3Router')

  const swapTargetCallee = (await calleeContractFactory.deploy()) as TestRaidswapV3Callee
  const swapTargetRouter = (await routerContractFactory.deploy()) as TestRaidswapV3Router

  return {
    token0,
    token1,
    token2,
    factory,
    swapTargetCallee,
    swapTargetRouter,
    createPool: async (fee, tickSpacing, firstToken = token0, secondToken = token1) => {
      const mockTimePoolDeployer = (await MockTimeRaidswapV3PoolDeployerFactory.deploy()) as MockTimeRaidswapV3PoolDeployer
      const tx = await mockTimePoolDeployer.deploy(
        factory.address,
        firstToken.address,
        secondToken.address,
        fee,
        tickSpacing
      )

      const receipt = await tx.wait()
      const poolAddress = receipt.events?.[0].args?.pool as string
      return MockTimeRaidswapV3PoolFactory.attach(poolAddress) as MockTimeRaidswapV3Pool
    },
  }
}
