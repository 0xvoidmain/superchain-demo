// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {L2NativeSuperchainERC20} from "../src/L2NativeSuperchainERC20.sol";
import {SuperPool} from "../src/SuperPool.sol";

contract SuperchainERC20Deployer is Script {
    string deployConfig;

    constructor() {
        string memory deployConfigPath = vm.envOr("DEPLOY_CONFIG_PATH", string("/configs/deploy-config.toml"));
        string memory filePath = string.concat(vm.projectRoot(), deployConfigPath);
        deployConfig = vm.readFile(filePath);
    }

    /// @notice Modifier that wraps a function in broadcasting.
    modifier broadcast() {
        vm.startBroadcast(msg.sender);
        _;
        vm.stopBroadcast();
    }

    function setUp() public {}

    function run() public {
        string[] memory chainsToDeployTo = vm.parseTomlStringArray(deployConfig, ".deploy_config.chains");

        address deployedAddress_A;
        address deployedAddress_B;
        address ownerAddr;
        address poolAddr;
        for (uint256 i = 0; i < chainsToDeployTo.length; i++) {
            string memory chainToDeployTo = chainsToDeployTo[i];

            console.log("Deploying to chain: ", chainToDeployTo);

            vm.createSelectFork(chainToDeployTo);
            (address _deployedAddress, address _ownerAddr) = deployTokenA();
            deployedAddress_A = _deployedAddress;

            (address _deployedAddressb, address _ownerAddr1) = deployTokenB();
            deployedAddress_B = _deployedAddressb;

            ownerAddr = _ownerAddr;

            poolAddr = deployPool();
        }

        outputDeploymentResult(deployedAddress_A, deployedAddress_B, ownerAddr, poolAddr);
    }

    function deployTokenA() public broadcast returns (address addr_, address ownerAddr_) {
        ownerAddr_ = vm.parseTomlAddress(deployConfig, ".tokenA.owner_address");
        string memory name = vm.parseTomlString(deployConfig, ".tokenA.name");
        string memory symbol = vm.parseTomlString(deployConfig, ".tokenA.symbol");
        uint256 decimals = vm.parseTomlUint(deployConfig, ".tokenA.decimals");
        require(decimals <= type(uint8).max, "decimals exceeds uint8 range");
        bytes memory initCode = abi.encodePacked(
            type(L2NativeSuperchainERC20).creationCode, abi.encode(ownerAddr_, name, symbol, uint8(decimals))
        );
        address preComputedAddress = vm.computeCreate2Address(_implSalt(), keccak256(initCode));
        if (preComputedAddress.code.length > 0) {
            console.log(
                "L2NativeSuperchainERC20 already deployed at %s", preComputedAddress, "on chain id: ", block.chainid
            );
            addr_ = preComputedAddress;
        } else {
            addr_ = address(new L2NativeSuperchainERC20{salt: _implSalt()}(ownerAddr_, name, symbol, uint8(decimals)));
            console.log("Deployed L2NativeSuperchainERC20 at address: ", addr_, "on chain id: ", block.chainid);
        }
    }

    function deployTokenB() public broadcast returns (address addr_, address ownerAddr_) {
        ownerAddr_ = vm.parseTomlAddress(deployConfig, ".tokenB.owner_address");
        string memory name = vm.parseTomlString(deployConfig, ".tokenB.name");
        string memory symbol = vm.parseTomlString(deployConfig, ".tokenB.symbol");
        uint256 decimals = vm.parseTomlUint(deployConfig, ".tokenB.decimals");
        require(decimals <= type(uint8).max, "decimals exceeds uint8 range");
        bytes memory initCode = abi.encodePacked(
            type(L2NativeSuperchainERC20).creationCode, abi.encode(ownerAddr_, name, symbol, uint8(decimals))
        );
        address preComputedAddress = vm.computeCreate2Address(_implSalt(), keccak256(initCode));
        if (preComputedAddress.code.length > 0) {
            console.log(
                "L2NativeSuperchainERC20 already deployed at %s", preComputedAddress, "on chain id: ", block.chainid
            );
            addr_ = preComputedAddress;
        } else {
            addr_ = address(new L2NativeSuperchainERC20{salt: _implSalt()}(ownerAddr_, name, symbol, uint8(decimals)));
            console.log("Deployed L2NativeSuperchainERC20 at address: ", addr_, "on chain id: ", block.chainid);
        }
    }

    function deployPool() public broadcast returns (address addr_) {
        bytes memory initCode = abi.encodePacked(
            type(SuperPool).creationCode
        );

        address preComputedAddress = vm.computeCreate2Address(_implSalt(), keccak256(initCode));
        if (preComputedAddress.code.length > 0) {
            console.log(
                "SuperPool already deployed at %s", preComputedAddress, "on chain id: ", block.chainid
            );
            addr_ = preComputedAddress;
        } else {
            addr_ = address(new SuperPool{salt: _implSalt()}());
            console.log("Deployed SuperPool at address: ", addr_, "on chain id: ", block.chainid);
        }
    }

    function outputDeploymentResult(address deployedAddressA, address deployedAddressB, address ownerAddr, address poolAddress) public {
        console.log("Outputting deployment result");

        string memory obj = "result";
        vm.serializeAddress(obj, "token_a", deployedAddressA);
        vm.serializeAddress(obj, "token_b", deployedAddressB);
        vm.serializeAddress(obj, "pool", poolAddress);
        string memory jsonOutput = vm.serializeAddress(obj, "ownerAddress", ownerAddr);

        vm.writeJson(jsonOutput, "deployment.json");
    }

    /// @notice The CREATE2 salt to be used when deploying the token.
    function _implSalt() internal view returns (bytes32) {
        string memory salt = vm.parseTomlString(deployConfig, ".deploy_config.salt");
        return keccak256(abi.encodePacked(salt));
    }
}
