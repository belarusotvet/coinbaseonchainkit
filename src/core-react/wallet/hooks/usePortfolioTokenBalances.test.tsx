import { getPortfolioTokenBalances } from '@/core/api/getPortfolioTokenBalances';
import type {
  PortfolioAPIResponse,
  PortfolioTokenBalanceAPIResponse,
  PortfolioTokenBalances,
  PortfolioTokenWithFiatValue,
} from '@/core/api/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePortfolioTokenBalances } from './usePortfolioTokenBalances';

vi.mock('@/core/api/getPortfolioTokenBalances');

const mockAddress: `0x${string}` = '0x123';
const mockTokensAPIResponse: PortfolioTokenBalanceAPIResponse[] = [
  {
    address: '0x123',
    chain_id: 8453,
    decimals: 6,
    image: '',
    name: 'Token',
    symbol: 'TOKEN',
    crypto_balance: 100,
    fiat_balance: 100,
  },
];
const mockPortfolioTokenBalancesAPIResponse: PortfolioAPIResponse[] = [
  {
    address: mockAddress,
    portfolio_balance_usd: 100,
    token_balances: mockTokensAPIResponse,
  },
];
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
const mockPortfolioTokenBalances: PortfolioTokenBalances = {
  address: mockAddress,
  portfolioBalanceUsd: 100,
  tokenBalances: mockTokens,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePortfolioTokenBalances', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch token balances successfully', async () => {
    vi.mocked(getPortfolioTokenBalances).mockResolvedValueOnce({
      portfolios: mockPortfolioTokenBalancesAPIResponse,
    });

    const { result } = renderHook(
      () => usePortfolioTokenBalances({ address: mockAddress }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getPortfolioTokenBalances).toHaveBeenCalledWith({
      addresses: [mockAddress],
    });

    expect(result.current.data).toEqual(mockPortfolioTokenBalances);
  });

  it('should transform the address for ETH to an empty string', async () => {
    const mockTokensAPIResponseWithEth: PortfolioTokenBalanceAPIResponse[] = [
      {
        address: 'native',
        chain_id: 8453,
        decimals: 6,
        image: '',
        name: 'Ethereum',
        symbol: 'ETH',
        crypto_balance: 100,
        fiat_balance: 100,
      },
    ];
    const mockPortfolioTokenBalancesAPIResponseWithEth: PortfolioAPIResponse[] =
      [
        {
          address: mockAddress,
          portfolio_balance_usd: 100,
          token_balances: mockTokensAPIResponseWithEth,
        },
      ];

    vi.mocked(getPortfolioTokenBalances).mockResolvedValueOnce({
      portfolios: mockPortfolioTokenBalancesAPIResponseWithEth,
    });

    const { result } = renderHook(
      () => usePortfolioTokenBalances({ address: mockAddress }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getPortfolioTokenBalances).toHaveBeenCalledWith({
      addresses: [mockAddress],
    });

    const mockTokensWithEth: PortfolioTokenWithFiatValue[] = [
      {
        address: '',
        chainId: 8453,
        decimals: 6,
        image: '',
        name: 'Ethereum',
        symbol: 'ETH',
        cryptoBalance: 100,
        fiatBalance: 100,
      },
    ];
    const mockPortfolioTokenBalancesWithEth: PortfolioTokenBalances = {
      address: mockAddress,
      portfolioBalanceUsd: 100,
      tokenBalances: mockTokensWithEth,
    };
    expect(result.current.data).toEqual(mockPortfolioTokenBalancesWithEth);
  });

  it('should handle API errors', async () => {
    vi.mocked(getPortfolioTokenBalances).mockResolvedValueOnce({
      code: 'API Error',
      error: 'API Error',
      message: 'API Error',
    });

    const { result } = renderHook(
      () => usePortfolioTokenBalances({ address: mockAddress }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('API Error');
  });

  it('should not fetch when address is empty', () => {
    renderHook(
      () => usePortfolioTokenBalances({ address: '' as `0x${string}` }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(getPortfolioTokenBalances).not.toHaveBeenCalled();
  });

  it('should not fetch when address is undefined', () => {
    renderHook(() => usePortfolioTokenBalances({ address: undefined }), {
      wrapper: createWrapper(),
    });

    expect(getPortfolioTokenBalances).not.toHaveBeenCalled();
  });

  it('should return empty data when portfolios is empty', async () => {
    vi.mocked(getPortfolioTokenBalances).mockResolvedValueOnce({
      portfolios: [],
    });

    const { result } = renderHook(
      () => usePortfolioTokenBalances({ address: mockAddress }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      address: '0x123',
      portfolioBalanceUsd: 0,
      tokenBalances: [],
    });
  });
});
