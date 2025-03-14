// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ISuperchainTokenBridge} from "@interop-lib/interfaces/ISuperchainTokenBridge.sol";
import {IL2ToL2CrossDomainMessenger} from "@interop-lib/interfaces/IL2ToL2CrossDomainMessenger.sol";
import {CrossDomainMessageLib} from "@interop-lib/libraries/CrossDomainMessageLib.sol";
import { PredeployAddresses } from "@interop-lib/libraries/PredeployAddresses.sol";

contract SuperPool {
    ISuperchainTokenBridge public constant bridge = ISuperchainTokenBridge(PredeployAddresses.SUPERCHAIN_TOKEN_BRIDGE);
    IL2ToL2CrossDomainMessenger public constant messenger =IL2ToL2CrossDomainMessenger(PredeployAddresses.L2_TO_L2_CROSS_DOMAIN_MESSENGER);

    event InitCrosschainSwap(uint256 targetChainId, address tokenA, uint256 amountA, address tokenB, address recipient);
    event ExecuteCrosschainSwap(uint256 sourceChainId, address tokenA, uint256 amountA, address tokenB, uint256 amountB, uint256 reserveA, uint256 reserveB, address recipient);

    function getReserves(address tokenA, address tokenB) public view returns (uint256, uint256) {
        return (IERC20(tokenA).balanceOf(address(this)), IERC20(tokenB).balanceOf(address(this)));
    }
    
    function estimateReceiveAmount(address tokenA, uint256 amountA, address tokenB) public returns (uint256) {
        (uint256 reserveA, uint256 reserveB) = getReserves(tokenA, tokenB);
        uint256 amountB = amountA * reserveB / reserveA;
        return amountB;
    }

    function swap(address tokenA, uint256 amountA, address tokenB) external {
        require(tokenA != tokenB, "SuperPool: tokenA and tokenB must be different");
        uint256 amountB = estimateReceiveAmount(tokenA, amountA, tokenB);
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);
    }

    function crosschainSwap(uint256 targetChainId, address tokenA, uint256 amountA, address tokenB) external returns (bytes32) {
        require(tokenA != tokenB, "SuperPool: tokenA and tokenB must be different");

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
        );
    }

    function executeCrosschainSwap(bytes32 sendERC20MsgHash, address tokenA, uint256 amountA, address tokenB, address recipient) external {
        require(msg.sender == PredeployAddresses.L2_TO_L2_CROSS_DOMAIN_MESSENGER, "SuperPool: only messenger can call");
        
        CrossDomainMessageLib.requireCrossDomainCallback();
        CrossDomainMessageLib.requireMessageSuccess(sendERC20MsgHash);

        (uint256 reserveA, uint256 reserveB) = getReserves(tokenA, tokenB);
        reserveA = reserveA - amountA;
        uint256 amountB = amountA * reserveB / reserveA;
        IERC20(tokenB).transfer(recipient, amountB);

        (, uint256 chainId) = messenger.crossDomainMessageContext();              
        emit ExecuteCrosschainSwap(chainId, tokenA, amountA, tokenB, amountB, reserveA, reserveB, recipient);
    }
}
