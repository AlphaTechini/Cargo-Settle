// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICargoSettleEscrow {
    function getObligation(bytes32 obligationId)
        external
        view
        returns (
            bytes32 shipmentId,
            address recipient,
            address token,
            uint256 amount,
            bytes32 milestoneId,
            uint64 dueAt,
            bool financingEligible,
            bool released
        );

    function releaseObligationTo(bytes32 obligationId, address recipient) external returns (uint256 amount);
}
