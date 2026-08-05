// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ICargoSettleEscrow} from "./interfaces/ICargoSettleEscrow.sol";

contract CargoSettleEscrow is AccessControl, Pausable, ReentrancyGuard, ICargoSettleEscrow {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant SETTLEMENT_ROLE = keccak256("SETTLEMENT_ROLE");

    error InvalidAddress();
    error InvalidId();
    error ShipmentExists(bytes32 shipmentId);
    error ShipmentNotFound(bytes32 shipmentId);
    error ShipmentIsCancelled(bytes32 shipmentId);
    error ShipmentAlreadyCompleted(bytes32 shipmentId);
    error NotShipmentParty(bytes32 shipmentId, address caller);
    error UnauthorizedShipmentOperator(bytes32 shipmentId, address caller);
    error MilestoneExists(bytes32 shipmentId, bytes32 milestoneId);
    error MilestoneNotFound(bytes32 shipmentId, bytes32 milestoneId);
    error MilestoneIncomplete(bytes32 shipmentId, bytes32 milestoneId);
    error ObligationExists(bytes32 obligationId);
    error ObligationNotFound(bytes32 obligationId);
    error ObligationAlreadyReleased(bytes32 obligationId);
    error TokenNotAllowed(address token);
    error InvalidAmount();
    error InsufficientShipmentBalance(bytes32 shipmentId, address token, uint256 available, uint256 required);
    error OutstandingObligations(bytes32 shipmentId, uint256 count);
    error RefundUnavailable(bytes32 shipmentId);

    struct Shipment {
        address shipper;
        address forwarder;
        uint64 createdAt;
        uint256 outstandingObligations;
        bool exists;
        bool cancelled;
        bool completed;
    }

    struct Milestone {
        bool exists;
        bool completed;
        uint64 completedAt;
        bytes32 evidenceHash;
    }

    struct Obligation {
        bytes32 shipmentId;
        address recipient;
        address token;
        uint256 amount;
        bytes32 milestoneId;
        uint64 dueAt;
        bool financingEligible;
        bool released;
    }

    mapping(bytes32 shipmentId => Shipment shipment) private _shipments;
    mapping(bytes32 shipmentId => mapping(bytes32 milestoneId => Milestone milestone)) private _milestones;
    mapping(bytes32 obligationId => Obligation obligation) private _obligations;
    mapping(bytes32 shipmentId => mapping(address token => uint256 balance)) public shipmentBalances;
    mapping(address token => bool allowed) public allowedTokens;

    event TokenAllowlistUpdated(address indexed token, bool allowed);
    event ShipmentCreated(bytes32 indexed shipmentId, address indexed shipper, address indexed forwarder);
    event ShipmentFunded(bytes32 indexed shipmentId, address indexed funder, address indexed token, uint256 amount);
    event MilestoneCreated(bytes32 indexed shipmentId, bytes32 indexed milestoneId);
    event MilestoneCompleted(bytes32 indexed shipmentId, bytes32 indexed milestoneId, bytes32 evidenceHash);
    event ObligationCreated(
        bytes32 indexed obligationId,
        bytes32 indexed shipmentId,
        address indexed recipient,
        address token,
        uint256 amount,
        bytes32 milestoneId,
        uint64 dueAt,
        bool financingEligible
    );
    event ObligationReleased(
        bytes32 indexed obligationId,
        bytes32 indexed shipmentId,
        address indexed recipient,
        address token,
        uint256 amount
    );
    event ShipmentCompleted(bytes32 indexed shipmentId);
    event ShipmentCancelled(bytes32 indexed shipmentId);
    event ShipmentRefunded(
        bytes32 indexed shipmentId, address indexed recipient, address indexed token, uint256 amount
    );

    constructor(address admin, address operator, address usdc, address eurc) {
        if (admin == address(0) || operator == address(0) || usdc == address(0)) revert InvalidAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, operator);
        _grantRole(SETTLEMENT_ROLE, operator);

        allowedTokens[usdc] = true;
        emit TokenAllowlistUpdated(usdc, true);

        if (eurc != address(0)) {
            allowedTokens[eurc] = true;
            emit TokenAllowlistUpdated(eurc, true);
        }
    }

    function setAllowedToken(address token, bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) revert InvalidAddress();
        allowedTokens[token] = allowed;
        emit TokenAllowlistUpdated(token, allowed);
    }

    function createShipment(bytes32 shipmentId, address shipper, address forwarder)
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
    {
        if (shipmentId == bytes32(0)) revert InvalidId();
        if (shipper == address(0) || forwarder == address(0)) revert InvalidAddress();
        if (_shipments[shipmentId].exists) revert ShipmentExists(shipmentId);

        _shipments[shipmentId] = Shipment({
            shipper: shipper,
            forwarder: forwarder,
            createdAt: uint64(block.timestamp),
            outstandingObligations: 0,
            exists: true,
            cancelled: false,
            completed: false
        });

        emit ShipmentCreated(shipmentId, shipper, forwarder);
    }

    function createMilestone(bytes32 shipmentId, bytes32 milestoneId) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        _requireActiveShipment(shipmentId);
        if (milestoneId == bytes32(0)) revert InvalidId();
        if (_milestones[shipmentId][milestoneId].exists) revert MilestoneExists(shipmentId, milestoneId);

        _milestones[shipmentId][milestoneId] =
            Milestone({exists: true, completed: false, completedAt: 0, evidenceHash: bytes32(0)});

        emit MilestoneCreated(shipmentId, milestoneId);
    }

    function addObligation(
        bytes32 obligationId,
        bytes32 shipmentId,
        address recipient,
        address token,
        uint256 amount,
        bytes32 milestoneId,
        uint64 dueAt,
        bool financingEligible
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        _requireActiveShipment(shipmentId);
        if (obligationId == bytes32(0) || recipient == address(0) || milestoneId == bytes32(0)) revert InvalidId();
        if (token == address(0) || !allowedTokens[token]) revert TokenNotAllowed(token);
        if (amount == 0) revert InvalidAmount();
        if (_obligations[obligationId].shipmentId != bytes32(0)) revert ObligationExists(obligationId);
        if (!_milestones[shipmentId][milestoneId].exists) revert MilestoneNotFound(shipmentId, milestoneId);

        _obligations[obligationId] = Obligation({
            shipmentId: shipmentId,
            recipient: recipient,
            token: token,
            amount: amount,
            milestoneId: milestoneId,
            dueAt: dueAt,
            financingEligible: financingEligible,
            released: false
        });
        _shipments[shipmentId].outstandingObligations += 1;

        emit ObligationCreated(
            obligationId, shipmentId, recipient, token, amount, milestoneId, dueAt, financingEligible
        );
    }

    function fundShipment(bytes32 shipmentId, address token, uint256 amount) external whenNotPaused nonReentrant {
        Shipment storage shipment = _requireActiveShipment(shipmentId);
        if (msg.sender != shipment.shipper && msg.sender != shipment.forwarder) {
            revert NotShipmentParty(shipmentId, msg.sender);
        }
        if (token == address(0) || !allowedTokens[token]) revert TokenNotAllowed(token);
        if (amount == 0) revert InvalidAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        shipmentBalances[shipmentId][token] += amount;
        emit ShipmentFunded(shipmentId, msg.sender, token, amount);
    }

    function completeMilestone(bytes32 shipmentId, bytes32 milestoneId, bytes32 evidenceHash)
        external
        onlyShipmentOperator(shipmentId)
        whenNotPaused
    {
        Shipment storage shipment = _shipments[shipmentId];
        if (shipment.cancelled) revert ShipmentIsCancelled(shipmentId);
        if (shipment.completed) revert ShipmentAlreadyCompleted(shipmentId);

        Milestone storage milestone = _milestones[shipmentId][milestoneId];
        if (!milestone.exists) revert MilestoneNotFound(shipmentId, milestoneId);
        if (milestone.completed) return;

        milestone.completed = true;
        milestone.completedAt = uint64(block.timestamp);
        milestone.evidenceHash = evidenceHash;
        emit MilestoneCompleted(shipmentId, milestoneId, evidenceHash);
    }

    function releaseObligation(bytes32 obligationId) external whenNotPaused nonReentrant returns (uint256 amount) {
        return _releaseObligation(obligationId, _obligations[obligationId].recipient);
    }

    function releaseBatch(bytes32[] calldata obligationIds) external whenNotPaused nonReentrant {
        if (obligationIds.length == 0) revert InvalidId();
        for (uint256 index = 0; index < obligationIds.length; index++) {
            bytes32 obligationId = obligationIds[index];
            _releaseObligation(obligationId, _obligations[obligationId].recipient);
        }
    }

    function releaseObligationTo(bytes32 obligationId, address recipient)
        external
        onlyRole(SETTLEMENT_ROLE)
        whenNotPaused
        nonReentrant
        returns (uint256 amount)
    {
        if (recipient == address(0)) revert InvalidAddress();
        return _releaseObligation(obligationId, recipient);
    }

    function completeShipment(bytes32 shipmentId) external onlyShipmentOperator(shipmentId) whenNotPaused {
        Shipment storage shipment = _shipments[shipmentId];
        if (shipment.cancelled) revert ShipmentIsCancelled(shipmentId);
        if (shipment.outstandingObligations != 0) {
            revert OutstandingObligations(shipmentId, shipment.outstandingObligations);
        }
        if (shipment.completed) revert ShipmentAlreadyCompleted(shipmentId);

        shipment.completed = true;
        emit ShipmentCompleted(shipmentId);
    }

    function cancelShipment(bytes32 shipmentId) external onlyShipmentOperator(shipmentId) whenNotPaused {
        Shipment storage shipment = _shipments[shipmentId];
        if (shipment.completed) revert ShipmentAlreadyCompleted(shipmentId);
        if (shipment.cancelled) revert ShipmentIsCancelled(shipmentId);

        shipment.cancelled = true;
        emit ShipmentCancelled(shipmentId);
    }

    function refundRemaining(bytes32 shipmentId, address token, address recipient) external whenNotPaused nonReentrant {
        Shipment storage shipment = _requireShipment(shipmentId);
        if (msg.sender != shipment.shipper && msg.sender != shipment.forwarder) {
            revert NotShipmentParty(shipmentId, msg.sender);
        }
        if (recipient == address(0)) revert InvalidAddress();
        if (!shipment.cancelled && !shipment.completed) revert RefundUnavailable(shipmentId);

        uint256 amount = shipmentBalances[shipmentId][token];
        if (amount == 0) revert InvalidAmount();
        shipmentBalances[shipmentId][token] = 0;
        IERC20(token).safeTransfer(recipient, amount);

        emit ShipmentRefunded(shipmentId, recipient, token, amount);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function getShipment(bytes32 shipmentId) external view returns (Shipment memory) {
        return _requireShipment(shipmentId);
    }

    function getMilestone(bytes32 shipmentId, bytes32 milestoneId) external view returns (Milestone memory) {
        Milestone memory milestone = _milestones[shipmentId][milestoneId];
        if (!milestone.exists) revert MilestoneNotFound(shipmentId, milestoneId);
        return milestone;
    }

    function getObligation(bytes32 obligationId)
        external
        view
        override
        returns (
            bytes32 shipmentId,
            address recipient,
            address token,
            uint256 amount,
            bytes32 milestoneId,
            uint64 dueAt,
            bool financingEligible,
            bool released
        )
    {
        Obligation memory obligation = _obligations[obligationId];
        if (obligation.shipmentId == bytes32(0)) revert ObligationNotFound(obligationId);
        return (
            obligation.shipmentId,
            obligation.recipient,
            obligation.token,
            obligation.amount,
            obligation.milestoneId,
            obligation.dueAt,
            obligation.financingEligible,
            obligation.released
        );
    }

    function isMilestoneCompleted(bytes32 shipmentId, bytes32 milestoneId) external view returns (bool) {
        return _milestones[shipmentId][milestoneId].completed;
    }

    function _releaseObligation(bytes32 obligationId, address recipient) internal returns (uint256 amount) {
        Obligation storage obligation = _obligations[obligationId];
        if (obligation.shipmentId == bytes32(0)) revert ObligationNotFound(obligationId);
        if (obligation.released) revert ObligationAlreadyReleased(obligationId);

        Shipment storage shipment = _shipments[obligation.shipmentId];
        if (shipment.cancelled) revert ShipmentIsCancelled(obligation.shipmentId);
        if (!_milestones[obligation.shipmentId][obligation.milestoneId].completed) {
            revert MilestoneIncomplete(obligation.shipmentId, obligation.milestoneId);
        }

        uint256 available = shipmentBalances[obligation.shipmentId][obligation.token];
        if (available < obligation.amount) {
            revert InsufficientShipmentBalance(obligation.shipmentId, obligation.token, available, obligation.amount);
        }

        obligation.released = true;
        shipmentBalances[obligation.shipmentId][obligation.token] = available - obligation.amount;
        shipment.outstandingObligations -= 1;
        IERC20(obligation.token).safeTransfer(recipient, obligation.amount);

        emit ObligationReleased(obligationId, obligation.shipmentId, recipient, obligation.token, obligation.amount);
        return obligation.amount;
    }

    function _requireShipment(bytes32 shipmentId) internal view returns (Shipment storage shipment) {
        shipment = _shipments[shipmentId];
        if (!shipment.exists) revert ShipmentNotFound(shipmentId);
    }

    function _requireActiveShipment(bytes32 shipmentId) internal view returns (Shipment storage shipment) {
        shipment = _requireShipment(shipmentId);
        if (shipment.cancelled) revert ShipmentIsCancelled(shipmentId);
        if (shipment.completed) revert ShipmentAlreadyCompleted(shipmentId);
    }

    modifier onlyShipmentOperator(bytes32 shipmentId) {
        Shipment storage shipment = _requireShipment(shipmentId);
        if (msg.sender != shipment.forwarder && !hasRole(OPERATOR_ROLE, msg.sender)) {
            revert UnauthorizedShipmentOperator(shipmentId, msg.sender);
        }
        _;
    }
}
