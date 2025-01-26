// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library StringUtils {
    /// @dev convert an uint to string
    function uint2str(
        uint256 _i
    ) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /// @dev convert an uint to a fixed-length string e.g. 84 => 084, useful for float numbers
    function uint2strFixedLength(
        uint256 _i,
        uint256 _length
    ) internal pure returns (string memory _uintAsString) {
        bytes memory bstr = new bytes(_length);
        uint256 k = _length;
        while (k != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
