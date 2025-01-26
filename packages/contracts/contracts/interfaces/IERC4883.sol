// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @dev Interface of the EIP-4883 Non-Fungible Token Standard, as defined in the
/// https://eips.ethereum.org/EIPS/eip-4883.
/// The EIP is still in DRAFT, waiting for FINAL for INTERFACE_ID
interface IERC4883 is IERC165 {
    /// @notice Render a SVG NFT for on-chain composition
    /// @param id desired token id of SVG NFT
    /// @return the SVG body for the specified token id and must either be an empty string or valid SVG element(s).
    function renderTokenById(uint256 id) external view returns (string memory);
}
