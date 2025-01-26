// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../interfaces/IERC4883.sol";
import "../utils/StringUtils.sol";

contract ComposableTestToken is ERC721, IERC4883 {
    constructor() ERC721("MyComposableToken", "MCTK") {}

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function renderTokenById(
        uint256 id
    ) external pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg viewBox="0 0 10 10"><title>Composable',
                    StringUtils.uint2str(id),
                    '</title><path d="M 0 0 L 10 5 L 0 10 z" /></svg>'
                )
            );
    }
}
