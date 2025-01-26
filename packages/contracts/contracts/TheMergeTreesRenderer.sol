// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.28;

import "./interfaces/ITreeSeeder.sol";
import "./utils/StringUtils.sol";
import "./utils/HexStrings.sol";

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
/// @title The Merge Trees Renderer, converting on-chain data to a SVG fractal tree.
/// @author Anthony Graignic (@agraignic)
library TheMergeTreesRenderer {
    // Computed values of 1..16**(1/X)
    // with x = [1.93, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3]
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_1_93 =
        0x0004c38300047b5000042e9e0003dc6e00038355000321230002b23200022f6a;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2 =
        0x000493e0000450da0004097f0003bcd40003697600030d400002a4950002286d;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2_1 =
        0x0004582400041b7c0003dab4000394de000348a00002f3e20002931d00021f62;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2_2 =
        0x0004247d0003ed340003b202000371fe00032bd80002dd8a000283a00002174b;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2_3 =
        0x0003f76c0003c4bc00038e510003534e0003126e0002c9b7000275cd00021002;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2_4 =
        0x0003cfcc0003a11100036ec90003381e0002fbd40002b803000269640002096b;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2_5 =
        0x0003acb60003816b000352be00031fdf0002e79d0002a81e00025e300002036e;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2_6 =
        0x00038d710003652a000339a700030a1f0002d56d000299c4000254070001fdf7;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2_7 =
        0x0003716b00034bcb000323140002f6830002c4fc00028cbf00024ac60001f8f4;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2_8 =
        0x0003582b000334e700030eac0002e4bf0002b60d000280e30002424f0001f458;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_2_9 =
        0x00034150000320250002fc230002d4950002a86e0002760900023a890001f017;
    uint256 private constant FRACTIONAL_POW_HEX_TABLE_3 =
        0x00032c8800030d400002eb3d0002c5d000029bf500026c14000233600001ec28;

    uint32 private constant MULTIPLIER = 10 ** 8;
    /// @dev 32 bits per color #FFFFFFAA
    uint16 internal constant COLOR_LENGTH = 32;

    /// @dev Segment for defining lines
    struct Segment {
        uint8 depth;
        uint8 level;
        bool markerEnd;
        uint8 branches;
        uint16 angle;
        uint8 dIndex;
        uint8 deltaIndex;
    }

    function render(
        ITreeSeeder.Tree memory _tree,
        uint32 _length,
        uint256 colors,
        bool grow,
        string memory markerRender
    ) public pure returns (string memory treeRender) {
        treeRender = string(
            abi.encodePacked(
                '<defs><g id="stem"><line x1="0" y1="0" x2="0" y2="-1" stroke="#',
                getColor(colors, 1),
                '" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="0" stroke-width="',
                StringUtils.uint2str(_tree.diameter / _length),
                ".",
                StringUtils.uint2strFixedLength(
                    ((_tree.diameter * 1000) / _length),
                    3
                ),
                '">',
                _tree.animated
                    ? grow
                        ? '<animate attributeName="stroke-dashoffset" dur="12s" repeatCount="indefinite" values="1;.1;.07;.05;0"/>'
                        : '<animate attributeName="stroke-dashoffset" dur="12s" repeatCount="indefinite" values="0;.05;.07;.1;1"/>'
                    : "",
                "</line></g>"
            )
        );

        for (uint8 depth = _tree.segments - 1; depth > 0; depth--) {
            treeRender = string(
                abi.encodePacked(
                    treeRender,
                    drawSegment(
                        Segment(
                            depth,
                            _tree.segments - depth,
                            false,
                            _tree.branches,
                            _tree.angle,
                            _tree.d,
                            _tree.delta
                        )
                    )
                )
            );
        }
        if (_tree.animated) {
            treeRender = string(
                abi.encodePacked(
                    treeRender,
                    grow
                        ? '<animate href="#leaf" xlink:href="#leaf" attributeType="CSS" attributeName="opacity" values="0;.9;1" dur="12s" repeatCount="indefinite"/>'
                        : '<animate href="#leaf" xlink:href="#leaf" attributeType="CSS" attributeName="opacity" values="1;.9;0" dur="12s" repeatCount="indefinite"/>'
                )
            );
        }
        treeRender = string(
            abi.encodePacked(
                treeRender,
                '</defs><g transform="translate(512, 1000) scale(',
                StringUtils.uint2str(_length),
                ')"><use href="#l',
                StringUtils.uint2str(_tree.segments - 1),
                '" xlink:href="#l',
                StringUtils.uint2str(_tree.segments - 1),
                '"/></g>'
            )
        );

        treeRender = string(
            abi.encodePacked(
                treeRender,
                renderMarkerP(
                    bytes(markerRender).length > 0
                        ? markerRender
                        : string(
                            abi.encodePacked(
                                '<svg viewBox="0 0 2 2"><circle cx="1" cy="1" r="1" fill="#',
                                getColor(colors, 0),
                                '"/></svg>'
                            )
                        ),
                    _tree.stags + _tree.hares
                )
            )
        );

        return treeRender;
    }

    function drawSegment(
        Segment memory _segment
    ) internal pure returns (string memory segmentBranchesRender) {
        // Solidity only support uint as pow exponent so created a table
        // Length is calculated based on D: fractal dimension (Hausdorff) of the tree skeleton
        uint32 scaleLength = computeScale(_segment.depth, _segment.dIndex);
        // Diameter is calculated based on delta: the Leonardo exponent.
        uint32 scaleDiameter = computeScale(
            _segment.depth,
            _segment.deltaIndex
        );

        if (_segment.branches < 4) {
            segmentBranchesRender = string(
                abi.encodePacked(
                    '<g id="l',
                    StringUtils.uint2str(_segment.level),
                    _segment.level == 1
                        ? '" marker-end="url(#leaf)"><use href="#l'
                        : '"><use href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" xlink:href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" transform="translate(0,-1) rotate(-',
                    StringUtils.uint2str(_segment.angle),
                    ") scale(.",
                    StringUtils.uint2str(scaleDiameter),
                    ",.",
                    StringUtils.uint2str(scaleLength),
                    ')"/>'
                )
            );
            segmentBranchesRender = string(
                abi.encodePacked(
                    segmentBranchesRender,
                    '<use href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" xlink:href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" transform="translate(0,-1) rotate(',
                    StringUtils.uint2str(_segment.angle),
                    ") scale(.",
                    StringUtils.uint2str(scaleDiameter),
                    ",.",
                    StringUtils.uint2str(scaleLength),
                    ')"/>'
                )
            );

            if (_segment.branches == 3) {
                segmentBranchesRender = string(
                    abi.encodePacked(
                        segmentBranchesRender,
                        '<use href="#l',
                        StringUtils.uint2str(_segment.level - 1),
                        '" xlink:href="#l',
                        StringUtils.uint2str(_segment.level - 1),
                        '" transform="translate(0,-1) scale(.',
                        StringUtils.uint2str(scaleDiameter),
                        ",.",
                        StringUtils.uint2str(scaleLength),
                        ')"/>'
                    )
                );
            }
        } else {
            segmentBranchesRender = string(
                abi.encodePacked(
                    '<g id="l',
                    StringUtils.uint2str(_segment.level),
                    _segment.level == 1
                        ? '" marker-end="url(#leaf)"><use href="#l'
                        : '"><use href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" xlink:href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" transform="translate(0,-1) rotate(-',
                    StringUtils.uint2str((_segment.angle * 3) / 2),
                    ") scale(.",
                    StringUtils.uint2str(scaleDiameter),
                    ",.",
                    StringUtils.uint2str(scaleLength),
                    ')"/>'
                )
            );
            segmentBranchesRender = string(
                abi.encodePacked(
                    segmentBranchesRender,
                    '<use href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" xlink:href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" transform="translate(0,-1) rotate(-',
                    StringUtils.uint2str(_segment.angle / 2),
                    ") scale(.",
                    StringUtils.uint2str(scaleDiameter),
                    ",.",
                    StringUtils.uint2str(scaleLength),
                    ')"/>'
                )
            );
            segmentBranchesRender = string(
                abi.encodePacked(
                    segmentBranchesRender,
                    '<use href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" xlink:href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" transform="translate(0,-1) rotate(',
                    StringUtils.uint2str(_segment.angle / 2),
                    ") scale(.",
                    StringUtils.uint2str(scaleDiameter),
                    ",.",
                    StringUtils.uint2str(scaleLength),
                    ')"/>'
                )
            );
            segmentBranchesRender = string(
                abi.encodePacked(
                    segmentBranchesRender,
                    '<use href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" xlink:href="#l',
                    StringUtils.uint2str(_segment.level - 1),
                    '" transform="translate(0,-1) rotate(',
                    StringUtils.uint2str((_segment.angle * 3) / 2),
                    ") scale(.",
                    StringUtils.uint2str(scaleDiameter),
                    ",.",
                    StringUtils.uint2str(scaleLength),
                    ')"/>'
                )
            );
        }

        segmentBranchesRender = string(
            abi.encodePacked(
                segmentBranchesRender,
                '<use href="#stem" xlink:href="#stem"/></g>'
            )
        );

        return segmentBranchesRender;
    }

    /// @dev Define the marker at the end of the last segment
    /// Define a dedicated <def> block to be on top of tree drawing
    function renderMarkerP(
        string memory tokenRender,
        uint8 cuts
    ) internal pure returns (string memory markerRender) {
        markerRender = string(
            abi.encodePacked(
                '<defs><marker id="leaf" orient="auto" markerUnits="userSpaceOnUse" refX="50%" refY="50%" viewBox="0 0 1024 1024" markerWidth="1.',
                StringUtils.uint2str(cuts),
                '" markerHeight="1.',
                StringUtils.uint2str(cuts),
                '">',
                tokenRender,
                "</marker></defs>"
            )
        );
    }

    /// @dev Compute scale (l_k+1/l_k)
    function computeScale(
        uint8 _level,
        uint8 index
    ) internal pure returns (uint32 scale) {
        uint256 precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_2;
        if (index == 0) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_1_93;
        } else if (index == 1) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_2;
        } else if (index == 2) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_1;
            // } else if (index == 3) {
            //     precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_2;
        } else if (index == 4) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_3;
        } else if (index == 5) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_4;
        } else if (index == 6) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_5;
        } else if (index == 7) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_6;
        } else if (index == 8) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_7;
        } else if (index == 9) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_8;
        } else if (index == 10) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_2_9;
        } else if (index == 11) {
            precomputedValue = FRACTIONAL_POW_HEX_TABLE_3;
        }

        return
            MULTIPLIER /
            uint32((precomputedValue >> (32 * (_level - 1))) & 0xFFFFFFFF);
    }

    function getColor(
        uint256 colors,
        uint8 index
    ) internal pure returns (string memory) {
        uint256 shiftedColors = colors >> (COLOR_LENGTH * index);
        return HexStrings.toHexString(shiftedColors, 4);
    }
}
