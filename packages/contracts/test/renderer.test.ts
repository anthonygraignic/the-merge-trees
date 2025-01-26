import {expect} from 'chai';
import {ethers, network, ignition} from 'hardhat';
import {TheMergeTree, TheMergeTreesRenderer} from '../typechain';
import {writeJSONAndSVG, writeToSvg} from './render-utils';
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import TheMergeTreeModule from '../ignition/modules/TheMergeTreeModule';
import {cooperates, decline, mintAllOpen} from './utils';

describe('TreeRenderer', function () {
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

  before(async () => {
    [deployer, founders, dao, alice, bob] = await ethers.getSigners();
    await loadFixture(deployTokenFixture);
    await theMergeTree.setGrowthDivider(2);
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  describe('grow', function () {
    before(async () => {
      await cooperates(theMergeTree, founders, bob, 2, 2 + 1, 5);
      // await (await theMergeTree.connect(dao).setGrow(true)).wait();
    });

    [1, 20, 80, 150, 250, 300].forEach((blocks) => {
      it(`Should render after ${blocks} blocks`, async () => {
        for (let i = 0; i < blocks; i++) {
          await network.provider.send('evm_mine');
        }

        const tokenUriResult = await theMergeTree.tokenURI(2);
        // ASSERT
        writeJSONAndSVG(`R2_block${blocks}`, tokenUriResult);
      });
    });

    it(`Should render after transfers`, async () => {
      await network.provider.send('hardhat_mine', ['0x400']); // mine 1024
      for (let i = 0; i < 5; i++) {
        if (i % 2 === 0) {
          await theMergeTree.connect(founders).transferFrom(founders.address, alice.address, 1);
        } else {
          await theMergeTree.connect(alice).transferFrom(alice.address, founders.address, 1);
        }
        const tokenUriResult = await theMergeTree.tokenURI(1);
        writeJSONAndSVG(`g_transfer_${i}`, tokenUriResult);
      }
    });
  });

  describe('decline', function () {
    before(async () => {
      // Move to stag hunt phase & decline
      await mintAllOpen(theMergeTree, bob);
      await cooperates(theMergeTree, bob, alice, 3, 5, 4);

      await decline(theMergeTree, bob, 10n);
    });
    [1, 10, 200, 500, 800, 1300].forEach((blocks) => {
      it(`Should render after ${blocks} blocks`, async () => {
        for (let i = 0; i < blocks; i++) {
          await network.provider.send('evm_mine');
        }

        const tokenUriResult3 = await theMergeTree.tokenURI(3);
        // ASSERT
        writeJSONAndSVG(`R3_block${blocks}`, tokenUriResult3);

        const tokenUriResult4 = await theMergeTree.tokenURI(4);
        // ASSERT
        writeJSONAndSVG(`R4_block${blocks}`, tokenUriResult4);
      });
    });
    it(`Should render after transfers`, async () => {
      await theMergeTree.setGrowthDivider(1);
      const tokenId = 4;
      for (let i = 0; i < 5; i++) {
        if (i % 2 === 0) {
          await theMergeTree.connect(bob).transferFrom(bob.address, alice.address, tokenId);
        } else {
          await theMergeTree.connect(alice).transferFrom(alice.address, bob.address, tokenId);
        }
        const tokenUriResult = await theMergeTree.tokenURI(tokenId);
        writeJSONAndSVG(`d_transfer_${i}`, tokenUriResult);
      }
    });
  });
});
