import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAddressTokenHoldings } from '../../../core-react/internal/hooks/useAddressTokenHoldings';
import { useValue } from '../../../core-react/internal/hooks/useValue';
import type { TokenBalanceWithFiatValue } from './WalletIslandTokenHoldings';
import { useWalletContext } from '../WalletProvider';

export type WalletIslandContextType = {
  showSwap: boolean;
  setShowSwap: Dispatch<SetStateAction<boolean>>;
  isSwapClosing: boolean;
  setIsSwapClosing: Dispatch<SetStateAction<boolean>>;
  showQr: boolean;
  setShowQr: Dispatch<SetStateAction<boolean>>;
  isQrClosing: boolean;
  setIsQrClosing: Dispatch<SetStateAction<boolean>>;
  tokenHoldings: TokenBalanceWithFiatValue[];
  animationClasses: WalletIslandAnimations;
  setHasContentEntered: Dispatch<SetStateAction<boolean>>;
};

type WalletIslandAnimations = {
  content: `animate-${string}` | '';
  qr: `animate-${string}`;
  swap: `animate-${string}`;
  walletActions: `animate-${string}`;
  addressDetails: `animate-${string}`;
  transactionActions: `animate-${string}`;
  tokenHoldings: `animate-${string}`;
};

type WalletIslandProviderReact = {
  children: ReactNode;
};

const WalletIslandContext = createContext<WalletIslandContextType>(
  {} as WalletIslandContextType,
);

export function WalletIslandProvider({ children }: WalletIslandProviderReact) {
  const { isClosing } = useWalletContext();
  const [showSwap, setShowSwap] = useState(false);
  const [isSwapClosing, setIsSwapClosing] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isQrClosing, setIsQrClosing] = useState(false);
  const [hasContentAnimated, setHasContentAnimated] = useState(false);
  const tokenHoldings = useAddressTokenHoldings();

  useEffect(() => {
    if (isQrClosing || isSwapClosing) {
      setHasContentAnimated(true);
    }
  }, [isQrClosing, isSwapClosing]);

  useEffect(() => {
    if (isClosing) {
      setHasContentAnimated(false);
    }
  }, [isClosing]);

  const animations = {
    content: hasContentAnimated ? '' : 'animate-walletIslandContainerIn',
    qr: 'animate-slideInFromLeft',
    swap: 'animate-slideInFromRight',
    walletActions: hasContentAnimated
      ? 'opacity-100'
      : 'animate-walletIslandContainerItem1',
    addressDetails: hasContentAnimated
      ? 'opacity-100'
      : 'animate-walletIslandContainerItem2',
    transactionActions: hasContentAnimated
      ? 'opacity-100'
      : 'animate-walletIslandContainerItem3',
    tokenHoldings: hasContentAnimated
      ? 'opacity-100'
      : 'animate-walletIslandContainerItem4',
  } as WalletIslandAnimations;

  const animationClasses = useMemo(() => {
    if (isQrClosing || isSwapClosing) {
      animations.content = '';
      animations.qr = 'animate-slideOutToLeft';
      animations.swap = 'animate-slideOutToLeft';
      animations.walletActions = 'animate-slideInFromRight';
      animations.addressDetails = 'animate-slideInFromRight';
      animations.transactionActions = 'animate-slideInFromRight';
      animations.tokenHoldings = 'animate-slideInFromRight';
    } else if (isClosing) {
      animations.content = 'animate-walletIslandContainerOut';
    }
    return animations;
  }, [isClosing, isQrClosing, isSwapClosing, animations]);

  const value = useValue({
    showSwap,
    setShowSwap,
    isSwapClosing,
    setIsSwapClosing,
    showQr,
    setShowQr,
    isQrClosing,
    setIsQrClosing,
    tokenHoldings,
    animationClasses,
    setHasContentEntered: setHasContentAnimated,
  });

  return (
    <WalletIslandContext.Provider value={value}>
      {children}
    </WalletIslandContext.Provider>
  );
}

export function useWalletIslandContext() {
  return useContext(WalletIslandContext);
}
