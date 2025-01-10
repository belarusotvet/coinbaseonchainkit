import { Spinner } from '@/internal/components/Spinner';
import { border, cn, color, pressable, text } from '@/styles/theme';
import { Avatar, Badge, Name } from '@/ui/react/identity';
import { useWalletIslandContext } from '@/wallet/components/WalletIslandProvider';
import { useCallback, useState } from 'react';
import { useWalletContext } from './WalletProvider';

export function WalletIslandAddressDetails() {
  const { address, chain, isClosing } = useWalletContext();
  const { animations } = useWalletIslandContext();
  const [copyText, setCopyText] = useState('Copy');

  const handleCopyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address ?? '');
      setCopyText('Copied');
      setTimeout(() => setCopyText('Copy'), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
      setCopyText('Failed to copy');
      setTimeout(() => setCopyText('Copy'), 2000);
    }
  }, [address]);

  if (isClosing || !chain) {
    return <div className="mt-1 h-28 w-10" />; // Prevent layout shift
  }

  return (
    <div
      className={cn(
        'mt-2 flex flex-col items-center justify-center',
        color.foreground,
        text.body,
        animations.content,
      )}
    >
      <div className="h-10 w-10">
        <Avatar address={address} chain={chain}>
          <Badge />
        </Avatar>
      </div>
      <div className="group relative mt-2 text-base">
        <button
          type="button"
          onClick={handleCopyAddress}
          data-testid="ockWalletIsland_NameButton"
        >
          <Name
            address={address}
            chain={chain}
            className="hover:text-[var(--ock-text-foreground-muted)] active:text-[var(--ock-text-primary)]"
          />
        </button>
        <button
          type="button"
          onClick={handleCopyAddress}
          className={cn(
            pressable.alternate,
            text.legal,
            color.foreground,
            border.default,
            border.radius,
            'absolute top-full right-0 z-10 mt-0.5 px-1.5 py-0.5 opacity-0 transition-opacity group-hover:opacity-100',
          )}
          aria-live="polite"
          data-testid="ockWalletIsland_NameTooltip"
        >
          {copyText}
        </button>
      </div>
      <AddressBalanceInFiat />
    </div>
  );
}

function AddressBalanceInFiat() {
  const { portfolioFiatValue, isFetchingPortfolioData } =
    useWalletIslandContext();

  const formattedValueInFiat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(portfolioFiatValue));

  if (isFetchingPortfolioData) {
    return (
      <div className="mt-1 h-8 w-full">
        <Spinner />
      </div>
    );
  }

  if (portfolioFiatValue === null || portfolioFiatValue === undefined) {
    return null;
  }

  return (
    <div
      className={cn(text.title1, 'mt-1 font-normal')}
      data-testid="ockWalletIsland_AddressBalance"
    >
      {formattedValueInFiat}
    </div>
  );
}
