// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ISuperchainTokenBridge} from "@interop-lib/interfaces/ISuperchainTokenBridge.sol";
import {IL2ToL2CrossDomainMessenger} from "@interop-lib/interfaces/IL2ToL2CrossDomainMessenger.sol";
import {CrossDomainMessageLib} from "@interop-lib/libraries/CrossDomainMessageLib.sol";

contract SuperPool {
    ISuperchainTokenBridge public constant bridge = ISuperchainTokenBridge(0x4200000000000000000000000000000000000028);
    IL2ToL2CrossDomainMessenger public constant messenger =IL2ToL2CrossDomainMessenger(0x4200000000000000000000000000000000000023);

    event InitCrosschainSwap(uint256 targetChainId, address tokenA, uint256 amountA, address tokenB, address recipient);
    event ExecutedCrosschainSwap(uint256 sourceChainId, address tokenA, uint256 amountA, address tokenB, address recipient);

    function getReserves(address tokenA, address tokenB) public view returns (uint256, uint256) {
        return (IERC20(tokenA).balanceOf(address(this)), IERC20(tokenB).balanceOf(address(this)));
    }
    
    function estimateReceiveAmount(address tokenA, uint256 amountA, address tokenB) public returns (uint256) {
        (uint256 reserveA, uint256 reserveB) = getReserves(tokenA, tokenB);
        uint256 amountB = amountA * reserveB / reserveA;
        return amountB;
    }

    function swap(address tokenA, uint256 amountA, address tokenB) external {
        uint256 amountB = estimateReceiveAmount(tokenA, amountA, tokenB);
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);
    }

    function crosschainSwap(uint256 targetChainId, address tokenA, uint256 amountA, address tokenB) external returns (bytes32) {
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        
        bytes32 sendERC20MsgHash = bridge.sendERC20(address(tokenA), address(this), amountA, targetChainId);
        emit InitCrosschainSwap(targetChainId, tokenA, amountA, tokenB, msg.sender);

        return messenger.sendMessage(
            targetChainId,
            address(this),
            abi.encodeWithSelector(
                this.executeCrosschainSwap.selector,
                sendERC20MsgHash,
                tokenA,
                amountA,
                tokenB,
                msg.sender
            )
        )
    }

    function executeCrosschainSwap(, bytes32 sendERC20MsgHash, address tokenA, uint256 amountA, address tokenB, address recipient) external {
        CrossDomainMessageLib.requireCrossDomainCallback();
        CrossDomainMessageLib.requireMessageSuccess(sendERC20MsgHash);

        uint256 amountB = estimateReceiveAmount(tokenA, amountA, tokenB);
        IERC20(tokenB).transfer(recipient, amountB);

        (, uint256 chainId) = messenger.crossDomainMessageContext();              
        emit ExecutedCrosschainSwap(chainId, tokenA, amountA, tokenB, recipient);
    }
}
