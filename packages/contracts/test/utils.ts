import {ethers, network} from 'hardhat';
import {TheMergeTree} from '../typechain';
import {AbiCoder, ContractTransaction, ContractTransactionReceipt, ContractTransactionResponse} from 'ethers';
import {Block} from '@ethersproject/providers';
import {HardhatEthersSigner} from '@nomicfoundation/hardhat-ethers/signers';

export type TestSigners = {
  deployer: HardhatEthersSigner;
  account0: HardhatEthersSigner;
  account1: HardhatEthersSigner;
  account2: HardhatEthersSigner;
};

export const getSigners = async (): Promise<TestSigners> => {
  const [deployer, account0, account1, account2] = await ethers.getSigners();
  return {
    deployer,
    account0,
    account1,
    account2,
  };
};

export const mintOne = async (token: TheMergeTree, minter: HardhatEthersSigner): Promise<bigint> => {
  let tokenId;

  const transaction: ContractTransactionResponse = await token
    .connect(minter)
    .mint({value: await token.OPEN_MINT_PRICE()});
  const receipt: ContractTransactionReceipt = await transaction.wait();

  const events = await token.queryFilter(token.filters.Transfer);
  if (events) {
    const event = events[events.length - 1];
    // const event = tx.events[2];
    if (event && event.args) {
      tokenId = event?.args.tokenId;
    }
  }
  return tokenId;
};

/**
 * Start the stag hunt by minting all available tokens.
 */
export const mintAllOpen = async (token: TheMergeTree, minter: HardhatEthersSigner): Promise<ContractTransaction[]> => {
  const txPromises = [];
  const value = await token.OPEN_MINT_PRICE();
  for (let i = 0; i < (await token.BEFORE_HUNT_SUPPLY()) - BigInt(3); i++) {
    txPromises.push(token.connect(minter).mint({value}));
  }
  return Promise.all(txPromises);
};

export const cooperates = async (
  token: TheMergeTree,
  addr0: HardhatEthersSigner,
  addr1: HardhatEthersSigner,
  minTokenId: number = 3,
  maxTokenId: number = 60,
  transfers: number = 5
): Promise<BigInt[]> => {
  // Perform transfer for maturation
  const matureTokenIds = [];
  for (let i = minTokenId; i < maxTokenId; i++) {
    for (let j = 0; j < transfers; j++) {
      if (j % 2 === 0) {
        await token.connect(addr0).transferFrom(addr0.address, addr1.address, i);
      } else {
        await token.connect(addr1).transferFrom(addr1.address, addr0.address, i);
      }
    }
    matureTokenIds.push(BigInt(i));
  }
  return matureTokenIds;
};

export const declineAndWait = async (
  token: TheMergeTree,
  minter: HardhatEthersSigner,
  tokenId: bigint
): Promise<bigint> => {
  await decline(token, minter, tokenId);
  return waitForDeclineEnd(token);
};

export const decline = async (token: TheMergeTree, minter: HardhatEthersSigner, tokenId: bigint): Promise<bigint> => {
  await token.connect(minter).huntHare(tokenId, {value: ethers.parseEther('0.05')});

  return token.declineUntil();
};

export const waitForDeclineEnd = async (token: TheMergeTree): Promise<bigint> => {
  const declineUntil = await token.declineUntil();
  let block = await blockNumber();
  while (block < declineUntil) {
    await mineBlock();
    block = await blockNumber();
  }
  await mineBlock();
  return block;
};

// The following adapted from `https://github.com/compound-finance/compound-protocol/blob/master/tests/Utils/Ethereum.js`

const rpc = <T = unknown>({method, params}: {method: string; params?: unknown[]}): Promise<T> => {
  return network.provider.send(method, params);
};

export const encodeParameters = (types: string[], values: unknown[]): string => {
  const abi = new AbiCoder();
  return abi.encode(types, values);
};

export const blockByNumber = async (n: number | string): Promise<Block> => {
  return rpc({method: 'eth_getBlockByNumber', params: [n, false]});
};

export const increaseTime = async (seconds: number): Promise<unknown> => {
  await rpc({method: 'evm_increaseTime', params: [seconds]});
  return rpc({method: 'evm_mine'});
};

export const freezeTime = async (seconds: number): Promise<unknown> => {
  await rpc({method: 'evm_increaseTime', params: [-1 * seconds]});
  return rpc({method: 'evm_mine'});
};

export const advanceBlocks = async (blocks: number): Promise<void> => {
  for (let i = 0; i < blocks; i++) {
    await mineBlock();
  }
};

export const blockNumber = async (parse = true): Promise<bigint> => {
  const result = await rpc<string>({method: 'eth_blockNumber'});
  return BigInt(result);
};

export const blockTimestamp = async (n: number | string, parse = true): Promise<number | string> => {
  const block = await blockByNumber(n);
  return parse ? parseInt(block.timestamp.toString()) : block.timestamp;
};

export const setNextBlockTimestamp = async (n: number, mine = true): Promise<void> => {
  await rpc({method: 'evm_setNextBlockTimestamp', params: [n]});
  if (mine) await mineBlock();
};

export const minerStop = async (): Promise<void> => {
  await network.provider.send('evm_setAutomine', [false]);
  await network.provider.send('evm_setIntervalMining', [0]);
};

export const minerStart = async (): Promise<void> => {
  await network.provider.send('evm_setAutomine', [true]);
};

export const mineBlock = async (): Promise<void> => {
  await network.provider.send('evm_mine');
};

export const chainId = async (): Promise<number> => {
  return parseInt(await network.provider.send('eth_chainId'), 16);
};

export const address = (n: number): string => {
  return `0x${n.toString(16).padStart(40, '0')}`;
};

export function getBit(colors: bigint, id: bigint): boolean {
  return (colors & (1n << (id / 12n))) !== 0n;
}
