// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract SuperPool {
    function getReserves(address tokenA, address tokenB) public view returns (uint256, uint256) {
        return (IERC20(tokenA).balanceOf(address(this)), IERC20(tokenB).balanceOf(address(this)));
    }

    function swap(address tokenA, uint256 amountA, address tokenB) external {
        (uint256 reserveA, uint256 reserveB) = getReserves(tokenA, tokenB);
        uint256 amountB = amountA * reserveB / reserveA;
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);
    }

    function estimateReceiveAmount(address tokenA, uint256 amountA, address tokenB) public returns (uint256) {
        (uint256 reserveA, uint256 reserveB) = getReserves(tokenA, tokenB);
        uint256 amountB = amountA * reserveB / reserveA;
        return amountB;
    }
}
