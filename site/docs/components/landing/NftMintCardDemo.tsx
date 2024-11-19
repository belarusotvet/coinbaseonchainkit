import { NFTMintCardDefault } from '@coinbase/onchainkit/nft';
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import type { ReactNode } from 'react';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import App from '../App.tsx';

export const nftMintCardDemoCode = `
  import { NFTMintCardDefault } from '@coinbase/onchainkit/nft';

  function NftMintCardDemo() {
    return (
      <NFTMintCardDefault
        contractAddress="0xed2f34043387783b2727ff2799a46ce3ae1a34d2"
        tokenId="2"
      />
    )
  }
`;

export default function NftMintCardDemo() {
  return (
    <App>
      <NFTMintCardDefault
        contractAddress="0xed2f34043387783b2727ff2799a46ce3ae1a34d2"
        tokenId="2"
      />
    </App>
  );
}
