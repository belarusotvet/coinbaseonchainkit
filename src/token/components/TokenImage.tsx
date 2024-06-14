import { useMemo } from 'react';
import type { TokenImageReact } from '../types';
import { getTokenImageColor } from './getTokenImageColor';
import { cn } from '../../utils/cn';

export function TokenImage({ className, size = 24, token }: TokenImageReact) {
  const { image, name } = token;

  const styles = useMemo(() => {
    return {
      image: {
        width: `${size}px`,
        height: `${size}px`,
      },
      placeholderImage: {
        background: getTokenImageColor(name),
        width: `${size}px`,
        height: `${size}px`,
      },
    };
  }, [size, name]);

  if (!image) {
    return (
      <div
        className={cn('overflow-hidden rounded-full', className)}
        data-testid="ockTokenImage_NoImage"
        style={styles.image}
      >
        <div style={styles.placeholderImage} />
      </div>
    );
  }

  return (
    <img
      className={className || 'ock-tokenimage'}
      alt="token-image"
      data-testid="ockTokenImage_Image"
      style={styles.image}
      src={image}
    />
  );
}
