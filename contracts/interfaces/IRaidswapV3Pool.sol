// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import './pool/IRaidswapV3PoolImmutables.sol';
import './pool/IRaidswapV3PoolState.sol';
import './pool/IRaidswapV3PoolDerivedState.sol';
import './pool/IRaidswapV3PoolActions.sol';
import './pool/IRaidswapV3PoolOwnerActions.sol';
import './pool/IRaidswapV3PoolEvents.sol';

/// @title The interface for a Raidswap V3 Pool
/// @notice A Raidswap pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface IRaidswapV3Pool is
    IRaidswapV3PoolImmutables,
    IRaidswapV3PoolState,
    IRaidswapV3PoolDerivedState,
    IRaidswapV3PoolActions,
    IRaidswapV3PoolOwnerActions,
    IRaidswapV3PoolEvents
{

}
