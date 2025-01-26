import {ethers, network, ignition} from 'hardhat';
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import {TheMergeTree} from '../typechain';
import {writeJSONAndSVG} from './render-utils';
import {cooperates, mintOne} from './utils';
import TheMergeTreeModule from '../ignition/modules/TheMergeTreeModule';

describe('QA', function () {
  this.timeout(300000);
  let token: TheMergeTree;
  let deployer: HardhatEthersSigner;
  let founders: HardhatEthersSigner;
  let minter: HardhatEthersSigner;
  let snapshotId: any;

  async function deployTokenFixture() {
    const {token} = await ignition.deploy(TheMergeTreeModule, {
      parameters: {
        TheMergeTrees: {
          beforeHuntLimitPerAddress: 103,
        },
      },
    });
    return token;
  }

  before(async () => {
    [deployer, founders, minter] = await ethers.getSigners();
    token = await loadFixture(deployTokenFixture);

    await token.setGrowthDivider(1);
    await token.setGrowthDeclineBlocks(1000);
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  [40].forEach((quantity) => {
    // RUN `pnpm check:svg` to check for errors
    it(`QA: minting ${quantity}`, async () => {
      for (let i = 0; i < quantity; i++) {
        const tokenId = await mintOne(token, minter);

        await cooperates(token, minter, founders, Number(tokenId), Number(tokenId) + 1, Number(tokenId) % 6);

        await network.provider.send('hardhat_mine', ['0x100']); // mine 256 blocks
        await network.provider.send('evm_mine');
        const tokenUri = await token.tokenURI(tokenId);
        writeJSONAndSVG(`qa/${tokenId}`, tokenUri);
      }

      const supplyLeft = (await token.BEFORE_HUNT_SUPPLY()) - (await token.totalSupply());
      for (let i = 0; i < supplyLeft; i++) {
        const tokenId = await mintOne(token, minter);

        const tokenUri = await token.tokenURI(tokenId);
        writeJSONAndSVG(`qa/${tokenId}`, tokenUri);
      }

      const hareTokenId = 63;
      await token.connect(minter).huntHare(hareTokenId, {value: ethers.parseEther('0.05')});
      const tokenUri = await token.tokenURI(hareTokenId);
      writeJSONAndSVG(`qa/${hareTokenId}`, tokenUri);

      // mine 1001 blocks to exit decline
      // await network.provider.send('hardhat_mine', ['0x3e9']);
    });
  });
});
