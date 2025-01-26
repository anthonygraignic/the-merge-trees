import {expect} from 'chai';
import {ethers, network, ignition} from 'hardhat';
import {
  ComposableTestToken,
  ComposableTestToken__factory as ComposableTestTokenFactory,
  TheMergeTree,
} from '../typechain';
import {writeJSON, writeJSONAndSVG, writeToSvg, writeToSvgRaw} from './render-utils';
import {
  blockNumber,
  cooperates,
  decline,
  declineAndWait,
  getBit,
  mintAllOpen,
  mintOne,
  waitForDeclineEnd,
} from './utils';
import {parseEther, Signer, Typed, ZeroAddress, zeroPadBytes} from 'ethers';
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import TheMergeTreeModule from '../ignition/modules/TheMergeTreeModule';
import ComposableModule from '../ignition/modules/ComposableModule';
import {HardhatEthersSigner} from '@nomicfoundation/hardhat-ethers/signers';

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
async function deployComposableTokenFixture() {
  const {token} = await ignition.deploy(ComposableModule);
  return token;
}
async function deployTokenFixtureDefaultperAddress() {
  const {token} = await ignition.deploy(TheMergeTreeModule);

  return token;
}
describe('Deployment', function () {
  let theMergeTree: TheMergeTree;
  let deployer: HardhatEthersSigner;
  let founders: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;

  before(async () => {
    [deployer, founders, alice, bob] = await ethers.getSigners();
    console.log(`Deployer: ${await deployer.getAddress()}`);
    console.log(`Founders: ${await founders.getAddress()}`);
    console.log(`Alice: ${await alice.getAddress()}`);
    console.log(`Bob: ${await bob.getAddress()}`);
  });

  it('should set name', async () => {
    theMergeTree = await loadFixture(deployTokenFixture);
    expect(await theMergeTree.name()).to.eq('TheMergeTree');
  });
  it('should set symbol', async () => {
    theMergeTree = await loadFixture(deployTokenFixture);
    expect(await theMergeTree.symbol()).to.eq('MTREE');
  });

  it('Should set the right owner', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await theMergeTree.transferOwnership(await founders.getAddress());
    expect(await theMergeTree.owner()).to.equal(await founders.getAddress());
  });

  it('Should get Royalty Info', async () => {
    theMergeTree = await loadFixture(deployTokenFixture);
    const result = await theMergeTree.connect(alice).royaltyInfo(1, 10000);

    expect(result[0]).to.equal(await deployer.getAddress());
    expect(result[1]).to.equal(0);
  });

  it('Should support Royalty interface', async () => {
    theMergeTree = await loadFixture(deployTokenFixture);
    const result = await theMergeTree.connect(alice).supportsInterface('0x2a55205a');

    expect(result).to.equal(true);
  });

  it('Should support Metadata Update interface', async () => {
    theMergeTree = await loadFixture(deployTokenFixture);
    const result = await theMergeTree.connect(alice).supportsInterface('0x49064906');

    expect(result).to.equal(true);
  });

  describe('Owner actions', async () => {
    it('Should set seeder', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      const tx = theMergeTree.connect(deployer).setSeeder(await bob.getAddress());

      await expect(tx)
        .to.emit(theMergeTree, 'SeederUpdated')
        .withArgs(await bob.getAddress());
      expect(await theMergeTree.seeder()).to.eql(await bob.getAddress());
    });

    it('Should not set seeder: not the owner', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      // : VM Exception while processing transaction: reverted with custom error 'OwnableUnauthorizedAccount("0x0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")'
      await expect(theMergeTree.connect(alice).setSeeder(await bob.getAddress()))
        .to.be.revertedWithCustomError(theMergeTree, 'OwnableUnauthorizedAccount')
        .withArgs((await alice.getAddress()).toString());
      // .withArgs('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
    });

    it('Should not set seeder: locked', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      await (await theMergeTree.connect(deployer).lockSeeder()).wait();
      await expect(theMergeTree.connect(deployer).setSeeder(await bob.getAddress())).to.be.revertedWithCustomError(
        theMergeTree,
        'SeederAlreadyLocked()'
      );
    });

    it('Should lock seeder', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      const tx = theMergeTree.connect(deployer).lockSeeder();

      await expect(tx).to.emit(theMergeTree, 'SeederLocked');
    });
    it('Should not lock seeder: not the owner', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      await expect(theMergeTree.connect(alice).lockSeeder())
        .to.be.revertedWithCustomError(theMergeTree, 'OwnableUnauthorizedAccount')
        .withArgs((await alice.getAddress()).toString());
    });

    it('Should not lock seeder: already locked', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      await theMergeTree.connect(deployer).lockSeeder();

      await expect(theMergeTree.connect(deployer).lockSeeder()).to.be.revertedWithCustomError(
        theMergeTree,
        'SeederAlreadyLocked()'
      );
    });

    it('Should get Contract URI', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      expect(await theMergeTree.contractURI()).to.equal(
        'ipfs://bafkreie6rjitehhq73ycddh7q4bojntobi3xev4eloi4rqfnlhwuyj3tqe'
      );
    });

    it('Should set Contract URI hash', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      await theMergeTree.connect(deployer).setContractURIHash('ABCD');

      expect(await theMergeTree.contractURI()).to.equal('ipfs://ABCD');
    });

    it('Should not set Contract URI hash: not owner', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      await expect(theMergeTree.connect(alice).setContractURIHash('ABCD'))
        .to.be.revertedWithCustomError(theMergeTree, 'OwnableUnauthorizedAccount')
        .withArgs((await alice.getAddress()).toString());
    });

    describe('ComposableMarker admin', async () => {
      let composableToken: ComposableTestToken;

      it('Should setComposableMarkerApproval', async () => {
        theMergeTree = await loadFixture(deployTokenFixture);
        await theMergeTree.transferOwnership(await founders.getAddress());
        composableToken = await loadFixture(deployComposableTokenFixture);
        await composableToken.safeMint(await founders.getAddress(), 0);
        await composableToken.safeMint(await founders.getAddress(), 1);
        await composableToken.safeMint(await founders.getAddress(), 2);
        const composableTokenAddr = await composableToken.getAddress();
        const tx = theMergeTree.connect(founders).setComposableMarkerApproval(composableTokenAddr, true);

        await expect(tx).to.emit(theMergeTree, 'ComposableMarkerApproval').withArgs(composableTokenAddr, true);

        expect(await theMergeTree.approvedComposableTokenForMarker(composableTokenAddr)).to.eql(true);
      });

      it('Should not setComposableMarkerApproval: founders not thanked', async () => {
        theMergeTree = await loadFixture(deployTokenFixture);
        await theMergeTree.transferOwnership(await founders.getAddress());
        composableToken = await loadFixture(deployComposableTokenFixture);
        await expect(
          theMergeTree.connect(founders).setComposableMarkerApproval(await composableToken.getAddress(), true)
        ).to.be.revertedWithCustomError(theMergeTree, 'FoundersNotThanked');
      });

      it('Should not setComposableMarkerApproval: founders not thanked enough', async () => {
        theMergeTree = await loadFixture(deployTokenFixture);
        await theMergeTree.transferOwnership(await founders.getAddress());
        composableToken = await loadFixture(deployComposableTokenFixture);
        await composableToken.safeMint(await founders.getAddress(), 0);
        await composableToken.safeMint(await founders.getAddress(), 1);
        await expect(
          theMergeTree.connect(founders).setComposableMarkerApproval(await composableToken.getAddress(), true)
        ).to.be.revertedWithCustomError(theMergeTree, 'FoundersNotThanked()');
      });

      it('Should not setComposableMarkerApproval: not owner', async () => {
        theMergeTree = await loadFixture(deployTokenFixture);
        await expect(
          theMergeTree.connect(alice).setComposableMarkerApproval('0x0165878A594ca255338adfa4d48449f69242Eb8F', true)
        )
          .to.be.revertedWithCustomError(theMergeTree, 'OwnableUnauthorizedAccount')
          .withArgs((await alice.getAddress()).toString());
      });
    });

    it('Should setGrowthDivider', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      const tx = theMergeTree.setGrowthDivider(20);

      await expect(tx).to.emit(theMergeTree, 'GrowthDividerUpdated').withArgs(20);
      expect(await theMergeTree.growthDivider()).to.equal(20);
    });
    it('Should not setGrowthDivider: not owner', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      await expect(theMergeTree.connect(alice).setGrowthDivider(42))
        .to.be.revertedWithCustomError(theMergeTree, 'OwnableUnauthorizedAccount')
        .withArgs((await alice.getAddress()).toString());
    });

    it('Should setGrowthDeclineBlocks', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      const tx = theMergeTree.setGrowthDeclineBlocks(20);

      await expect(tx).to.emit(theMergeTree, 'GrowthDeclineBlocksUpdated').withArgs(20);
      expect(await theMergeTree.growthDeclineBlocks()).to.equal(20);
    });
    it('Should not setGrowthDeclineBlocks: not owner', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      await expect(theMergeTree.connect(alice).setGrowthDeclineBlocks(42))
        .to.be.revertedWithCustomError(theMergeTree, 'OwnableUnauthorizedAccount')
        .withArgs((await alice.getAddress()).toString());
    });
    it('Should reset colors', async function () {
      // ARRANGE
      theMergeTree = await loadFixture(deployTokenFixture);
      let tokenId;
      // fist color picker is founders, next one is 1
      for (let i = 2; i < 24; i++) {
        tokenId = await mintOne(theMergeTree, alice);
      }
      const initialColors = await theMergeTree.colors();
      // ACT
      await theMergeTree.connect(alice).toggleColor(tokenId);
      expect(await theMergeTree.colors()).to.not.equal(initialColors);
      await theMergeTree.resetColors();
      // ASSERT 2
      const resettedColors = await theMergeTree.colors();
      expect(resettedColors).to.equal(initialColors);
    });
    it('Should not reset colors: not owner', async function () {
      // ARRANGE
      theMergeTree = await loadFixture(deployTokenFixture);
      // ACT & ASSERT
      await expect(theMergeTree.connect(alice).resetColors())
        .to.be.revertedWithCustomError(theMergeTree, 'OwnableUnauthorizedAccount')
        .withArgs((await alice.getAddress()).toString());
    });
  });

  describe('Founders actions', async () => {
    it('Should setFounders', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      const tx = theMergeTree.connect(founders).setFounders(await bob.getAddress());

      await expect(tx)
        .to.emit(theMergeTree, 'FoundersUpdated')
        .withArgs(await bob.getAddress());
      expect(await theMergeTree.founders()).to.equal(await bob.getAddress());
    });
    it('Should not setFounders: not founders', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      await expect(theMergeTree.connect(alice).setFounders(await alice.getAddress())).to.be.revertedWithCustomError(
        theMergeTree,
        'NotFounders'
      );
    });

    it('Should withdraw', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      const foundersAddress = await founders.getAddress();
      const initBalance = await ethers.provider.getBalance(foundersAddress);
      await mintOne(theMergeTree, alice);
      const tx = await theMergeTree.connect(deployer).withdraw();
      // const receipt = await tx.wait();
      // const gasUsed = receipt.cumulativeGasUsed * receipt.gasPrice; // transaction gas fee

      const finalBalance = await ethers.provider.getBalance(foundersAddress);
      expect(finalBalance - initBalance).to.equal(parseEther('.07233'));
    });
    it('Should withdraw founders', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      const foundersAddress = await founders.getAddress();

      const initBalance = await ethers.provider.getBalance(foundersAddress);
      await mintOne(theMergeTree, alice);
      const tx = await theMergeTree.connect(founders).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.cumulativeGasUsed * receipt.gasPrice; // transaction gas fee

      const finalBalance = await ethers.provider.getBalance(foundersAddress);
      expect(finalBalance - initBalance + gasUsed).to.equal(parseEther('.07233'));
    });

    it('Should not withdraw, not owner or founders', async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      const foundersAddress = await founders.getAddress();
      await theMergeTree.transferOwnership(await deployer.getAddress());

      await expect(theMergeTree.connect(alice).withdraw()).to.be.revertedWithCustomError(theMergeTree, 'NotFounders');

      await expect(theMergeTree.connect(alice).withdraw()).to.be.revertedWithCustomError(theMergeTree, 'NotFounders');
    });
  });
});

