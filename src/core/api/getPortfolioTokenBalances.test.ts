import type {
  PortfolioTokenBalances,
  PortfolioTokenWithFiatValue,
} from '@/core/api/types';
import type { Address } from 'viem';
import { type Mock, describe, expect, it, vi } from 'vitest';
import { CDP_GET_PORTFOLIO_TOKEN_BALANCES } from '../network/definitions/wallet';
import { sendRequest } from '../network/request';
import { getPortfolioTokenBalances } from './getPortfolioTokenBalances';

vi.mock('../network/request', () => ({
  sendRequest: vi.fn(),
}));

const mockAddresses: Address[] = ['0x0000000000000000000000000000000000000000'];
const mockTokens: PortfolioTokenWithFiatValue[] = [
  {
    address: '0x123',
    chainId: 8453,
    decimals: 6,
    image: '',
    name: 'Token',
    symbol: 'TOKEN',
    cryptoBalance: 100,
    fiatBalance: 100,
  },
];
const mockPortfolioTokenBalances: PortfolioTokenBalances[] = [
  {
    address: mockAddresses[0],
    portfolioBalanceInUsd: 100,
    tokenBalances: mockTokens,
  },
];

describe('getPortfolioTokenBalances', () => {
  const mockSendRequest = sendRequest as Mock;

  const mockSuccessResponse = {
    tokens: mockPortfolioTokenBalances,
  };

  it('should return token balances on successful request', async () => {
    mockSendRequest.mockResolvedValueOnce({
      result: mockSuccessResponse,
    });

    const result = await getPortfolioTokenBalances({
      addresses: mockAddresses,
    });

    expect(result).toEqual(mockSuccessResponse);
    expect(mockSendRequest).toHaveBeenCalledWith(
      CDP_GET_PORTFOLIO_TOKEN_BALANCES,
      [{ addresses: mockAddresses }],
    );
  });

  it('should handle API error response', async () => {
    const mockError = {
      code: 500,
      error: 'Internal Server Error',
      message: 'Internal Server Error',
    };

    mockSendRequest.mockResolvedValueOnce({
      error: mockError,
    });

    const result = await getPortfolioTokenBalances({
      addresses: mockAddresses,
    });

    expect(result).toEqual({
      code: '500',
      error: 'Error fetching portfolio token balances',
      message: 'Internal Server Error',
    });
  });

  it('should handle unexpected errors', async () => {
    const errorMessage = 'Network Error';
    mockSendRequest.mockRejectedValueOnce(new Error(errorMessage));

    const result = await getPortfolioTokenBalances({
      addresses: mockAddresses,
    });

    expect(result).toEqual({
      code: 'uncaught-portfolio',
      error: 'Something went wrong',
      message: `Error fetching portfolio token balances: Error: ${errorMessage}`,
    });
  });
});
