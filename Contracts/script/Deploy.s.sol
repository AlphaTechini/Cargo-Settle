// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";

import {CargoSettleEarlyPayment} from "../src/CargoSettleEarlyPayment.sol";
import {CargoSettleEscrow} from "../src/CargoSettleEscrow.sol";

contract Deploy is Script {
    function run() external returns (CargoSettleEscrow escrow, CargoSettleEarlyPayment earlyPayment) {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.envAddress("ADMIN_ADDRESS");
        address operator = vm.envAddress("OPERATOR_ADDRESS");
        address usdc = vm.envAddress("USDC_ADDRESS");
        address eurc = vm.envAddress("EURC_ADDRESS");

        require(admin == vm.addr(privateKey), "ADMIN_ADDRESS must match PRIVATE_KEY address");

        vm.startBroadcast(privateKey);

        escrow = new CargoSettleEscrow(admin, operator, usdc, eurc);
        earlyPayment = new CargoSettleEarlyPayment(admin, operator, address(escrow));
        escrow.grantRole(escrow.SETTLEMENT_ROLE(), address(earlyPayment));

        vm.stopBroadcast();
    }
}
