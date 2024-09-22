import { describe, expect, it, Mock, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAccount } from "wagmi";
import { useOnchainKit } from "../../useOnchainKit";
import { useCapabilitiesSafe } from "../../internal/hooks/useCapabilitiesSafe";
import { useIsWalletACoinbaseSmartWallet } from './useIsWalletACoinbaseSmartWallet';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}));

vi.mock('../../useOnchainKit', () => ({
  useOnchainKit: vi.fn(),
}));

vi.mock('../../internal/hooks/useCapabilitiesSafe', () => ({
  useCapabilitiesSafe: vi.fn(),
}));


describe('useIsWalletACoinbaseSmartWallet', () => {
  it('returns true if the wallet is a Coinbase Smart Wallet', () => {
    (useOnchainKit as Mock).mockReturnValue({ chain: { id: 'chainId' } });
    (useAccount as Mock).mockReturnValue({ connector: { id: 'coinbaseWalletSDK' } });
    (useCapabilitiesSafe as Mock).mockReturnValue({ atomicBatch: { supported: true } });

    const { result } = renderHook(() => useIsWalletACoinbaseSmartWallet());

    expect(result.current).toBe(true);
  });

  it('returns false if the wallet is a non-smart Coinbase Wallet', () => {
    (useOnchainKit as Mock).mockReturnValue({ chain: { id: 'chainId' } });
    (useAccount as Mock).mockReturnValue({ connector: { id: 'coinbaseWalletSDK' } });
    (useCapabilitiesSafe as Mock).mockReturnValue({});

    const { result } = renderHook(() => useIsWalletACoinbaseSmartWallet());

    expect(result.current).toBe(false);
  });

  it('returns true if the wallet is a Coinbase Smart Wallet', () => {
    (useOnchainKit as Mock).mockReturnValue({ chain: { id: 'chainId' } });
    (useAccount as Mock).mockReturnValue({ connector: { id: 'someOtherId' } });
    (useCapabilitiesSafe as Mock).mockReturnValue({ atomicBatch: { supported: true } });

    const { result } = renderHook(() => useIsWalletACoinbaseSmartWallet());

    expect(result.current).toBe(false);
  });
});
