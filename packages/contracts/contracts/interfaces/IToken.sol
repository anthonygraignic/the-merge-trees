// SPDX-License-Identifier: GPL-3.0

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
/// @title Interface for Token

pragma solidity ^0.8.6;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import "./ITreeSeeder.sol";
import "./IERC4883.sol";

interface IToken is IERC721, IERC4883, IERC4906 {
    event StagKilled(uint256 indexed hunterTokenId, uint256[] tokenIds);
    event HareKilled(uint256 indexed hunterTokenId);

    event MergeTreeCreated(uint256 indexed tokenId, ITreeSeeder.Tree tree);
    event MergeTreeCloned(uint256 indexed hareTokenId, uint256 indexed tokenId);
    event MergeTreeBurned(uint256 indexed tokenId);
    event MergeTreeMarkerUpdated(uint256 indexed tokenId);

    event ComposableMarkerApproval(address tokenContract, bool approved);

    event GrowthDividerUpdated(uint256 newGrowthDivider);
    event GrowthDeclineBlocksUpdated(uint256 newGrowthDeclineBlocks);
    event DeclineUntil(uint256 blockNumber);

    event FoundersUpdated(address founders);

    event SeederUpdated(ITreeSeeder seeder);
    event SeederLocked();

    function mint() external payable returns (uint256);

    function cooperation() external view returns (uint256);

    function huntStag(uint256 tokenId) external;

    function huntHare(uint256 tokenId) external payable;

    function claim(uint32 quantity) external;

    function burn(uint256 tokenId) external;

    function toggleColor(uint256 tokenId) external;

    function setMarker(
        uint256 tokenId,
        address markerTokenContract,
        uint256 markerTokenId
    ) external;

    function setComposableMarkerApproval(
        address tokenContract,
        bool approved
    ) external;

    function resetColors() external;

    function setGrowthDivider(uint256 newGrowthDivider) external;

    function setGrowthDeclineBlocks(uint256 newGrowthDeclineBlocks) external;

    function setSeeder(ITreeSeeder seeder) external;

    function lockSeeder() external;

    function setFounders(address payable newFounders) external;
}
