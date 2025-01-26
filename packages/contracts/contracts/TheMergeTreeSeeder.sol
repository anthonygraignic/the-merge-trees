// SPDX-License-Identifier: GPL-3.0
import {ITreeSeeder} from "./interfaces/ITreeSeeder.sol";

pragma solidity 0.8.28;

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
/// @title The Merge Tree Seeder
/// @author Anthony Graignic (@agraignic)
/// Inspired by Noun's seeder as it allow a cleaner code organization and simplify testing & QA.
contract TheMergeTreeSeeder is ITreeSeeder {
    /// @notice Generate a pseudo-random Merge Tree using prevrandao, contract address & tokenId
    function generateTree(
        uint256 tokenId,
        uint256 contractInitBlockNumber
    ) external view override returns (Tree memory) {
        bytes32 predictableRandom = keccak256(
            abi.encodePacked(block.prevrandao, address(this), tokenId)
        );

        uint8 randomAngleSelector = uint8(predictableRandom[2]) & 0x07;
        uint16 randomAngle = 30;
        if (randomAngleSelector == 2) {
            randomAngle = 20;
        } else if (randomAngleSelector > 2 && randomAngleSelector < 5) {
            randomAngle = 45;
        } else if (randomAngleSelector > 4 && randomAngleSelector < 7) {
            randomAngle = 60;
        } else if (randomAngleSelector == 7) {
            randomAngle = 90;
        }

        return
            Tree({
                initLength: 10 +
                    ((30 * (uint16(uint8(predictableRandom[0])))) / 255),
                diameter: (5 +
                    ((35 * uint16(uint8(predictableRandom[1]))) / 255)),
                segments: 1,
                branches: 2 + (uint8(predictableRandom[3]) % 0x03), // 50% chance of having 2
                animated: false,
                angle: randomAngle,
                d: 1 +
                    ((10 * (uint8((predictableRandom[2] >> 5) & 0x0F))) / 16),
                delta: uint8(predictableRandom[2] >> 3) & 0x03,
                stags: 0,
                hares: 0,
                mintedSince: uint128(block.number - contractInitBlockNumber)
            });
    }

    function cloneTree(
        uint256 contractInitBlockNumber,
        Tree memory tree
    ) external view override returns (Tree memory) {
        return
            Tree({
                initLength: tree.initLength,
                diameter: tree.diameter,
                segments: 1,
                branches: 2,
                animated: false,
                angle: 30,
                d: tree.d,
                delta: tree.delta,
                stags: tree.stags,
                hares: tree.hares,
                mintedSince: uint128(block.number - contractInitBlockNumber)
            });
    }
}
