import {ethers, ignition} from 'hardhat';
import {TheMergeTree} from '../typechain';
import {expect} from 'chai';
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import TheMergeTreeModule from '../ignition/modules/TheMergeTreeModule';
import {HardhatEthersSigner} from '@nomicfoundation/hardhat-ethers/signers';

describe('End to End test with deployment', async () => {
  let deployer: HardhatEthersSigner;
  let founders: HardhatEthersSigner;
  let theMergeTreesDAO: HardhatEthersSigner;
  let token: TheMergeTree;

  async function deployTokenFixture() {
    const {token} = await ignition.deploy(TheMergeTreeModule);
    return token;
  }

  before(async () => {
    [deployer, founders, theMergeTreesDAO] = await ethers.getSigners();

    // 1. DEPLOY token
    token = await loadFixture(deployTokenFixture);

    // (later) SET transfer ownership and founders to DAO
    await token.transferOwnership(theMergeTreesDAO.address);
    await token.connect(founders).setFounders(founders.address);
  });

  it('sets all starting params correctly', async () => {
    expect(await token.owner()).to.equal(theMergeTreesDAO.address);
    expect(await token.founders()).to.equal(founders.address);

    // Artist proofs
    expect(await token.totalSupply()).to.equal(BigInt('3'));
    expect(await token.ownerOf(0)).to.equal(founders.address);
    expect(await token.ownerOf(1)).to.equal(founders.address);
    expect(await token.ownerOf(2)).to.equal(founders.address);
  });
});
