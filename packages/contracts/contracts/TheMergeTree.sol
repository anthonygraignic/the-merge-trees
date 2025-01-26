// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./utils/StringUtils.sol";
import "./TheMergeTreesRenderer.sol";
import "./interfaces/ITreeSeeder.sol";
import "./interfaces/IToken.sol";

//        _-_
//     /~~   ~~\
//   /~         ~\
//  (             )
//   \  _-    -_  /
//    ^  \\ //  ^
//        | |
//        | |
//        | |
//       /   \
/// @title TheMergeTree
/// @author Anthony Graignic (@agraignic)
contract TheMergeTree is IToken, ERC721Enumerable, Ownable {
    using Strings for uint256;

    error NotFounders();
    error NotNFTOwner();
    error SeederAlreadyLocked();
    error BelowMinPrice(uint256 required, uint256 value);
    error NotColorPicker();
    error UnapprovedContract();
    error FoundersNotThanked();
    error AboveMaxBalancePerAddress();
    error StagHuntNotStarted();
    error StagHuntStarted();
    error NotEnoughCooperation(uint256 coop);
    error NotMatureTree();
    error NothingToClaim();

    ///@dev The internal token ID tracker
    uint256 private _nextTokenId;

    /// @notice Contract URI used by OpenSea to get contract details
    string private _contractUriIpfsHash =
        "bafkreie6rjitehhq73ycddh7q4bojntobi3xev4eloi4rqfnlhwuyj3tqe";

    /// @dev Store init block.number for growth reference
    /// Because we knew.
    uint256 public immutable initBlockNumber;

    /// Creator address
    address payable public founders;

    /// The Merge Tree token seeder
    ITreeSeeder public seeder;
    /// Whether the seeder can be updated
    bool public isSeederLocked;

    uint8 internal constant MAX_SEGMENTS = 6;
    uint32 internal constant MAX_LENGTH = 227; // 138m for real trees

    mapping(uint256 => ITreeSeeder.Tree) public trees;

    /// @dev 32bits RGBA common colors selected by holders
    uint256 public colors;
    /// @notice Number for select color picker priviledge each % NFTs
    uint256 public constant COLOR_PICKER_SELECTOR = 12;

    /// @notice Has the stag hunt started after the open mint?
    bool public hasStagHuntStarted;
    /// @notice Initial supply before the stag hunt
    uint256 public constant BEFORE_HUNT_SUPPLY = 103;
    /// @notice Maximum number of NFTs owned per address before the stag hunt
    /// @dev initially a constant but immutable for testing purposes
    uint256 public immutable beforeHuntLimitPerAddress;
    /// @notice Mint price before the stag hunt
    uint256 public constant OPEN_MINT_PRICE = .07233 ether;
    /// @notice Price to kill a hare as a growth decline spiral protection
    // Correlated to Dunbar's number of 150 stable relationships
    uint256 public constant HARE_KILL_PRICE = .0004822 ether;
    /// @notice Control decline of the trees until a block number
    uint256 public declineUntil;
    /// @dev allow more fine control on growth
    uint256 public growthDivider;
    /// @dev allow more fine control on growth decline
    uint256 public growthDeclineBlocks;
    ///@dev Mapping between tokenId hare killers and their decline end block
    mapping(uint256 => uint256) public tokenIdsDeclineUntil;
    /// @notice Cooperation threshold for the stag hunt, 51.00%
    uint256 public constant COOPERATION_THRESHOLD = 5100;

    ///@notice Total number of pending claims
    ///@dev Used to calculate cooperation percentage efficiently
    uint256 public totalPendingClaim;
    /// @notice Number of pending NFT to claims for each address
    mapping(address => uint32) public pendingClaims;

    /// @notice List of approved contracts to be used as marker (=leaf)
    mapping(address => bool) public approvedComposableTokenForMarker;
    /// @dev Structure for an EIP-4883 token
    struct Token {
        address tokenAddress;
        uint256 tokenId;
    }
    /// @notice List of personalized markers
    mapping(uint256 => Token) private _markerTokenForTokenId;

    constructor(
        address _initialOwner,
        address payable _creator,
        uint256 _beforeHuntLimitPerAddress,
        ITreeSeeder _seeder
    ) ERC721("TheMergeTree", "MTREE") Ownable(_initialOwner) {
        founders = _creator;
        seeder = _seeder;

        initBlockNumber = block.number;
        beforeHuntLimitPerAddress = _beforeHuntLimitPerAddress;
        declineUntil = 0;
        growthDivider = 8292;
        growthDeclineBlocks = 211810;
        totalPendingClaim = 0;
        colors =
            (0x000000FF << TheMergeTreesRenderer.COLOR_LENGTH) |
            0x0B6623FF;

        // Artist's proofs
        _mintTo(founders, _nextTokenId++);
        _mintTo(founders, _nextTokenId++);
        _mintTo(founders, _nextTokenId++);
    }

    /// @notice The IPFS URI of contract-level metadata.
    function contractURI() external view returns (string memory) {
        return string(abi.encodePacked("ipfs://", _contractUriIpfsHash));
    }

    /// @notice Mint a Merge Tree to the minter before the stag hunt.
    /// @dev Call _mintTo with the to address.
    function mint() external payable override returns (uint256) {
        if (!hasStagHuntStarted && _nextTokenId < BEFORE_HUNT_SUPPLY) {
            if (balanceOf(msg.sender) >= beforeHuntLimitPerAddress) {
                revert AboveMaxBalancePerAddress();
            }
            if (msg.value < OPEN_MINT_PRICE) {
                revert BelowMinPrice(OPEN_MINT_PRICE, msg.value);
            }
            if (_nextTokenId >= BEFORE_HUNT_SUPPLY - 1) {
                hasStagHuntStarted = true;
            }

            return _mintTo(msg.sender, _nextTokenId++);
        } else {
            revert StagHuntStarted();
        }
    }

    /// @notice Claim Merge Tree(s) earned from previous stag hunt(s)
    /// @dev The mint loop could have been optimized, but others ERC721's impl made gas increase elsewhere so kept it simple
    function claim(uint32 quantity) external override {
        if (
            pendingClaims[msg.sender] > 0 &&
            quantity <= pendingClaims[msg.sender]
        ) {
            totalPendingClaim -= quantity;
            pendingClaims[msg.sender] = pendingClaims[msg.sender] - quantity;
            uint256 localNextTokenId = _nextTokenId;
            for (uint32 i = 0; i < quantity; i++) {
                _mintTo(msg.sender, localNextTokenId++);
            }
            _nextTokenId = localNextTokenId;
        } else {
            revert NothingToClaim();
        }
    }

    /// @notice Mint the Merge Tree `tokenId` and transfer it `to` address
    function _mintTo(address to, uint256 tokenId) internal returns (uint256) {
        ITreeSeeder.Tree memory tree = trees[tokenId] = seeder.generateTree(
            tokenId,
            initBlockNumber
        );

        _mint(to, tokenId);
        emit MergeTreeCreated(tokenId, tree);

        return tokenId;
    }

    /// @notice Clone a Merge Tree from a hare hunt
    function _clone(
        address to,
        uint256 hareTokenId,
        uint256 tokenId
    ) internal returns (uint256) {
        trees[tokenId] = seeder.cloneTree(initBlockNumber, trees[hareTokenId]);

        _mint(to, tokenId);
        emit MergeTreeCloned(hareTokenId, tokenId);

        return tokenId;
    }

    /// @dev Check token existence before rendering
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /// @inheritdoc ERC721
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (!_exists(tokenId)) {
            revert ERC721NonexistentToken(tokenId);
        }
        ITreeSeeder.Tree memory tree = trees[tokenId];
        string memory tokenName = string(
            abi.encodePacked("The Merge Tree #", tokenId.toString())
        );
        bool grow = declineUntil == 0 || block.number > declineUntil;
        string memory description;
        if (grow) {
            description = string(abi.encodePacked("A beautiful growing tree"));
        } else {
            description = string(abi.encodePacked("A declining tree"));
        }
        string memory image = Base64.encode(
            bytes(_generateSVGforTokenId(tokenId, tokenName, grow))
        );

        string memory boolTraits = string(
            abi.encodePacked(
                '},{"trait_type":"animated","value":',
                tree.animated ? "1" : "0",
                '},{"trait_type":"color_picker","value":',
                tokenId % COLOR_PICKER_SELECTOR == 0 ? "1" : "0"
            )
        );
        string memory dynamicTraits = string(
            abi.encodePacked(
                '},{"trait_type":"segments","value":',
                StringUtils.uint2str(tree.segments),
                '},{"trait_type":"stags","value":',
                StringUtils.uint2str(tree.stags),
                '},{"trait_type":"hares","value":',
                StringUtils.uint2str(tree.hares)
            )
        );

        string memory metadataTraits = string(
            abi.encodePacked(
                string(
                    abi.encodePacked(
                        '","attributes":[{"trait_type":"initLength","value":',
                        StringUtils.uint2str(tree.initLength),
                        '},{"trait_type":"diameter","value":',
                        StringUtils.uint2str(tree.diameter),
                        '},{"trait_type":"branches","value":',
                        StringUtils.uint2str(tree.branches),
                        '},{"trait_type":"angle","value":',
                        StringUtils.uint2str(tree.angle),
                        '},{"trait_type":"D","value":',
                        StringUtils.uint2str(tree.d),
                        '},{"trait_type":"delta","value":',
                        StringUtils.uint2str(tree.delta)
                    )
                ),
                boolTraits,
                dynamicTraits
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                tokenName,
                                '","description":"',
                                description,
                                '","external_url":"https://themergetrees.xyz/trees/',
                                tokenId.toString(),
                                metadataTraits,
                                '}],"image":"',
                                "data:image/svg+xml;base64,",
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    /// @notice Generate whole SVG image from tokenId and tokenName for SVG title a11y
    /// @return full SVG file
    function _generateSVGforTokenId(
        uint256 tokenId,
        string memory tokenName,
        bool grow
    ) internal view returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>',
                tokenName,
                "</title>",
                _renderSky(grow),
                _renderTokenById(tokenId, grow),
                _renderGrass(grow),
                "</svg>"
            )
        );
        return svg;
    }

    /// @notice Render the sky behind the tree
    function _renderSky(bool grow) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<defs><linearGradient id="sky" gradientTransform="rotate(90)"><stop stop-color="#',
                    grow
                        ? 'bae6fd"/><stop stop-color="#f0f9ff'
                        : 'fff7ed"/><stop stop-color="#fed7aa',
                    '" offset="66%"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#sky)"/>'
                )
            );
    }

    /// @notice Render the grass below the tree
    function _renderGrass(bool grow) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<rect width="1024" height="24" y="1000" fill="',
                    grow ? "#2e8b57" : "#660000",
                    '"/>'
                )
            );
    }

    /// @notice Render the holder's marker
    function _renderMarker(
        uint256 tokenId
    ) internal view returns (string memory markerRender) {
        markerRender = "";
        Token memory markerToken = _markerTokenForTokenId[tokenId];
        if (markerToken.tokenAddress != address(0)) {
            if (
                ERC721(markerToken.tokenAddress).ownerOf(markerToken.tokenId) ==
                ownerOf(tokenId)
            ) {
                markerRender = IERC4883(markerToken.tokenAddress)
                    .renderTokenById(markerToken.tokenId);
            }
        }
    }

    /// @notice Render the fractal tree or text from tokenId
    /// Length is computed at each block
    /// @return Tree SVG (defs + groups + line), must be encapsulated in <svg>
    function _renderTokenById(
        uint256 tokenId,
        bool grow
    ) internal view returns (string memory) {
        ITreeSeeder.Tree memory tree = trees[tokenId];

        if (tree.segments < 2) {
            return
                string(
                    abi.encodePacked(
                        '<text dominant-baseline="middle" text-anchor="middle" x="50%" y="50%" font-size="500%" fill="#',
                        grow
                            ? '006616">Spes messis in semine'
                            : '660000">Erysichthon was here',
                        "</text>"
                    )
                );
        }

        uint256 blocksMined = block.number - initBlockNumber - tree.mintedSince;
        uint32 lengthVariation = uint32(blocksMined / growthDivider);
        if (!grow) {
            lengthVariation = uint32(
                (blocksMined * (declineUntil - block.number)) /
                    (growthDivider * declineUntil)
            );
        }
        uint32 lengthAfterBlocksMined = tree.initLength + lengthVariation;
        // uint32 max(lengthAfterBlocksMined, MAX_LENGTH)
        uint32 length = lengthAfterBlocksMined >= MAX_LENGTH
            ? MAX_LENGTH
            : lengthAfterBlocksMined;

        return
            TheMergeTreesRenderer.render(
                tree,
                length,
                colors,
                grow,
                _renderMarker(tokenId)
            );
    }

    /// @inheritdoc IERC4883
    function renderTokenById(
        uint256 tokenId
    ) external view override returns (string memory) {
        if (!_exists(tokenId)) {
            revert ERC721NonexistentToken(tokenId);
        }
        bool grow = declineUntil == 0 || block.number > declineUntil;
        return
            string(
                abi.encodePacked(
                    '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
                    _renderTokenById(tokenId, grow),
                    "</svg>"
                )
            );
    }

    /// @inheritdoc ERC721
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        bool grow = declineUntil == 0 || block.number > declineUntil;
        if (grow) {
            trees[tokenId].segments = trees[tokenId].segments >= MAX_SEGMENTS
                ? MAX_SEGMENTS
                : trees[tokenId].segments + 1;
        } else {
            trees[tokenId].segments = trees[tokenId].segments < 2
                ? 0
                : trees[tokenId].segments - 1;
        }
        emit MetadataUpdate(tokenId);
        return super._update(to, tokenId, auth);
    }

    // The following functions are override as required by Solidity.
    /// @inheritdoc ERC721
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Enumerable, IERC165) returns (bool) {
        return
            interfaceId == this.royaltyInfo.selector ||
            interfaceId == type(IERC4883).interfaceId ||
            // interfaceId == type(IERC4906).interfaceId ||
            interfaceId == bytes4(0x49064906) ||
            super.supportsInterface(interfaceId);
    }

    ///@notice Compute cooperation percentage e.g. 1755->17.55%
    function cooperation() public view returns (uint256) {
        uint256 count = 0;
        uint256 supply = totalSupply();
        for (uint256 i = 0; i < supply; i++) {
            if (
                trees[i].segments >= MAX_SEGMENTS &&
                block.number > tokenIdsDeclineUntil[i]
            ) {
                count++;
            }
        }
        return (count * 10000) / (supply + totalPendingClaim);
    }

    ////////////////////////////////////////////////////
    ///// NFT owner's actions                         //
    ////////////////////////////////////////////////////

    /// @notice Trigger the stag hunt with your mature tree (segments at max).
    /// The stag hunt should have started and there should be enough mature trees to get the stag rewards (=cooperation).
    /// @dev all computations for cooperation is done here to avoid gas waste elsewhere e.g. in transfer.
    function huntStag(uint256 tokenId) external override {
        if (!hasStagHuntStarted) {
            revert StagHuntNotStarted();
        }
        if (msg.sender != ownerOf(tokenId)) {
            revert NotNFTOwner();
        }
        if (trees[tokenId].segments < MAX_SEGMENTS) {
            revert NotMatureTree();
        }

        uint256 supply = totalSupply();
        uint256[] memory matchingIds = new uint256[](supply);
        uint256 count = 0;
        for (uint256 i = 0; i < supply; i++) {
            // Check tree maturity while excluding hare killers
            if (trees[i].segments >= MAX_SEGMENTS) {
                if (block.number > tokenIdsDeclineUntil[i]) {
                    matchingIds[count] = i;
                    count++;
                }
            }
            // Reset animations
            if (tokenIdsDeclineUntil[i] > 0) {
                trees[i].animated = false;
                tokenIdsDeclineUntil[i] = 0;
            }
        }
        uint256 coop = (count * 10000) / (supply + totalPendingClaim);
        if (coop > COOPERATION_THRESHOLD) {
            uint256[] memory filteredMatureTreesTokenIds = new uint256[](count);
            totalPendingClaim = totalPendingClaim + count;
            declineUntil = 0;

            for (uint256 i = 0; i < count; i++) {
                filteredMatureTreesTokenIds[i] = matchingIds[i];
                // Cut mature trees
                trees[matchingIds[i]].segments = 1;
                trees[matchingIds[i]].stags++;

                pendingClaims[ownerOf(matchingIds[i])]++;
            }

            emit BatchMetadataUpdate(0, _nextTokenId - 1);
            emit StagKilled(tokenId, filteredMatureTreesTokenIds);
        } else {
            revert NotEnoughCooperation(coop);
        }
    }

    /// @notice Hunt a hare with your tree.
    /// The stag hunt should have started and you should be the owner of the tree.
    /// This will give special rewards to your tree while cutting it.
    function huntHare(uint256 tokenId) external payable override {
        if (!hasStagHuntStarted) {
            revert StagHuntNotStarted();
        }
        if (msg.sender != ownerOf(tokenId)) {
            revert NotNFTOwner();
        }
        uint256 minPrice = (1 + trees[tokenId].hares) *
            HARE_KILL_PRICE *
            totalSupply();
        if (msg.value < minPrice) {
            revert BelowMinPrice(minPrice, msg.value);
        }
        if (declineUntil == 0) {
            declineUntil = block.number + growthDeclineBlocks;
        } else {
            declineUntil = declineUntil + growthDeclineBlocks;
        }

        tokenIdsDeclineUntil[tokenId] = declineUntil;
        trees[tokenId].hares++;
        uint256 clonedTokenId = _clone(msg.sender, tokenId, _nextTokenId++);
        trees[tokenId].animated = true;
        tokenIdsDeclineUntil[clonedTokenId] = declineUntil;

        emit BatchMetadataUpdate(0, _nextTokenId - 1);
        emit HareKilled(tokenId);
    }

    /// @notice Burn a tree.
    function burn(uint256 tokenId) external override {
        if (msg.sender != ownerOf(tokenId)) {
            revert NotNFTOwner();
        }
        _burn(tokenId);
        delete trees[tokenId];
        delete _markerTokenForTokenId[tokenId];
        delete tokenIdsDeclineUntil[tokenId];
        emit MergeTreeBurned(tokenId);
    }

    /// @notice Toggle color bit if you are the owner of `tokenId`. This will impact all trees' colors.
    /// Trees share the same colors, each encoded in 32 bits to encourage beneficial cooperation.
    function toggleColor(uint256 tokenId) external override {
        if (msg.sender != ownerOf(tokenId)) {
            revert NotNFTOwner();
        }
        if (tokenId % COLOR_PICKER_SELECTOR != 0) {
            revert NotColorPicker();
        }
        colors = colors ^ (1 << (tokenId / COLOR_PICKER_SELECTOR));
    }

    /// @notice Set the marker at the end of each apex branch.
    /// The marker must be composable SVG NFT (ERC-4883) from an approved contract.
    /// The caller must be the owner of the marker NFT and the Merge Tree NFT.
    function setMarker(
        uint256 tokenId,
        address markerTokenContract,
        uint256 markerTokenId
    ) external override {
        if (!approvedComposableTokenForMarker[markerTokenContract]) {
            revert UnapprovedContract();
        }
        if (
            msg.sender != ownerOf(tokenId) ||
            msg.sender != ERC721(markerTokenContract).ownerOf(markerTokenId)
        ) {
            revert NotNFTOwner();
        }

        _markerTokenForTokenId[tokenId] = Token(
            markerTokenContract,
            markerTokenId
        );
        emit MetadataUpdate(tokenId);
        emit MergeTreeMarkerUpdated(tokenId);
    }

    ////////////////////////////////////////////////////
    ///// Royalties                                   //
    ////////////////////////////////////////////////////

    /// @dev Royalties are the same for every token that's why we don't use OZ's impl.
    function royaltyInfo(
        uint256,
        uint256 amount
    ) public view returns (address, uint256) {
        // theMergeTreesDAO, 0%
        return (owner(), (amount * 0) / 10000);
    }

    ////////////////////////////////////////////////////
    ///// Owner                                       //
    ////////////////////////////////////////////////////

    /// @dev Allow owner to update contract URI IPFS hash
    function setContractURIHash(
        string memory newContractUriIpfsHash
    ) external onlyOwner {
        _contractUriIpfsHash = newContractUriIpfsHash;
    }

    /// @notice Approve or not a token as a composable marker, only by owner
    /// Require that at least 3 tokens are sent as a gift to the Founders team.
    function setComposableMarkerApproval(
        address markerTokenContract,
        bool approved
    ) external override onlyOwner {
        if (ERC721(markerTokenContract).balanceOf(founders) < 3) {
            revert FoundersNotThanked();
        }
        approvedComposableTokenForMarker[markerTokenContract] = approved;

        emit ComposableMarkerApproval(markerTokenContract, approved);
    }

    ///@notice Reset tree common colors to default, only by owner
    function resetColors() external override onlyOwner {
        colors =
            (0x000000FF << TheMergeTreesRenderer.COLOR_LENGTH) |
            0x0B6623FF;
    }

    /// @notice Set growth divider, only by owner
    function setGrowthDivider(
        uint256 newGrowthDivider
    ) external override onlyOwner {
        growthDivider = newGrowthDivider;

        emit GrowthDividerUpdated(newGrowthDivider);
    }

    /// @notice Set growth decline blocks after hare kill, only by owner
    function setGrowthDeclineBlocks(
        uint256 newGrowthDeclineBlocks
    ) external override onlyOwner {
        growthDeclineBlocks = newGrowthDeclineBlocks;

        emit GrowthDeclineBlocksUpdated(newGrowthDeclineBlocks);
    }

    /// @notice Set the token seeder.
    /// @dev Only callable by the owner when not locked.
    function setSeeder(ITreeSeeder _seeder) external override onlyOwner {
        if (isSeederLocked) {
            revert SeederAlreadyLocked();
        }
        seeder = _seeder;

        emit SeederUpdated(_seeder);
    }

    /// @notice Lock the seeder.
    /// @dev This cannot be reversed and is only callable by the owner when not locked.
    function lockSeeder() external override onlyOwner {
        if (isSeederLocked) {
            revert SeederAlreadyLocked();
        }
        isSeederLocked = true;

        emit SeederLocked();
    }

    ////////////////////////////////////////////////////
    ///// Founders                                    //
    ////////////////////////////////////////////////////
    function withdraw() external {
        if (msg.sender != founders && msg.sender != owner()) {
            revert NotFounders();
        }
        (bool success, ) = founders.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    /// @notice Allow founders to set its address
    function setFounders(address payable newFounders) external override {
        if (msg.sender != founders) {
            revert NotFounders();
        }
        founders = newFounders;
        emit FoundersUpdated(newFounders);
    }
}
