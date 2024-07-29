import type { SwapError } from '../types';
import { fromReadableAmount } from './fromReadableAmount';
import { toReadableAmount } from './toReadableAmount';

/**
 * Formats an amount according to the decimals. Defaults to 18 decimals for ERC-20s.
 */
export function formatDecimals(
  amount: string,
  inputInDecimals = true,
  decimals = 18,
): string | SwapError {
  // Input validation
  if (typeof amount !== 'string' || amount.trim() === '') {
    return {
      code: 'INVALID_INPUT',
      error: 'Invalid input: amount must be a non-empty string',
    };
  }
  if (!Number.isInteger(decimals) || decimals < 0) {
    return {
      code: 'INVALID_INPUT',
      error: 'Invalid input: decimals must be a non-negative integer',
    };
  }
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(amount)) {
    return {
      code: 'INVALID_INPUT',
      error: 'Invalid input: amount must be a number',
    };
  }

  let result: string;

  if (inputInDecimals) {
    // If input is already in decimals, convert to readable amount
    result = toReadableAmount(amount, decimals);
  } else {
    // If input is not in decimals, convert from readable amount
    result = fromReadableAmount(amount, decimals);
  }

  return result;
}
