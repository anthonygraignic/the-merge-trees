// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

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
/// @title Interface for TheMergeTreeSeeder
interface ITreeSeeder {
    /// @notice Tree structure
    struct Tree {
        uint16 initLength;
        uint16 diameter;
        uint8 segments;
        uint8 branches;
        bool animated;
        uint16 angle;
        /// @dev D: fractal dimension (Hausdorff) of the tree skeleton (for length calculation)
        /// 2 < D < 3
        /// Stored as an index of the precomputed values (see TheMergeTreesRenderer.sol)
        uint8 d;
        /// @dev the Leonardo exponent (for diameter calculation)
        /// 1.93 < delta < 2.21 for infinite branching
        /// Stored as an index of the precomputed values (see TheMergeTreesRenderer.sol)
        uint8 delta;
        uint8 stags;
        uint8 hares;
        uint128 mintedSince;
    }

    function generateTree(
        uint256 tokenId,
        uint256 contractInitBlockNumber
    ) external view returns (Tree memory);

    function cloneTree(
        uint256 contractInitBlockNumber,
        Tree memory tree
    ) external view returns (Tree memory);
}
