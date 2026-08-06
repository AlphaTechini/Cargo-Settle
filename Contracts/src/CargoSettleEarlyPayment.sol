// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ICargoSettleEscrow} from "./interfaces/ICargoSettleEscrow.sol";

contract CargoSettleEarlyPayment is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant FINANCIER_ROLE = keccak256("FINANCIER_ROLE");

    error InvalidAddress();
    error InvalidId();
    error RequestExists(bytes32 requestId);
    error RequestNotFound(bytes32 requestId);
    error InvalidRequestState(bytes32 requestId);
    error NotRequestParty(bytes32 requestId, address caller);
    error FinancingUnavailable(bytes32 obligationId);
    error InvalidAmount();
    error InvalidRepaymentAmount();
    error FinancierNotAllowed(address financier);

    struct EarlyPaymentRequest {
        bytes32 obligationId;
        address partner;
        address financier;
        address token;
        uint256 advanceAmount;
        uint256 repaymentAmount;
        bool approved;
        bool funded;
        bool advanceClaimed;
        bool settled;
        bool cancelled;
    }

    ICargoSettleEscrow public immutable escrow;
    mapping(bytes32 requestId => EarlyPaymentRequest request) private _requests;
    mapping(bytes32 obligationId => bytes32 requestId) public requestByObligation;

    event EarlyPaymentRequested(
        bytes32 indexed requestId,
        bytes32 indexed obligationId,
        address indexed partner,
        address financier,
        uint256 advanceAmount,
        uint256 repaymentAmount
    );
    event EarlyPaymentApproved(bytes32 indexed requestId, address indexed financier);
    event EarlyPaymentFunded(bytes32 indexed requestId, address indexed financier, uint256 amount);
    event EarlyPaymentClaimed(bytes32 indexed requestId, address indexed partner, uint256 amount);
    event EarlyPaymentSettled(bytes32 indexed requestId, address indexed financier, uint256 repaymentAmount);
    event EarlyPaymentCancelled(bytes32 indexed requestId, address indexed financier, uint256 refundAmount);

    constructor(address admin, address escrowAddress) {
        if (admin == address(0) || escrowAddress == address(0)) revert InvalidAddress();

        escrow = ICargoSettleEscrow(escrowAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function grantFinancier(address financier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (financier == address(0)) revert InvalidAddress();
        _grantRole(FINANCIER_ROLE, financier);
    }

    function revokeFinancier(address financier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(FINANCIER_ROLE, financier);
    }

    function requestEarlyPayment(
        bytes32 requestId,
        bytes32 obligationId,
        address financier,
        uint256 advanceAmount,
        uint256 repaymentAmount
    ) external whenNotPaused {
        if (requestId == bytes32(0)) revert InvalidId();
        if (_requests[requestId].obligationId != bytes32(0)) revert RequestExists(requestId);
        if (requestByObligation[obligationId] != bytes32(0)) revert InvalidRequestState(requestId);
        if (!hasRole(FINANCIER_ROLE, financier)) revert FinancierNotAllowed(financier);
        if (advanceAmount == 0) revert InvalidAmount();

        (, address recipient, address token, uint256 obligationAmount,,, bool financingEligible, bool released) =
            escrow.getObligation(obligationId);
        if (!financingEligible || released || recipient != msg.sender) revert FinancingUnavailable(obligationId);
        if (advanceAmount > obligationAmount) revert InvalidAmount();
        if (repaymentAmount < advanceAmount || repaymentAmount > obligationAmount) {
            revert InvalidRepaymentAmount();
        }

        _requests[requestId] = EarlyPaymentRequest({
            obligationId: obligationId,
            partner: msg.sender,
            financier: financier,
            token: token,
            advanceAmount: advanceAmount,
            repaymentAmount: repaymentAmount,
            approved: false,
            funded: false,
            advanceClaimed: false,
            settled: false,
            cancelled: false
        });
        requestByObligation[obligationId] = requestId;

        emit EarlyPaymentRequested(requestId, obligationId, msg.sender, financier, advanceAmount, repaymentAmount);
    }

    function approveRequest(bytes32 requestId) external whenNotPaused {
        EarlyPaymentRequest storage request = _requireRequest(requestId);
        if (request.financier != msg.sender || !hasRole(FINANCIER_ROLE, msg.sender)) {
            revert NotRequestParty(requestId, msg.sender);
        }
        if (request.cancelled || request.approved || request.settled) revert InvalidRequestState(requestId);

        request.approved = true;
        emit EarlyPaymentApproved(requestId, msg.sender);
    }

    function fundRequest(bytes32 requestId) external whenNotPaused nonReentrant {
        EarlyPaymentRequest storage request = _requireRequest(requestId);
        if (request.financier != msg.sender || !hasRole(FINANCIER_ROLE, msg.sender)) {
            revert NotRequestParty(requestId, msg.sender);
        }
        if (!request.approved || request.funded || request.cancelled || request.settled) {
            revert InvalidRequestState(requestId);
        }

        IERC20(request.token).safeTransferFrom(msg.sender, address(this), request.advanceAmount);
        request.funded = true;
        emit EarlyPaymentFunded(requestId, msg.sender, request.advanceAmount);
    }

    function claimAdvance(bytes32 requestId) external whenNotPaused nonReentrant {
        EarlyPaymentRequest storage request = _requireRequest(requestId);
        if (request.partner != msg.sender) revert NotRequestParty(requestId, msg.sender);
        if (!request.funded || request.advanceClaimed || request.cancelled || request.settled) {
            revert InvalidRequestState(requestId);
        }

        request.advanceClaimed = true;
        IERC20(request.token).safeTransfer(request.partner, request.advanceAmount);
        emit EarlyPaymentClaimed(requestId, request.partner, request.advanceAmount);
    }

    function settleRequest(bytes32 requestId) external whenNotPaused nonReentrant {
        EarlyPaymentRequest storage request = _requireRequest(requestId);
        if (msg.sender != request.financier) revert NotRequestParty(requestId, msg.sender);
        if (!request.funded || !request.advanceClaimed || request.settled || request.cancelled) {
            revert InvalidRequestState(requestId);
        }

        uint256 obligationAmount = escrow.releaseObligationTo(request.obligationId, address(this));
        if (obligationAmount < request.repaymentAmount) revert InvalidRepaymentAmount();

        request.settled = true;
        IERC20(request.token).safeTransfer(request.financier, request.repaymentAmount);
        uint256 remainder = obligationAmount - request.repaymentAmount;
        if (remainder > 0) IERC20(request.token).safeTransfer(request.partner, remainder);

        emit EarlyPaymentSettled(requestId, request.financier, request.repaymentAmount);
    }

    function cancelRequest(bytes32 requestId) external whenNotPaused nonReentrant {
        EarlyPaymentRequest storage request = _requireRequest(requestId);
        if (msg.sender != request.financier) revert NotRequestParty(requestId, msg.sender);
        if (request.advanceClaimed || request.settled || request.cancelled) revert InvalidRequestState(requestId);

        request.cancelled = true;
        requestByObligation[request.obligationId] = bytes32(0);
        uint256 refundAmount = request.funded ? request.advanceAmount : 0;
        if (refundAmount > 0) IERC20(request.token).safeTransfer(request.financier, refundAmount);
        emit EarlyPaymentCancelled(requestId, request.financier, refundAmount);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function getRequest(bytes32 requestId) external view returns (EarlyPaymentRequest memory) {
        return _requireRequest(requestId);
    }

    function _requireRequest(bytes32 requestId) internal view returns (EarlyPaymentRequest storage request) {
        request = _requests[requestId];
        if (request.obligationId == bytes32(0)) revert RequestNotFound(requestId);
    }
}
