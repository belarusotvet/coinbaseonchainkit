import type { Address, Chain } from 'viem';
import { useAttestation } from '../hooks/useAttestation';
import { Badge } from './Badge';

type WithAvatarBadgeInnerProps = {
  children: React.ReactNode;
  address: Address;
  chain?: Chain;
};

function WithAvatarBadgeInner({ children, address, chain }: WithAvatarBadgeInnerProps) {
  const attested = useAttestation({ address, chain });

  return (
    <div style={{ position: 'relative', width: '32px', height: '32px' }} data-testid="inner">
      {children}
      {attested === 'eas' && (
        <div
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            background: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '15px',
            height: '15px',
            borderRadius: '9999px',
          }}
        >
          <div
            style={{
              width: '11px',
              height: '11px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Badge />
          </div>
        </div>
      )}
    </div>
  );
}

type WithAvatarBadgeProps = {
  children: React.ReactNode;
  showAttestation: boolean;
  address: Address;
  chain?: Chain;
};

export function WithAvatarBadge({
  children,
  showAttestation,
  address,
  chain,
}: WithAvatarBadgeProps) {
  if (!showAttestation) return children;

  return (
    <WithAvatarBadgeInner address={address} chain={chain}>
      {children}
    </WithAvatarBadgeInner>
  );
}
