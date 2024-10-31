import { background, border, cn, color } from '../../styles/theme';
import { useTheme } from '../../useTheme';

export function NFTErrorFallback({ error }: { error: Error }) {
  const componentTheme = useTheme();

  return (
    <div
      className={cn(
        componentTheme,
        color.foreground,
        background.default,
        border.defaultActive,
        border.radius,
        'flex w-full max-w-[500px] flex-col items-center justify-center border px-6 py-4',
      )}
      data-testid="ockNFTMintCardFallback_Container"
    >
      <div>Sorry, we had an unhandled error</div>
      <div>{error.message}</div>
    </div>
  );
}
