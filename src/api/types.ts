import type { Address } from 'viem';
import type { SwapQuote } from '../swap/types';
import type { Token } from '../token/types';

export type AddressOrETH = Address | 'ETH';

/**
 * Note: exported as public Type
 */
export type APIError = {
  code: string; // The Error code
  error: string; // The Error long message
  message: string; // The Error short message
};

/**
 * Note: exported as public Type
 */
export type BuildSwapTransactionParams = GetSwapQuoteParams & {
  fromAddress: Address; // The address of the user
};

export type GetAPIParamsForToken =
  | GetSwapQuoteParams
  | BuildSwapTransactionParams;

export type GetQuoteAPIParams = {
  amount: string; // The amount to be swapped
  amountReference?: string; // The reference amount for the swap
  from: AddressOrETH | ''; // The source address or 'ETH' for Ethereum
  to: AddressOrETH | ''; // The destination address or 'ETH' for Ethereum
  v2Enabled?: boolean; // Whether to use V2 of the API (default: false)
  slippagePercentage?: string; // The slippage percentage for the swap
};

export type GetSwapAPIParams = GetQuoteAPIParams & {
  fromAddress: Address; // The address of the user
};

/**
 * Note: exported as public Type
 */
export type GetSwapQuoteParams = {
  amount: string; // The amount to be swapped
  amountReference?: string; // The reference amount for the swap
  from: Token; // The source token for the swap
  isAmountInDecimals?: boolean; // Whether the amount is in decimals
  maxSlippage?: string; // The slippage of the swap
  to: Token; // The destination token for the swap
  useAggregator: boolean; // Whether to use a DEX aggregator
};

/**
 * Note: exported as public Type
 */
export type GetSwapQuoteResponse = SwapQuote | APIError;

/**
 * Note: exported as public Type
 */
export type GetTokensOptions = {
  limit?: string; // The maximum number of tokens to return (default: 50)
  search?: string; // A string to search for in the token name, symbol or address
  page?: string; // The page number to return (default: 1)
};

/**
 * Note: exported as public Type
 */
export type GetTokensResponse = Token[] | APIError;

export type RawTransactionData = {
  data: string; // The transaction data
  from: string; // The sender address
  gas: string; // The gas limit
  gasPrice: string; // The gas price
  to: string; // The recipient address
  value: string; // The value of the transaction
};

export type SwapAPIParams = GetQuoteAPIParams | GetSwapAPIParams;

/**
 * Note: exported as public Type
 */
export type BuildPayTransactionParams = {
  address: Address; // The address of the wallet paying
  chainId: number; // The Chain ID of the payment Network (only Base is supported)
  chargeId: string; // The ID of the Commerce Charge to be paid
};

export type HydrateChargeAPIParams = {
  sender: Address; // The address of the wallet paying
  chainId: number; // The Chain ID of the payment Network (only Base is supported)
  chargeId: string; // The ID of the Commerce Charge to be paid
};

export type PayTransaction = {
  id: string; // The id of the Commerce Charge to be paid
  callData: {
    // Collection of fields used to make the contract call to the Payment contract
    deadline: string; // Timestamp of when the payment will expire and be unpayable
    feeAmount: string; // The amount of the processing fee in the recipient currency
    id: string; // The id of the prepared transaction
    operator: Address; // The address of the operator of the Payment contract
    prefix: Address; // The prefix of the signature generated by Commerce
    recipient: Address; // The address funds will settle in
    recipientAmount: string; // The amount the recipient will get in the recipient currency
    recipientCurrency: Address; // The address of the currency being paid (always USDC)
    refundDestination: Address; // The wallet address of the payer
    signature: Address; // The signature generated by the Payment contract operator, encoding the payment details
  };
  metaData: {
    // Collection of metadata needed to make the contract call to the Payment Contract
    chainId: number; // The chain this prepared transaction can be paid on
    contractAddress: Address; // The address of the Payment contract
    sender: Address; // The wallet address of the payer
    settlementCurrencyAddress: Address; // The address of the currency being paid (always USDC)
  };
};

/**
 * Note: exported as public Type
 */
export type BuildPayTransactionResponse = PayTransaction | APIError;
