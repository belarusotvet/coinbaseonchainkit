import { fireEvent, render, screen } from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { useConnect, useConnectors } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { useOnchainKit } from '../../useOnchainKit';
import { WalletModal } from './WalletModal';

vi.mock('wagmi', () => ({
  useConnect: vi.fn(),
  useConnectors: vi.fn(),
}));

vi.mock('../../useOnchainKit', () => ({
  useOnchainKit: vi.fn(),
}));

vi.mock('wagmi/connectors', () => ({
  coinbaseWallet: () => ({ preference: 'all' }),
  metaMask: vi.fn().mockReturnValue({
    dappMetadata: {
      name: 'Test App',
      url: 'http://localhost',
      iconUrl: undefined,
    },
  }),
}));

describe('WalletModal', () => {
  const mockConnect = vi.fn();
  const mockOnClose = vi.fn();
  const mockConnectors = [
    { type: 'smartWallet', name: 'Smart Wallet' },
    { type: 'coinbaseWallet', name: 'Coinbase Wallet' },
  ];

  const originalWindowOpen = window.open;
  beforeAll(() => {
    window.open = vi.fn();
  });

  afterAll(() => {
    window.open = originalWindowOpen;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    (useConnect as Mock).mockReturnValue({ connect: mockConnect });
    (useConnectors as Mock).mockReturnValue(mockConnectors);
    (useOnchainKit as Mock).mockReturnValue({
      config: {
        appearance: {},
        wallet: {},
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders null when not open and animation completed', () => {
    const { container } = render(
      <WalletModal isOpen={false} onClose={mockOnClose} />,
    );

    vi.advanceTimersByTime(100);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal content when open', () => {
    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByText('Coinbase Wallet')).toBeInTheDocument();
    expect(screen.getByText('MetaMask')).toBeInTheDocument();
    expect(screen.getByText('Phantom')).toBeInTheDocument();
  });

  it('renders app logo and name when provided', () => {
    (useOnchainKit as Mock).mockReturnValue({
      config: {
        appearance: {
          logo: 'test-logo.png',
          name: 'Test App',
        },
        wallet: {},
      },
    });

    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByAltText('Test App icon')).toBeInTheDocument();
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('connects with Coinbase Wallet when clicking Sign up', () => {
    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Sign up'));

    expect(mockConnect).toHaveBeenCalledWith({
      connector: { preference: 'all' },
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when clicking overlay', () => {
    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    const overlay = screen.getByTestId('ockModalOverlay');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when clicking close button', () => {
    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders terms and privacy links when URLs provided', () => {
    (useOnchainKit as Mock).mockReturnValue({
      config: {
        appearance: {},
        wallet: {
          termsUrl: 'https://terms.test',
          privacyUrl: 'https://privacy.test',
        },
      },
    });

    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    const termsLink = screen.getByText('Terms of Service');
    const privacyLink = screen.getByText('Privacy Policy');

    expect(termsLink).toHaveAttribute('href', 'https://terms.test');
    expect(privacyLink).toHaveAttribute('href', 'https://privacy.test');
  });

  it('applies custom className when provided', () => {
    render(
      <WalletModal
        isOpen={true}
        onClose={mockOnClose}
        className="custom-class"
      />,
    );

    const overlay = screen.getByTestId('ockModalOverlay');
    expect(overlay).toHaveClass('custom-class');
  });

  it('applies correct transition classes based on isOpen state', () => {
    const { rerender } = render(
      <WalletModal isOpen={true} onClose={mockOnClose} />,
    );

    const overlay = screen.getByTestId('ockModalOverlay');
    const modal = overlay.children[0];

    expect(overlay).toHaveClass('opacity-100');
    expect(modal).toHaveClass('opacity-100');

    rerender(<WalletModal isOpen={false} onClose={mockOnClose} />);

    expect(overlay).toHaveClass('opacity-0');
    expect(modal).toHaveClass('opacity-0');
  });

  it('uses "App" as fallback in alt text when appName is not provided', () => {
    (useOnchainKit as Mock).mockReturnValue({
      config: {
        appearance: {
          logo: 'test-logo.png',
        },
        wallet: {},
      },
    });

    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByAltText('App icon')).toBeInTheDocument();
  });

  it('propagates className to both overlay and modal', () => {
    const customClass = 'my-custom-class';
    render(
      <WalletModal
        isOpen={true}
        onClose={mockOnClose}
        className={customClass}
      />,
    );

    const overlay = screen.getByTestId('ockModalOverlay');
    expect(overlay).toHaveClass(customClass, 'bg-black/70');
  });

  it('closes modal on Escape key press', () => {
    render(<WalletModal isOpen={true} onClose={mockOnClose} />);
    const modal = screen.getByRole('dialog');

    fireEvent.keyDown(modal, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles Coinbase Wallet connection errors', () => {
    const mockError = new Error('Connection failed');
    const mockOnError = vi.fn();
    (useConnect as Mock).mockReturnValue({
      connect: vi.fn(() => {
        throw mockError;
      }),
    });

    render(
      <WalletModal isOpen={true} onClose={mockOnClose} onError={mockOnError} />,
    );

    fireEvent.click(screen.getByText('Sign up'));

    expect(mockOnError).toHaveBeenCalledWith(mockError);
    expect(console.error).toHaveBeenCalledWith(
      'Coinbase Wallet connection error:',
      mockError,
    );
  });

  it('handles non-Error objects in Coinbase Wallet connection errors', () => {
    const mockOnError = vi.fn();
    (useConnect as Mock).mockReturnValue({
      connect: vi.fn(() => {
        throw 'Some string error';
      }),
    });

    render(
      <WalletModal isOpen={true} onClose={mockOnClose} onError={mockOnError} />,
    );

    fireEvent.click(screen.getByText('Sign up'));

    expect(mockOnError).toHaveBeenCalledWith(
      new Error('Failed to connect wallet'),
    );
    expect(console.error).toHaveBeenCalledWith(
      'Coinbase Wallet connection error:',
      'Some string error',
    );
  });

  it('traps focus within the modal when open', () => {
    render(<WalletModal isOpen={true} onClose={mockOnClose} />);
    const modal = screen.getByRole('dialog');
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    focusableElements[focusableElements.length - 1].focus();
    fireEvent.keyDown(modal, { key: 'Tab' });
    expect(document.activeElement).toBe(focusableElements[0]);

    focusableElements[0].focus();
    fireEvent.keyDown(modal, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(
      focusableElements[focusableElements.length - 1],
    );
  });

  it('renders terms and privacy links correctly', () => {
    (useOnchainKit as Mock).mockReturnValue({
      config: {
        appearance: {},
        wallet: {
          termsUrl: 'https://terms.test',
          privacyUrl: 'https://privacy.test',
        },
      },
    });

    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    const termsLink = screen.getByText('Terms of Service');
    const privacyLink = screen.getByText('Privacy Policy');

    expect(termsLink).toHaveAttribute('href', 'https://terms.test');
    expect(privacyLink).toHaveAttribute('href', 'https://privacy.test');
  });

  it('opens terms and privacy links in a new tab on Enter key press', () => {
    (useOnchainKit as Mock).mockReturnValue({
      config: {
        appearance: {},
        wallet: {
          termsUrl: 'https://terms.test',
          privacyUrl: 'https://privacy.test',
        },
      },
    });

    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    const termsLink = screen.getByText('Terms of Service');
    const privacyLink = screen.getByText('Privacy Policy');

    fireEvent.keyDown(termsLink, { key: 'Enter' });
    fireEvent.keyDown(privacyLink, { key: 'Enter' });

    expect(window.open).toHaveBeenCalledWith(
      'https://terms.test',
      '_blank',
      'noopener,noreferrer',
    );
    expect(window.open).toHaveBeenCalledWith(
      'https://privacy.test',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('closes modal on Enter key press on overlay', () => {
    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    const overlay = screen.getByTestId('ockModalOverlay');
    fireEvent.keyDown(overlay, { key: 'Enter' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not render when shouldRender is false', () => {
    const { container } = render(
      <WalletModal isOpen={false} onClose={mockOnClose} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('opens terms and privacy links on Enter key press', () => {
    (useOnchainKit as Mock).mockReturnValue({
      config: {
        appearance: {},
        wallet: {
          termsUrl: 'https://terms.test',
          privacyUrl: 'https://privacy.test',
        },
      },
    });

    render(<WalletModal isOpen={true} onClose={mockOnClose} />);

    const termsLink = screen.getByText('Terms of Service');
    const privacyLink = screen.getByText('Privacy Policy');

    fireEvent.keyDown(termsLink, { key: 'Enter' });
    fireEvent.keyDown(privacyLink, { key: 'Enter' });

    expect(window.open).toHaveBeenCalledWith(
      'https://terms.test',
      '_blank',
      'noopener,noreferrer',
    );
    expect(window.open).toHaveBeenCalledWith(
      'https://privacy.test',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('resets body overflow style on modal close', () => {
    const { rerender } = render(
      <WalletModal isOpen={true} onClose={mockOnClose} />,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<WalletModal isOpen={false} onClose={mockOnClose} />);
    expect(document.body.style.overflow).toBe('');
  });

  describe('MetaMask Connection', () => {
    it('connects with MetaMask when clicking the MetaMask button', () => {
      render(<WalletModal isOpen={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('MetaMask'));

      expect(metaMask).toHaveBeenCalledWith({
        dappMetadata: {
          name: 'OnchainKit App',
          url: window.location.origin,
          iconUrl: undefined,
        },
      });
      expect(mockConnect).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('uses configured app name and logo for MetaMask connection', () => {
      (useOnchainKit as Mock).mockReturnValue({
        config: {
          appearance: {
            name: 'Test App',
            logo: 'test-logo.png',
          },
          wallet: {},
        },
      });

      render(<WalletModal isOpen={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('MetaMask'));

      expect(metaMask).toHaveBeenCalledWith({
        dappMetadata: {
          name: 'Test App',
          url: window.location.origin,
          iconUrl: 'test-logo.png',
        },
      });
    });

    it('handles MetaMask connection errors', () => {
      const mockError = new Error('MetaMask connection failed');
      const mockOnError = vi.fn();
      (useConnect as Mock).mockReturnValue({
        connect: vi.fn(() => {
          throw mockError;
        }),
      });

      render(
        <WalletModal
          isOpen={true}
          onClose={mockOnClose}
          onError={mockOnError}
        />,
      );

      fireEvent.click(screen.getByText('MetaMask'));

      expect(mockOnError).toHaveBeenCalledWith(mockError);
      expect(console.error).toHaveBeenCalledWith(
        'MetaMask connection error:',
        mockError,
      );
    });
  });

  describe('Phantom Connection', () => {
    beforeEach(() => {
      (useConnect as Mock).mockReturnValue({
        connect: mockConnect,
        connectors: [{ name: 'phantom', id: 'phantom' }],
      });
    });

    it('connects with Phantom when clicking the Phantom button', () => {
      // Mock window.phantom
      (window as any).phantom = {};

      render(<WalletModal isOpen={true} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Phantom'));

      expect(mockConnect).toHaveBeenCalledWith({
        connector: expect.objectContaining({ name: 'phantom' }),
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('opens Phantom website when wallet is not installed', () => {
      // Ensure window.phantom is undefined
      (window as any).phantom = undefined;
      const mockOnError = vi.fn();

      render(
        <WalletModal
          isOpen={true}
          onClose={mockOnClose}
          onError={mockOnError}
        />,
      );

      fireEvent.click(screen.getByText('Phantom'));

      expect(window.open).toHaveBeenCalledWith(
        'https://phantom.app/',
        '_blank',
      );
      expect(mockOnError).toHaveBeenCalledWith(
        new Error('Phantom wallet is not installed'),
      );
    });

    it('handles missing Phantom connector', () => {
      (useConnect as Mock).mockReturnValue({
        connect: mockConnect,
        connectors: [], // Empty connectors array
      });
      const mockOnError = vi.fn();

      render(
        <WalletModal
          isOpen={true}
          onClose={mockOnClose}
          onError={mockOnError}
        />,
      );

      fireEvent.click(screen.getByText('Phantom'));

      expect(mockOnError).toHaveBeenCalledWith(
        new Error('Phantom connector not found'),
      );
    });

    it('handles Phantom connection errors', () => {
      (window as any).phantom = {};
      const mockError = new Error('Phantom connection failed');
      const mockOnError = vi.fn();
      (useConnect as Mock).mockReturnValue({
        connect: vi.fn(() => {
          throw mockError;
        }),
        connectors: [{ name: 'phantom', id: 'phantom' }],
      });

      render(
        <WalletModal
          isOpen={true}
          onClose={mockOnClose}
          onError={mockOnError}
        />,
      );

      fireEvent.click(screen.getByText('Phantom'));

      expect(mockOnError).toHaveBeenCalledWith(mockError);
      expect(console.error).toHaveBeenCalledWith(
        'Phantom connection error:',
        mockError,
      );
    });
  });
});