describe('TheMergeTree', function () {
  this.timeout(30000);
  let theMergeTree: TheMergeTree;
  let deployer: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  // let dao: HardhatEthersSigner;
  let minter: HardhatEthersSigner;
  let founders: HardhatEthersSigner;
  let addrs: HardhatEthersSigner[];
  let snapshotId: any;

  before(async () => {
    [deployer, founders, minter, alice, bob, ...addrs] = await ethers.getSigners();
  });

  it('Should mint: open mint phase', async function () {
    // ARRANGE
    theMergeTree = await loadFixture(deployTokenFixture);
    await theMergeTree.transferOwnership(await founders.getAddress());

    // ACT
    const transaction = theMergeTree.connect(minter).mint({value: await theMergeTree.OPEN_MINT_PRICE()});

    // ASSERT
    const tokenId = 3;
    await expect(transaction)
      .to.emit(theMergeTree, 'Transfer')
      .withArgs(ethers.ZeroAddress, await minter.getAddress(), tokenId);
    await expect(transaction).to.emit(theMergeTree, 'MergeTreeCreated');
    // .withArgs(tokenId, [, any, any, any, any, any, any, any, any, any, any]);
    expect(await theMergeTree.balanceOf(await minter.getAddress())).to.equal(1);

    expect(await ethers.provider.getBalance(await theMergeTree.getAddress())).to.be.eql(
      await theMergeTree.OPEN_MINT_PRICE()
    );
    const tokenRendering = await theMergeTree.renderTokenById(tokenId);
    expect(tokenRendering.startsWith('<svg')).to.be.equal(true);
    writeToSvgRaw('1_render', tokenRendering);
  });

  it('Should not mint: price too low', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await expect(theMergeTree.connect(alice).mint({value: ethers.parseEther('0.001')})).to.be.revertedWithCustomError(
      theMergeTree,
      'BelowMinPrice'
    );
  });

  it('Should not mint: limit per owner exceeded', async function () {
    theMergeTree = await loadFixture(deployTokenFixtureDefaultperAddress);

    const txPromises = [];
    for (let i = 0; i < (await theMergeTree.beforeHuntLimitPerAddress()); i++) {
      txPromises.push(theMergeTree.connect(alice).mint({value: await theMergeTree.OPEN_MINT_PRICE()}));
    }
    await Promise.all(txPromises);

    await expect(
      theMergeTree.connect(alice).mint({value: await theMergeTree.OPEN_MINT_PRICE()})
    ).to.be.revertedWithCustomError(theMergeTree, 'AboveMaxBalancePerAddress()');
  });

  it('Should not mint: supply exceeded', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    // ARRANGE
    await mintAllOpen(theMergeTree, minter);
    // ACT
    // ASSERT
    await expect(
      theMergeTree.connect(alice).mint({value: await theMergeTree.OPEN_MINT_PRICE()})
    ).to.be.revertedWithCustomError(theMergeTree, 'StagHuntStarted()');
  });
  it('Should trigger stag hunt from mint', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await expect(await theMergeTree.hasStagHuntStarted()).to.be.equal(false);
    // ARRANGE
    await mintAllOpen(theMergeTree, minter);
    // ACT
    // ASSERT
    await expect(await theMergeTree.hasStagHuntStarted()).to.be.equal(true);
    await expect(
      theMergeTree.connect(addrs[3]).mint({value: await theMergeTree.OPEN_MINT_PRICE()})
    ).to.be.revertedWithCustomError(theMergeTree, 'StagHuntStarted()');
  });

  it('Should not mint after stag hunt started', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    // ARRANGE
    await mintAllOpen(theMergeTree, minter);
    const txPromises = [];
    for (let i = 10; i < 30; i++) {
      txPromises.push(theMergeTree.connect(minter).burn(i));
    }
    await Promise.all(txPromises);

    // ACT
    // ASSERT
    await expect(
      theMergeTree.connect(alice).mint({value: await theMergeTree.OPEN_MINT_PRICE()})
    ).to.be.revertedWithCustomError(theMergeTree, 'StagHuntStarted()');
  });

  it('Should hunt stag', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);

    let matureTokenIds = await cooperates(theMergeTree, minter, alice);

    let hunterTokenId = 51;
    // const gasEstimateHuntStag = await theMergeTree.connect(minter).estimateGas.huntStag();
    // console.log(`gasEstimateHuntStag: ${gasEstimateHuntStag.toNumber()}`);
    const transaction = theMergeTree.connect(alice).huntStag(hunterTokenId);

    await expect(transaction)
      .to.emit(theMergeTree, 'StagKilled')
      .withArgs(BigInt(hunterTokenId.toString()), matureTokenIds);

    expect((await theMergeTree.totalPendingClaim()).toString()).to.be.equal('57');
    expect((await theMergeTree.pendingClaims(await alice.getAddress())).toString()).to.be.equal('57');

    for (var tokenId of matureTokenIds) {
      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(1);
      expect(tree.stags).to.equal(1);
    }
  });

  it('Should hunt stag, hare, stag', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    let matureTokenIds = await cooperates(theMergeTree, minter, alice, 3, 60);

    expect(await theMergeTree.cooperation()).to.equal(5533);
    let hunterTokenId = 51;
    const transaction = theMergeTree.connect(alice).huntStag(hunterTokenId);

    await expect(transaction)
      .to.emit(theMergeTree, 'StagKilled')
      .withArgs(BigInt(hunterTokenId.toString()), matureTokenIds);
    await expect(transaction).to.emit(theMergeTree, 'BatchMetadataUpdate').withArgs(0, 102);
    // expect((await theMergeTree.matureTreesTokenIds()).length).to.be.equal(0);
    expect((await theMergeTree.totalPendingClaim()).toString()).to.be.equal('57');
    expect((await theMergeTree.pendingClaims(await alice.getAddress())).toString()).to.be.equal('57');
    expect((await theMergeTree.pendingClaims(await minter.getAddress())).toString()).to.be.equal('0');

    for (var tokenId of matureTokenIds) {
      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(1);
      expect(tree.stags).to.equal(1);
    }
    // Claim
    await theMergeTree.connect(alice).claim(56);
    expect(await theMergeTree.totalPendingClaim()).to.equal(1);
    expect((await theMergeTree.pendingClaims(await alice.getAddress())).toString()).to.be.equal('1');
    // 103 = init supply = founders: 3 + minter: 43 + alice 57
    // 57 (owned) + 56 (claimed) = 113
    // 1 pending
    expect(await theMergeTree.balanceOf(await alice.getAddress())).to.equal(113);

    // Second hunt
    // Burn one to stress matching ids
    await theMergeTree.connect(minter).burn(61);
    let matureTokenIdsOwned = await cooperates(theMergeTree, alice, addrs[2], 3, 60, 7);
    let matureTokenIdsClaimed = await cooperates(theMergeTree, alice, addrs[3], 103, 152);

    // Hunt hare to check animation removal
    let hareTokenId = BigInt(11);
    const hareHuntTransaction = theMergeTree
      .connect(addrs[2])
      .huntHare(hareTokenId, {value: ethers.parseEther('0.08')});

    await expect(hareHuntTransaction).to.emit(theMergeTree, 'MergeTreeCloned').withArgs(hareTokenId, BigInt(159));
    expect(await theMergeTree.totalSupply()).to.be.equal(159);
    matureTokenIdsOwned = matureTokenIdsOwned.filter((item) => item !== hareTokenId);

    expect(await theMergeTree.balanceOf(await addrs[2].getAddress())).to.equal(57 + 1);
    expect(await theMergeTree.balanceOf(await addrs[3].getAddress())).to.equal(49);
    // let totalPending = await theMergeTree.totalPendingClaim();
    // let totalSupply = await theMergeTree.totalSupply();
    // console.log(`totalPending: ${totalPending}, totalSupply: ${totalSupply}`);
    // console.log(matureTokenIds2.length);
    // (58-1-1+49) *10000 / (159+1) = 6562
    expect(await theMergeTree.cooperation()).to.equal(6562);

    await theMergeTree.connect(addrs[2]).huntStag(22);

    expect(await theMergeTree.pendingClaims(await alice.getAddress())).to.be.equal(1);
    expect(await theMergeTree.pendingClaims(await addrs[2].getAddress())).to.be.equal(56);
    expect(await theMergeTree.pendingClaims(await addrs[3].getAddress())).to.be.equal(49);
    expect(await theMergeTree.totalPendingClaim()).to.be.equal(106);

    for (const tokenId of matureTokenIdsClaimed) {
      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(1);
      expect(tree.stags).to.equal(1);
      expect(tree.hares).to.equal(0);
    }
    for (const tokenId of matureTokenIdsOwned) {
      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(1);
      expect(tree.stags).to.equal(2);
      expect(tree.hares).to.equal(0);
    }
    // hareTokenId
    let hareTree = await theMergeTree.trees(hareTokenId);
    expect(hareTree.hares).to.be.equal(1);
    expect(hareTree.animated).to.be.equal(false);
    expect(await theMergeTree.tokenIdsDeclineUntil(hareTokenId)).to.be.equal(0);
  });

  [2].forEach((hunts) => {
    it(`Should hunt stag ${hunts} times in a row`, async () => {
      theMergeTree = await loadFixture(deployTokenFixture);
      await mintAllOpen(theMergeTree, minter);

      const FIRST_TOKEN_ID = 3n;

      for (let i = 0; i < hunts; i++) {
        // console.log(`--- Hunt ${i} ---`);

        const supply = await theMergeTree.totalSupply();
        // const supplyThreshold = 10n + (supply * (await theMergeTree.COOPERATION_THRESHOLD())) / 10000n;
        const supplyThreshold = supply - FIRST_TOKEN_ID;
        // console.log(`supplyThreshold: ${supplyThreshold} - supply: ${supply}`);
        //
        const matureTokenIds = await cooperates(
          theMergeTree,
          i === 0 ? minter : alice,
          alice,
          Number(FIRST_TOKEN_ID),
          Number(supply)
        );
        const previousAliceBalance = await theMergeTree.balanceOf(await alice.getAddress());
        const hunterTokenId = 51;
        // const gasEstimateHuntStag = await theMergeTree.connect(minter).estimateGas.huntStag();
        // console.log(`gasEstimateHuntStag: ${gasEstimateHuntStag.toNumber()}`);
        const transaction = theMergeTree.connect(alice).huntStag(hunterTokenId);

        await expect(transaction)
          .to.emit(theMergeTree, 'StagKilled')
          .withArgs(BigInt(hunterTokenId.toString()), matureTokenIds);
        // expect((await theMergeTree.matureTreesTokenIds()).length).to.be.equal(0);
        expect(await theMergeTree.totalPendingClaim()).to.be.equal(supplyThreshold + BigInt(i));
        expect(await theMergeTree.pendingClaims(await alice.getAddress())).to.be.equal(supplyThreshold + BigInt(i));
        expect(await theMergeTree.pendingClaims(await minter.getAddress())).to.be.equal(0n);

        for (const tokenId of matureTokenIds) {
          const tree = await theMergeTree.trees(tokenId);
          expect(tree.segments).to.equal(1n);
          // Should check all stags number (1,2,3...) from beginning and created trees at each round
          expect(tree.stags).to.greaterThanOrEqual(1n);
        }
        // Claim
        // console.log(`claim ${supplyThreshold}`);
        // Ran out of gas claiming > 100
        const mod = supplyThreshold % 2n;
        await theMergeTree.connect(alice).claim(supplyThreshold / 2n);
        if (mod === 0n) {
          await theMergeTree.connect(alice).claim(supplyThreshold / 2n - 1n);
        } else {
          await theMergeTree.connect(alice).claim(supplyThreshold / 2n);
        }

        expect(await theMergeTree.totalPendingClaim()).to.equal(i + 1);
        expect(await theMergeTree.pendingClaims(await alice.getAddress())).to.be.equal(i + 1);
        expect(await theMergeTree.balanceOf(await alice.getAddress())).to.equal(
          previousAliceBalance + supplyThreshold - 1n
        );
      }
    });
  });

  it('Should not hunt stag: not a mature tree', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);

    // Perform transfer for maturation
    const matureTokenIds = [];
    for (let i = 3; i < 60; i++) {
      for (let j = 0; j < 5; j++) {
        if (j % 2 === 0) {
          await theMergeTree.connect(minter).transferFrom(await minter.getAddress(), await alice.getAddress(), i);
        } else {
          await theMergeTree.connect(alice).transferFrom(await alice.getAddress(), await minter.getAddress(), i);
        }
      }
      matureTokenIds.push(BigInt(i));
    }

    let hunterTokenId = 70;
    // const gasEstimateHuntStag = await theMergeTree.connect(minter).estimateGas.huntStag();
    // console.log(`gasEstimateHuntStag: ${gasEstimateHuntStag.toNumber()}`);
    await expect(theMergeTree.connect(minter).huntStag(hunterTokenId)).to.be.revertedWithCustomError(
      theMergeTree,
      'NotMatureTree()'
    );
  });

  it('Should not hunt stag: not enough collaboration', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);

    // Perform transfer for maturation
    for (let i = 3; i < 10; i++) {
      for (let j = 0; j < 5; j++) {
        if (j % 2 === 0) {
          await theMergeTree.connect(minter).transferFrom(await minter.getAddress(), await alice.getAddress(), i);
        } else {
          await theMergeTree.connect(alice).transferFrom(await alice.getAddress(), await minter.getAddress(), i);
        }
      }
    }

    // const gasEstimateHuntStag = await theMergeTree.connect(minter).estimateGas.huntStag();
    // console.log(`gasEstimateHuntStag: ${gasEstimateHuntStag.toNumber()}`);
    expect(await theMergeTree.cooperation()).to.equal(679);
    await expect(theMergeTree.connect(alice).huntStag(6))
      .to.be.revertedWithCustomError(theMergeTree, 'NotEnoughCooperation')
      .withArgs(679);
  });

  it('Should not hunt stag: not enough collaboration (pending)', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);

    await cooperates(theMergeTree, minter, alice);
    await theMergeTree.connect(alice).huntStag(22);

    expect(await theMergeTree.totalPendingClaim()).to.equal(57);

    await cooperates(theMergeTree, alice, bob);

    await expect(theMergeTree.connect(bob).huntStag(11))
      .to.be.revertedWithCustomError(theMergeTree, 'NotEnoughCooperation')
      .withArgs(3562);
  });

  it('Should not hunt stag: not enough collaboration after hare hunted', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);

    await cooperates(theMergeTree, minter, alice, 3, 52);
    const hareTokenId = 22;
    await theMergeTree.connect(alice).huntHare(hareTokenId, {value: ethers.parseEther('0.05')});

    await expect(theMergeTree.connect(alice).huntStag(11))
      .to.be.revertedWithCustomError(theMergeTree, 'NotEnoughCooperation')
      .withArgs(4615);
    expect(await theMergeTree.tokenIdsDeclineUntil(hareTokenId)).to.be.greaterThan(0n);
    expect((await theMergeTree.trees(hareTokenId)).animated).to.be.equal(true);
  });

  it('Should not hunt stag: not nft owner', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    await expect(theMergeTree.connect(addrs[2]).huntStag(10)).to.be.revertedWithCustomError(
      theMergeTree,
      'NotNFTOwner'
    );
  });

  it('Should not hunt stag: not found', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    await expect(theMergeTree.connect(minter).huntStag(3000)).to.be.revertedWithCustomError(
      theMergeTree,
      'ERC721NonexistentToken'
    );
  });

  it('Should not hunt stag: not started', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await expect(theMergeTree.connect(alice).huntStag(0)).to.be.revertedWithCustomError(
      theMergeTree,
      'StagHuntNotStarted()'
    );
  });

  it('Should hunt hare', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    const tokenId = 50;

    await cooperates(theMergeTree, minter, alice, tokenId, tokenId + 1, 2);
    const treeBeforeHare = await theMergeTree.trees(tokenId);
    expect(treeBeforeHare.segments).to.equal(4);

    const tx = theMergeTree.connect(minter).huntHare(tokenId, {value: ethers.parseEther('0.05')});
    const clonedTokenId = 103;
    await expect(tx).to.emit(theMergeTree, 'HareKilled').withArgs(tokenId);
    await expect(tx).to.emit(theMergeTree, 'MergeTreeCloned').withArgs(tokenId, clonedTokenId);
    await expect(tx).to.emit(theMergeTree, 'BatchMetadataUpdate').withArgs(0, clonedTokenId);

    const tree = await theMergeTree.trees(tokenId);
    expect(tree.segments).to.equal(4);
    expect(tree.hares).to.equal(1);
    expect(tree.animated).to.equal(true);

    const clonedTree = await theMergeTree.trees(clonedTokenId);
    expect(clonedTree.initLength).to.equal(tree.initLength);
    expect(clonedTree.diameter).to.equal(tree.diameter);
    expect(clonedTree.segments).to.not.equal(tree.segments);
    expect(clonedTree.segments).to.equal(0);
    expect(clonedTree.branches).to.equal(2);
    expect(clonedTree.animated).to.equal(false);
    expect(clonedTree.angle).to.equal(30);
    expect(clonedTree.d).to.equal(tree.d);
    expect(clonedTree.delta).to.equal(tree.delta);
    expect(clonedTree.stags).to.equal(tree.stags);
    expect(clonedTree.hares).to.equal(tree.hares);
    expect(clonedTree.mintedSince).to.greaterThan(tree.mintedSince);
    const blockNum = await blockNumber();
    expect(clonedTree.mintedSince).to.equal(blockNum - (await theMergeTree.initBlockNumber()));

    const declineUntil = 211810n + blockNum;
    expect(await theMergeTree.declineUntil()).to.be.equal(declineUntil);
    expect(await theMergeTree.tokenIdsDeclineUntil(tokenId)).to.be.equal(declineUntil);
    expect(await theMergeTree.tokenIdsDeclineUntil(clonedTokenId)).to.be.equal(declineUntil);
  });

  it('Should hunt hare adding declineBlocks', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    const tokenId = 50;

    const declineUntil1 = 211810n + (await blockNumber()) + 1n;
    await theMergeTree.connect(minter).huntHare(tokenId, {value: ethers.parseEther('0.05')});
    expect(await theMergeTree.declineUntil()).to.be.equal(declineUntil1);
    await theMergeTree.connect(minter).huntHare(tokenId, {value: ethers.parseEther('0.11')});
    const declineUntil2 = declineUntil1 + 211810n;
    expect(await theMergeTree.declineUntil()).to.be.equal(declineUntil2);
  });

  it('Should not hunt hare: price too low', async function () {
    // ARRANGE
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    // ACT & ASSERT
    await expect(theMergeTree.connect(minter).huntHare(50)).to.be.reverted;
    await expect(theMergeTree.connect(minter).huntHare(50, {value: ethers.parseEther('0.009')})).to.be.reverted;
    await theMergeTree.connect(minter).huntHare(50, {value: ethers.parseEther('0.05')});
    await expect(theMergeTree.connect(minter).huntHare(50)).to.be.reverted;
    await expect(theMergeTree.connect(minter).huntHare(50, {value: ethers.parseEther('0.009')})).to.be.reverted;
    // revertedWith('BelowMinPrice');
  });

  it('Should not hunt hare: token does not exist', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    await expect(
      theMergeTree.connect(alice).huntHare(10000, {value: ethers.parseEther('0.05')})
    ).to.be.revertedWithCustomError(theMergeTree, 'ERC721NonexistentToken');
  });

  it('Should not hunt hare: not started', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await expect(
      theMergeTree.connect(alice).huntHare(0, {value: ethers.parseEther('0.05')})
    ).to.be.revertedWithCustomError(theMergeTree, 'StagHuntNotStarted()');
  });

  it('Should not hunt hare: not owner', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    await expect(
      theMergeTree.connect(alice).huntHare(0, {value: ethers.parseEther('0.05')})
    ).to.be.revertedWithCustomError(theMergeTree, 'NotNFTOwner()');
  });

  it('Should claim', async function () {
    // ARRANGE
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    let matureTokenIds = await cooperates(theMergeTree, minter, alice);
    await theMergeTree.connect(alice).huntStag(22);

    const initTotalPendingClaim = await theMergeTree.totalPendingClaim();
    const initPendingClaimForMinter = await theMergeTree.pendingClaims(await alice.getAddress());

    // ACT
    const tx = theMergeTree.connect(alice).claim(1);
    // ASSERT
    await expect(tx).to.emit(theMergeTree, 'MergeTreeCreated');
    expect(await theMergeTree.totalPendingClaim()).to.equal(initTotalPendingClaim - BigInt(1));
    expect(await theMergeTree.pendingClaims(await alice.getAddress())).to.equal(initPendingClaimForMinter - BigInt(1));
  });

  it('Should claim multiples', async function () {
    // ARRANGE
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    let matureTokenIds = await cooperates(theMergeTree, minter, alice);
    await theMergeTree.connect(alice).huntStag(22);

    const initTotalPendingClaim = await theMergeTree.totalPendingClaim();
    const initPendingClaimForMinter = await theMergeTree.pendingClaims(await alice.getAddress());
    // ACT
    const tx = theMergeTree.connect(alice).claim(3);
    // ASSERT
    await expect(tx).to.emit(theMergeTree, 'MergeTreeCreated');
    expect(await theMergeTree.totalPendingClaim()).to.equal(initTotalPendingClaim - BigInt(3));
    expect(await theMergeTree.pendingClaims(await alice.getAddress())).to.equal(initPendingClaimForMinter - BigInt(3));
  });

  it('Should not claim: too much', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await mintAllOpen(theMergeTree, minter);
    await cooperates(theMergeTree, minter, alice);
    await expect(theMergeTree.connect(alice).claim(1000)).to.be.revertedWithCustomError(
      theMergeTree,
      'NothingToClaim()'
    );
  });

  it('Should not claim: nothing to claim', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await expect(theMergeTree.connect(alice).claim(1)).to.be.revertedWithCustomError(theMergeTree, 'NothingToClaim()');
  });

  it('Should burn', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await (await theMergeTree.connect(minter).mint({value: await theMergeTree.OPEN_MINT_PRICE()})).wait();
    const tokenId = 3;

    const tx = theMergeTree.connect(minter).burn(tokenId);
    await expect(tx).to.emit(theMergeTree, 'MergeTreeBurned').withArgs(tokenId);
    await expect(tx)
      .to.emit(theMergeTree, 'Transfer')
      .withArgs(await minter.getAddress(), ZeroAddress, tokenId);

    // expect(await theMergeTree.trees(tokenId)).to.be.undefined;
    // expect(await theMergeTree.tokenIdsDeclineUntil(tokenId)).to.be.equal(0);
  });

  it('Should not burn: not owner', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    const tokenId = await mintOne(theMergeTree, minter);

    await expect(theMergeTree.connect(addrs[1]).burn(tokenId)).to.be.revertedWithCustomError(
      theMergeTree,
      'NotNFTOwner()'
    );
  });

  it('Should not burn: not found', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    await expect(theMergeTree.connect(minter).burn(3000)).to.be.revertedWithCustomError(
      theMergeTree,
      'ERC721NonexistentToken'
    );
  });

  // https://github.com/alephao/solidity-benchmarks/blob/main/benchmarks/0.8.26/ERC721.md#transferfrom
  it('Transfer should consume less than 103,000 gas', async function () {
    // ARRANGE
    theMergeTree = await loadFixture(deployTokenFixture);
    const tokenId = await mintOne(theMergeTree, minter);

    // ACT
    const gaslimitTransfer = await theMergeTree
      .connect(minter)
      .transferFrom.estimateGas(await minter.getAddress(), await addrs[0].getAddress(), BigInt(tokenId));

    //  ASSERT
    await expect(gaslimitTransfer).to.be.lessThan(103000);
  });

  it('Should return renderTokenById', async function () {
    theMergeTree = await loadFixture(deployTokenFixture);
    // ARRANGE
    await (await theMergeTree.connect(minter).mint({value: await theMergeTree.OPEN_MINT_PRICE()})).wait();

    const tree = await theMergeTree.trees(3);
    // console.log(`Rendering tree: ${tree} `);
    // ACT
    const tokenRendering = await theMergeTree.renderTokenById(3);

    // ASSERT
    expect(tokenRendering.startsWith('<svg')).to.be.equal(true);
    writeToSvgRaw('1_render', tokenRendering);
  });

  it('Should revert renderTokenById for inexistant id', async function () {
    // ARRANGE
    // ACT & ASSERT
    await expect(theMergeTree.renderTokenById(3000))
      .to.be.revertedWithCustomError(theMergeTree, 'ERC721NonexistentToken')
      .withArgs(3000);
  });

  it('Should return tokenUri', async function () {
    // ARRANGE
    theMergeTree = await loadFixture(deployTokenFixture);

    // ACT
    await (await theMergeTree.connect(minter).mint({value: await theMergeTree.OPEN_MINT_PRICE()})).wait();
    const tree = await theMergeTree.trees(3);
    // console.log(`Rendering tree for tokenUri: ${tree} `);
    const tokenUri = await theMergeTree.tokenURI(3);
    writeJSON('tokenUri', tokenUri);

    // ASSERT
    const startsWithB64URI = tokenUri.startsWith('data:application/json;base64') ?? false;
    expect(startsWithB64URI).to.be.equal(true);
  });

  it('Should not return tokenUri: notFound', async function () {
    await expect(theMergeTree.tokenURI(3000)).to.be.revertedWithCustomError(theMergeTree, 'ERC721NonexistentToken');
  });

  it('Should return cooperation', async function () {
    // ARRANGE
    theMergeTree = await loadFixture(deployTokenFixture);
    const tokenId = await mintOne(theMergeTree, minter);

    // ACT
    const coop = await theMergeTree.cooperation();

    //  ASSERT
    await expect(coop).to.be.equal(0);
  });

  describe('NFT Owner actions', function () {
    it('Should toggle color flag', async function () {
      // ARRANGE
      theMergeTree = await loadFixture(deployTokenFixture);
      let tokenId;
      // fist color picker is founders, next one is 1
      for (let i = 2; i < 24; i++) {
        tokenId = await mintOne(theMergeTree, minter);
      }
      const initialState = getBit(await theMergeTree.colors(), tokenId);
      // ACT
      await theMergeTree.connect(minter).toggleColor(tokenId);
      // ASSERT
      const result = getBit(await theMergeTree.colors(), tokenId);
      // console.log(await (await theMergeTree.colors()).toHexString());
      expect(result).to.equal(!initialState);
      // ACT 2
      await theMergeTree.connect(minter).toggleColor(tokenId);
      // ASSERT 2
      const result2 = getBit(await theMergeTree.colors(), tokenId);
      expect(result2).to.equal(initialState);
    });
    it('Should revert toggle color flag: not the NFT owner', async function () {
      // ARRANGE
      theMergeTree = await loadFixture(deployTokenFixture);
      const tokenId = await mintOne(theMergeTree, minter);
      // ACT & ASSERT
      await expect(theMergeTree.connect(addrs[1]).toggleColor(tokenId)).to.be.revertedWithCustomError(
        theMergeTree,
        'NotNFTOwner()'
      );
    });
    it('Should revert toggle color flag: not exist', async function () {
      // ARRANGE
      theMergeTree = await loadFixture(deployTokenFixture);
      // ACT & ASSERT
      await expect(theMergeTree.connect(addrs[1]).toggleColor(9999)).to.be.revertedWithCustomError(
        theMergeTree,
        'ERC721NonexistentToken'
      );
    });
    it('Should revert toggle color flag: not a color picker', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      for (let i = 0; i < 5; i++) {
        await mintOne(theMergeTree, minter);
      }
      // ARRANGE
      // ACT & ASSERT
      for (let i = 3; i < 8; i++) {
        await expect(theMergeTree.connect(minter).toggleColor(i)).to.be.revertedWithCustomError(
          theMergeTree,
          'NotColorPicker()'
        );
      }
    });
    describe('Marker Composition', function () {
      let composableToken: ComposableTestToken;

      before(async () => {
        theMergeTree = await loadFixture(deployTokenFixture);
        await theMergeTree.transferOwnership(await founders.getAddress());
        composableToken = await loadFixture(deployComposableTokenFixture);

        await composableToken.safeMint(await founders.getAddress(), 0);
        await composableToken.safeMint(await founders.getAddress(), 1);
        await composableToken.safeMint(await founders.getAddress(), 2);
      });

      it('Should set marker', async function () {
        // ARRANGE
        const COMPOSABLE_TOKEN_ID = 3;
        await composableToken.safeMint(await founders.getAddress(), COMPOSABLE_TOKEN_ID);
        await theMergeTree.connect(founders).setComposableMarkerApproval(await composableToken.getAddress(), true);
        const tokenId = 0;
        // ACT
        const setMarkerTx = theMergeTree
          .connect(founders)
          .setMarker(tokenId, await composableToken.getAddress(), COMPOSABLE_TOKEN_ID);

        // ASSERT
        (await setMarkerTx).wait();
      });

      it('Should not set marker: invalid token ID', async function () {
        const COMPOSABLE_TOKEN_ID = 4;
        await composableToken.safeMint(await founders.getAddress(), COMPOSABLE_TOKEN_ID);
        // ARRANGE
        await theMergeTree.connect(founders).setComposableMarkerApproval(await composableToken.getAddress(), true);
        const tokenId = 0;
        const setMarkerTx = theMergeTree
          .connect(founders)
          .setMarker(tokenId, await composableToken.getAddress(), COMPOSABLE_TOKEN_ID);

        // ACT
        // ASSERT
        (await setMarkerTx).wait();
        await expect(
          theMergeTree.connect(founders).setMarker(tokenId, await composableToken.getAddress(), 7553)
        ).to.be.revertedWithCustomError(theMergeTree, 'ERC721NonexistentToken');
      });

      it('Should not set marker: unapproved', async function () {
        // ARRANGE
        // ACT
        // ASSERT
        await expect(theMergeTree.connect(alice).setMarker(999, ethers.ZeroAddress, 0)).to.be.revertedWithCustomError(
          theMergeTree,
          'UnapprovedContract'
        );
      });

      it('Should not set marker: not found', async function () {
        // ARRANGE
        await theMergeTree.connect(founders).setComposableMarkerApproval(await composableToken.getAddress(), true);
        // ACT
        // ASSERT
        await expect(
          theMergeTree.connect(alice).setMarker(999, await composableToken.getAddress(), 10)
        ).to.be.revertedWithCustomError(theMergeTree, 'ERC721NonexistentToken');
      });

      it('Should not set marker: not owner', async function () {
        // ARRANGE
        await theMergeTree.connect(founders).setComposableMarkerApproval(await composableToken.getAddress(), true);
        const tokenId = 0;
        // ACT
        // ASSERT
        await expect(
          theMergeTree.connect(alice).setMarker(tokenId, await composableToken.getAddress(), 0)
        ).to.be.revertedWithCustomError(theMergeTree, 'NotNFTOwner');
      });

      it('Should not set marker: not composable token owner', async function () {
        const COMPOSABLE_TOKEN_ID = 5;
        await composableToken.safeMint(await founders.getAddress(), COMPOSABLE_TOKEN_ID);
        // ARRANGE
        await theMergeTree.connect(founders).setComposableMarkerApproval(await composableToken.getAddress(), true);
        const tokenId = 0;
        // ACT
        // ASSERT
        await expect(
          theMergeTree.connect(alice).setMarker(tokenId, await composableToken.getAddress(), COMPOSABLE_TOKEN_ID)
        ).to.be.revertedWithCustomError(theMergeTree, 'NotNFTOwner');
      });
    });
  });

  describe('Marker Composition Rendering', function () {
    let composableToken: ComposableTestToken;

    it('Should render composable marker', async function () {
      // ARRANGE
      theMergeTree = await loadFixture(deployTokenFixture);
      await theMergeTree.transferOwnership(await founders.getAddress());
      composableToken = await loadFixture(deployComposableTokenFixture);

      await composableToken.safeMint(await founders.getAddress(), 0);
      await composableToken.safeMint(await founders.getAddress(), 1);
      await composableToken.safeMint(await founders.getAddress(), 2);
      const COMPOSABLE_TOKEN_ID = 3;
      await composableToken.safeMint(await founders.getAddress(), COMPOSABLE_TOKEN_ID);

      await theMergeTree.connect(founders).setComposableMarkerApproval(await composableToken.getAddress(), true);
      const tokenId = 0;

      writeJSONAndSVG('composed/composed_default', await theMergeTree.tokenURI(tokenId));

      await theMergeTree.connect(founders).setMarker(tokenId, await composableToken.getAddress(), COMPOSABLE_TOKEN_ID);

      // ACT
      const tokenURI = await theMergeTree.tokenURI(tokenId);
      const decodedJson = atob(tokenURI.replace('data:application/json;base64,', ''));
      const image = atob(JSON.parse(decodedJson).image.replace('data:image/svg+xml;base64,', ''));

      // ASSERT
      expect(image.search('<circle cx="1" cy="1" r="1"')).to.equal(-1);
      expect(image.search('<path d="M 0 0 L 10 5 L 0 10 z" />')).greaterThan(0);
      writeJSONAndSVG('composed/composed_triangle', tokenURI);
    });

    it('Should not render composable marker: not owner anymore', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      await theMergeTree.transferOwnership(await founders.getAddress());
      composableToken = await loadFixture(deployComposableTokenFixture);
      await composableToken.safeMint(await founders.getAddress(), 0);
      await composableToken.safeMint(await founders.getAddress(), 1);
      await composableToken.safeMint(await founders.getAddress(), 2);
      const COMPOSABLE_TOKEN_ID = 3;
      await composableToken.safeMint(founders.getAddress(), COMPOSABLE_TOKEN_ID);

      await theMergeTree.connect(founders).setComposableMarkerApproval(composableToken.getAddress(), true);
      const tokenId = 0;

      await (
        await theMergeTree.connect(founders).setMarker(tokenId, composableToken.getAddress(), COMPOSABLE_TOKEN_ID)
      ).wait();

      let tokenURI = await theMergeTree.tokenURI(tokenId);
      let decodedJson = atob(tokenURI.replace('data:application/json;base64,', ''));
      let image = atob(JSON.parse(decodedJson).image.replace('data:image/svg+xml;base64,', ''));

      // ASSERT
      expect(image.search('<circle cx="1" cy="1" r="1"')).to.equal(-1);
      expect(image.search('<path d="M 0 0 L 10 5 L 0 10 z" />')).greaterThan(0);

      // ACT
      await (
        await composableToken
          .connect(founders)
          .transferFrom(await founders.getAddress(), await alice.getAddress(), COMPOSABLE_TOKEN_ID)
      ).wait();
      tokenURI = await theMergeTree.tokenURI(tokenId);
      decodedJson = atob(tokenURI.replace('data:application/json;base64,', ''));
      image = atob(JSON.parse(decodedJson).image.replace('data:image/svg+xml;base64,', ''));

      // ASSERT
      expect(image.search('<path d="M 0 0 L 10 5 L 0 10 z" />')).to.equal(-1);
      expect(image.search('<circle cx="1" cy="1" r="1"')).to.greaterThan(0);
    });

    it('Should render default marker', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      composableToken = await loadFixture(deployComposableTokenFixture);
      const tokenId = await mintOne(theMergeTree, minter);

      // ACT
      const tokenURI = await theMergeTree.tokenURI(tokenId);
      const decodedJson = atob(tokenURI.replace('data:application/json;base64,', ''));
      const image = atob(JSON.parse(decodedJson).image.replace('data:image/svg+xml;base64,', ''));

      // ASSERT
      expect(image.search('<circle cx="1" cy="1" r="1"')).to.greaterThan(0);
      expect(image.search('markerWidth="1.0')).to.greaterThan(0);
    });
    it('Should not render composable marker: default', async function () {
      // ARRANGE
      theMergeTree = await loadFixture(deployTokenFixture);
      composableToken = await loadFixture(deployComposableTokenFixture);
      const tokenId = await mintOne(theMergeTree, minter);

      // ACT
      const tokenURI = await theMergeTree.tokenURI(tokenId);
      const decodedJson = atob(tokenURI.replace('data:application/json;base64,', ''));
      const image = atob(JSON.parse(decodedJson).image.replace('data:image/svg+xml;base64,', ''));

      // ASSERT
      expect(image.search('<path d="M 0 0 L 10 5 L 0 10 z" />')).to.equal(-1);
      expect(image.search('<circle cx="1" cy="1" r="1"')).to.greaterThan(0);
    });
    it('Should render default marker with a bigger markerWidth', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      composableToken = await loadFixture(deployComposableTokenFixture);
      await mintAllOpen(theMergeTree, minter);
      const tokenId = 51;
      // Hunt 2 hares
      (await theMergeTree.connect(minter).huntHare(tokenId, {value: ethers.parseEther('0.05')})).wait();
      (await theMergeTree.connect(minter).huntHare(tokenId, {value: ethers.parseEther('0.11')})).wait();
      await waitForDeclineEnd(theMergeTree);

      // Transfer it to add 1 segment
      await (
        await theMergeTree.connect(minter).transferFrom(await minter.getAddress(), await addrs[0].getAddress(), tokenId)
      ).wait();

      // ACT
      const tokenURI = await theMergeTree.tokenURI(tokenId);
      const decodedJson = atob(tokenURI.replace('data:application/json;base64,', ''));
      const image = atob(JSON.parse(decodedJson).image.replace('data:image/svg+xml;base64,', ''));

      // ASSERT
      expect(image.search('<circle cx="1" cy="1" r="1"')).to.greaterThan(0);
      expect(image.search('markerWidth="1.2')).to.greaterThan(0);
    });
  });

  describe('Growth rendering', function () {
    it('Should grow with transferFrom', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);

      const tokenId = await mintOne(theMergeTree, minter);

      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(2);

      await theMergeTree.connect(minter).transferFrom(minter.getAddress(), addrs[0].getAddress(), tokenId);
      const updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(3);
    });

    it('Should grow with safeTransferFrom', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);

      const tokenId = await mintOne(theMergeTree, minter);
      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(2);

      await theMergeTree
        .connect(minter)
        ['safeTransferFrom(address,address,uint256)'](await minter.getAddress(), await addrs[0].getAddress(), tokenId);
      const updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(3);
    });

    it('Should grow with safeTransferFrom with data', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);

      const tokenId = await mintOne(theMergeTree, minter);
      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(2);

      await theMergeTree
        .connect(minter)
        ['safeTransferFrom(address,address,uint256,bytes)'](
          await minter.getAddress(),
          await addrs[0].getAddress(),
          tokenId,
          ethers.ZeroHash
        );
      const updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(3);
    });

    it('Should grow slower with growth divider', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      await theMergeTree.setGrowthDivider(1);

      const tokenId = await mintOne(theMergeTree, minter);

      await theMergeTree.connect(minter).transferFrom(await minter.getAddress(), await addrs[0].getAddress(), tokenId);
      const tree = await theMergeTree.trees(tokenId);

      const renderToken = await theMergeTree.renderTokenById(tokenId);
      const scale = parseInt(renderToken.split('translate(512, 1000) scale(')[1].split(')"')[0]);
      expect(scale).to.greaterThan(tree.initLength);

      await theMergeTree.setGrowthDivider(2000000);
      const renderToken2 = await theMergeTree.renderTokenById(tokenId);
      const scale2 = parseInt(renderToken2.split('translate(512, 1000) scale(')[1].split(')"')[0]);
      expect(scale2).to.lessThan(scale);
      expect(scale2).to.equal(tree.initLength);
    });

    it('Should decline faster with growth divider', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      await mintAllOpen(theMergeTree, minter);
      await theMergeTree.setGrowthDeclineBlocks(500);

      await network.provider.send('hardhat_mine', ['0x400']); // mine 1024
      const tokenId = 63; // random number from all minted
      const tree = await theMergeTree.trees(tokenId);
      await decline(theMergeTree, founders, 2n);

      await network.provider.send('hardhat_mine', ['0x100']); // mine 256

      await theMergeTree.setGrowthDivider(1);
      const renderToken = await theMergeTree.renderTokenById(tokenId);
      const scale = parseInt(renderToken.split('translate(512, 1000) scale(')[1].split(')"')[0]);
      expect(scale).to.lessThan(227);
      expect(scale).to.greaterThan(tree.initLength);

      // The bigger the growthDivider is, the slower the evolution is.
      // And the tree won't have time to grow fully before declining to declineUntil's block.
      await theMergeTree.setGrowthDivider(10);
      const renderToken2 = await theMergeTree.renderTokenById(tokenId);
      const scale2 = parseInt(renderToken2.split('translate(512, 1000) scale(')[1].split(')"')[0]);
      expect(scale2).to.lessThan(scale);
      expect(scale2).to.greaterThan(tree.initLength);
    });

    it('Should compare 1 grown tree and 1 new', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      await theMergeTree.setGrowthDivider(1);

      const tokenId1 = await mintOne(theMergeTree, minter);
      await network.provider.send('hardhat_mine', ['0x100']); // mine 256
      const tokenId2 = await mintOne(theMergeTree, minter);
      const renderToken1 = await theMergeTree.renderTokenById(tokenId1);
      const renderToken2 = await theMergeTree.renderTokenById(tokenId2);

      const tree1 = await theMergeTree.trees(tokenId1);
      const length1 = parseInt(renderToken1.split('translate(512, 1000) scale(')[1].split(')"')[0]);

      const tree2 = await theMergeTree.trees(tokenId2);
      const length2 = parseInt(renderToken2.split('translate(512, 1000) scale(')[1].split(')"')[0]);

      expect(tree2.mintedSince - tree1.mintedSince).to.be.equal(257); // 257 blocks
      expect(BigInt(length1) - tree1.initLength).to.greaterThan(BigInt(length2) - tree2.initLength); // tree1 grew, tree2 no
      expect(BigInt(length2) - tree2.initLength).to.be.equal(0n); // tree1 grew, tree2 no
      expect(length1).to.be.equal(227); // Length Variation = 257 but maxed by MAX_LENGTH
    });
    it('Should compare 2 trees minted at different blocks', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      await theMergeTree.setGrowthDivider(1);

      const tokenId1 = await mintOne(theMergeTree, minter);
      await network.provider.send('hardhat_mine', ['0x10']); // mine 16
      const tokenId2 = await mintOne(theMergeTree, minter);
      await network.provider.send('hardhat_mine', ['0x10']); // mine 16
      const renderToken1 = await theMergeTree.renderTokenById(tokenId1);
      const renderToken2 = await theMergeTree.renderTokenById(tokenId2);

      const tree1 = await theMergeTree.trees(tokenId1);
      const length1 = parseInt(renderToken1.split('translate(512, 1000) scale(')[1].split(')"')[0]);

      const tree2 = await theMergeTree.trees(tokenId2);
      const length2 = parseInt(renderToken2.split('translate(512, 1000) scale(')[1].split(')"')[0]);

      expect(tree2.mintedSince - tree1.mintedSince).to.be.equal(16 + 1);
      expect(BigInt(length1) - tree1.initLength).to.greaterThan(BigInt(length2) - tree2.initLength); // tree1 grew, tree2 no
      // console.log(tree1.mintedSince, tree2.mintedSince); // 2, 19
      const initBlockNum = await theMergeTree.initBlockNumber();
      // console.log(await theMergeTree.initBlockNumber()); // 121
      const blockNum = await blockNumber();
      // console.log(await blockNumber()); // 156

      expect(BigInt(length2) - tree2.initLength).to.be.equal(blockNum - initBlockNum - 19n);
      expect(BigInt(length1) - tree1.initLength).to.be.equal(blockNum - initBlockNum - 2n); // Length Variation = 32 blocks
    });

    it('Should grow in segments after MAX transfers', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);

      const tokenId = await mintOne(theMergeTree, minter);
      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(2);

      await theMergeTree.connect(minter).transferFrom(await minter.getAddress(), await bob.getAddress(), tokenId);
      let updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(3);

      await theMergeTree.connect(bob).transferFrom(await bob.getAddress(), await addrs[0].getAddress(), tokenId);
      updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(4);
      await theMergeTree.connect(addrs[0]).transferFrom(await addrs[0].getAddress(), await bob.getAddress(), tokenId);
      updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(5);
      await theMergeTree.connect(bob).transferFrom(await bob.getAddress(), await addrs[0].getAddress(), tokenId);
      updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(6);
      await theMergeTree.connect(addrs[0]).transferFrom(await addrs[0].getAddress(), await bob.getAddress(), tokenId);
      updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(6);
    });

    it('Should decline in segments after 1 transfer', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      await mintAllOpen(theMergeTree, minter);
      const tokenId = 63; // random number from all minted
      await decline(theMergeTree, founders, 1n);

      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(2);

      await theMergeTree.connect(minter).transferFrom(await minter.getAddress(), await bob.getAddress(), tokenId);
      const updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(1);
    });

    it('Should decline to MIN in segments after transfers (and render text messages)', async function () {
      theMergeTree = await loadFixture(deployTokenFixture);
      await mintAllOpen(theMergeTree, minter);
      const tokenId = 63; // random number from all minted
      await decline(theMergeTree, founders, 1n);
      const tree = await theMergeTree.trees(tokenId);
      expect(tree.segments).to.equal(2);
      await theMergeTree.connect(minter).transferFrom(await minter.getAddress(), await bob.getAddress(), tokenId);
      let updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(1);
      await theMergeTree.connect(bob).transferFrom(await bob.getAddress(), await addrs[0].getAddress(), tokenId);
      updatedTree = await theMergeTree.trees(tokenId);
      expect(updatedTree.segments).to.equal(0);
      // await theMergeTree.connect(addrs[0]).transferFrom(addrs[0].getAddress(), addrs[1].getAddress(), tokenId);
      // updatedTree = await theMergeTree.trees(tokenId);
      // expect(updatedTree.segments).to.equal(3);
      // await theMergeTree.connect(addrs[1]).transferFrom(addrs[1].getAddress(), addrs[2].getAddress(), tokenId);
      // updatedTree = await theMergeTree.trees(tokenId);
      // expect(updatedTree.segments).to.equal(2);
      // await theMergeTree.connect(addrs[2]).transferFrom(addrs[2].getAddress(), addrs[3].getAddress(), tokenId);
      // updatedTree = await theMergeTree.trees(tokenId);
      // expect(updatedTree.segments).to.equal(1);
      // await theMergeTree.connect(addrs[3]).transferFrom(addrs[3].getAddress(), addrs[4].getAddress(), tokenId);
      // updatedTree = await theMergeTree.trees(tokenId);
      // expect(updatedTree.segments).to.equal(0);
      // await theMergeTree.connect(addrs[4]).transferFrom(addrs[4].getAddress(), addrs[5].getAddress(), tokenId);
      // updatedTree = await theMergeTree.trees(tokenId);
      // expect(updatedTree.segments).to.equal(0);

      // render text messages
      let treeRender = await theMergeTree.renderTokenById(tokenId);
      expect(treeRender.includes('660000">Erysichthon was here')).equal(true);
      writeJSONAndSVG('msg_decline', await theMergeTree.tokenURI(tokenId));
      await waitForDeclineEnd(theMergeTree);
      treeRender = await theMergeTree.renderTokenById(tokenId);
      expect(treeRender.includes('006616">Spes messis in semine')).equal(true);
      writeJSONAndSVG('msg_grow', await theMergeTree.tokenURI(tokenId));
    });

    it('Should go to min length at decline block', async function () {
      // Arrange
      theMergeTree = await loadFixture(deployTokenFixture);
      await mintAllOpen(theMergeTree, minter);
      const tokenId = 63; // random number from all minted
      await theMergeTree.setGrowthDeclineBlocks(256);
      await theMergeTree.setGrowthDivider(1);
      await decline(theMergeTree, founders, 1n);
      // Act
      await network.provider.send('hardhat_mine', ['0x100']); // mine 256 = growthDeclineBlocks
      // await network.provider.send('evm_mine');
      const tokenRendering = await theMergeTree.renderTokenById(tokenId);
      const tree = await theMergeTree.trees(tokenId);

      // Assert
      const scale = tokenRendering.split('translate(512, 1000) scale(')[1].split(')"')[0];
      expect(scale).to.equal(tree.initLength);
    });

    it('Should go to MAX length', async function () {
      // Arrange
      theMergeTree = await loadFixture(deployTokenFixture);
      await theMergeTree.setGrowthDivider(1);
      const tokenId = await mintOne(theMergeTree, minter);

      // Reach max segments
      await theMergeTree.connect(minter).transferFrom(await minter.getAddress(), await bob.getAddress(), tokenId);
      for (let i = 0; i < 2; i++) {
        await theMergeTree.connect(bob).transferFrom(await bob.getAddress(), await addrs[0].getAddress(), tokenId);
        await theMergeTree.connect(addrs[0]).transferFrom(await addrs[0].getAddress(), await bob.getAddress(), tokenId);
      }

      // Act
      for (let i = 0; i < 10; i++) {
        await network.provider.send('hardhat_mine', ['0x100']); // mine 256
      }
      const tokenRendering = await theMergeTree.renderTokenById(tokenId);

      // Assert
      const scale = tokenRendering.split('translate(512, 1000) scale(')[1].split(')"')[0];
      expect(scale).to.equal('227'); // MAX_LENGTH
    });
  });
});
