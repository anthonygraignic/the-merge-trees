import {expect} from 'chai';
import {ethers, ignition} from 'hardhat';
import {TheMergeTree, TheMergeTreeSeeder} from '../typechain';
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import TheMergeTreeModule from '../ignition/modules/TheMergeTreeModule';

describe('TreeSeeder', function () {
  this.timeout(30000);
  let theMergeTree: TheMergeTree;
  let treeSeeder: TheMergeTreeSeeder;
  let deployer: HardhatEthersSigner;

  async function deployTokenFixture() {
    const {token, seeder} = await ignition.deploy(TheMergeTreeModule);
    theMergeTree = token;
    treeSeeder = seeder;
  }

  before(async () => {
    [deployer] = await ethers.getSigners();
    await loadFixture(deployTokenFixture);
  });

  [1, 2].forEach((id) => {
    it(`Should seed a Tree ${id}`, async () => {
      // ARRANGE & ACT
      const tree = await treeSeeder.generateTree(id, 2);
      // ASSERT
      expect(tree.initLength).to.greaterThanOrEqual(10).and.lessThanOrEqual(40);
      expect(tree.diameter).to.greaterThanOrEqual(5).and.lessThanOrEqual(40);
      expect(tree.segments).to.equal(1);
      expect(tree.branches).to.greaterThanOrEqual(2).and.lessThanOrEqual(4);
      expect(tree.animated).to.equal(false);
      expect(tree.angle).to.greaterThanOrEqual(20).and.lessThanOrEqual(90);
      expect(tree.d).to.greaterThanOrEqual(1).and.lessThanOrEqual(11);
      expect(tree.delta).to.greaterThanOrEqual(0).and.lessThanOrEqual(3);
      expect(tree.stags).to.equal(0);
      expect(tree.hares).to.equal(0);
      expect(tree.mintedSince).to.equal(129);
    });
  });

  it(`Should clone a tree`, async () => {
    // ARRANGE
    const tree = await treeSeeder.generateTree(3, 2);

    // ACT
    const clonedTree = await treeSeeder.cloneTree(8, {
      initLength: tree.initLength,
      diameter: tree.diameter,
      segments: tree.segments,
      branches: tree.branches,
      animated: tree.animated,
      angle: tree.angle,
      d: tree.d,
      delta: tree.delta,
      stags: tree.stags,
      hares: tree.hares,
      mintedSince: tree.mintedSince,
    });

    // ASSERT
    expect(clonedTree.segments).to.equal(1);
    expect(clonedTree.branches).to.equal(2);
    expect(clonedTree.animated).to.equal(false);
    expect(clonedTree.angle).to.equal(30);
    expect(clonedTree.mintedSince).to.equal(123);

    expect(clonedTree.initLength).to.equal(tree.initLength);
    expect(clonedTree.diameter).to.equal(tree.diameter);
    expect(clonedTree.d).to.equal(tree.d);
    expect(clonedTree.delta).to.equal(tree.delta);
    expect(clonedTree.stags).to.equal(tree.stags);
    expect(clonedTree.hares).to.equal(tree.hares);
  });
});
