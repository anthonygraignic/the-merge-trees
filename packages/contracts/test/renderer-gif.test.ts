import {ethers, network, ignition} from 'hardhat';
import {TheMergeTree, TheMergeTreesRenderer} from '../typechain';
import {writeJSONAndSVG, writeToSvg} from './render-utils';
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import TheMergeTreeModule from '../ignition/modules/TheMergeTreeModule';
import {blockNumber, cooperates, decline, mintAllOpen} from './utils';
import {after} from 'mocha';

describe.skip('TreeRenderer GIF', function () {
  this.timeout(30000);
  let theMergeTree: TheMergeTree;
  let treeRenderer: TheMergeTreesRenderer;
  let deployer: HardhatEthersSigner;
  let founders: HardhatEthersSigner;
  let dao: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let snapshotId: any;

  async function deployTokenFixture() {
    const {token, renderer} = await ignition.deploy(TheMergeTreeModule, {
      parameters: {
        TheMergeTrees: {
          beforeHuntLimitPerAddress: 103,
        },
      },
    });
    theMergeTree = token;
    treeRenderer = renderer;
  }

  async function saveFiles(tokenUriResult: string) {
    writeJSONAndSVG(`gif/R_block_${(await blockNumber()).toString().padStart(4, '0')}`, tokenUriResult);
  }

  before(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
    [deployer, founders, dao, alice, bob] = await ethers.getSigners();
    await loadFixture(deployTokenFixture);
    await theMergeTree.setGrowthDivider(1);
    await theMergeTree.setGrowthDeclineBlocks(1000);
    await mintAllOpen(theMergeTree, bob);
  });

  // beforeEach(async () => {
  //   snapshotId = await ethers.provider.send('evm_snapshot', []);
  // });

  // afterEach(async () => {
  //   await ethers.provider.send('evm_revert', [snapshotId]);
  // });
  after(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });
  // take last tokenId so tree didn't grow too much
  const tokenId = 98n;

  [1, 20, 50, 100, 150, 230].forEach((blocks) => {
    it(`Should render after ${blocks} blocks`, async () => {
      await network.provider.send('hardhat_mine', [`0x${blocks.toString(16)}`]);

      if ((await theMergeTree.ownerOf(tokenId)).toLowerCase() === bob.address.toLowerCase()) {
        await cooperates(theMergeTree, bob, alice, Number(tokenId), Number(tokenId) + 1, 1);
      } else {
        await cooperates(theMergeTree, alice, bob, Number(tokenId), Number(tokenId) + 1, 1);
      }

      const tokenUriResult = await theMergeTree.tokenURI(tokenId);
      // ASSERT
      await saveFiles(tokenUriResult);
    });
  });
  it(`Should render after decline`, async () => {
    await decline(theMergeTree, bob, 10n);
    const tokenUriResult = await theMergeTree.tokenURI(tokenId);
    // ASSERT
    await saveFiles(tokenUriResult);
  });

  [200, 200, 200, 200, 190].forEach((blocks) => {
    it(`Should render decline after ${blocks} blocks`, async () => {
      await network.provider.send('hardhat_mine', [`0x${blocks.toString(16)}`]);

      if (blocks !== 190) {
        if ((await theMergeTree.ownerOf(tokenId)).toLowerCase() === bob.address.toLowerCase()) {
          await cooperates(theMergeTree, bob, alice, Number(tokenId), Number(tokenId) + 1, 1);
        } else {
          await cooperates(theMergeTree, alice, bob, Number(tokenId), Number(tokenId) + 1, 1);
        }
      }

      const tokenUriResult = await theMergeTree.tokenURI(tokenId);
      // ASSERT
      await saveFiles(tokenUriResult);
    });
  });
});
