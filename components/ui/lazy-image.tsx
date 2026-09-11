import React, { useState } from 'react';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  inView?: boolean;
  alt: string;
  ratio?: number;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallback = "https://cdn.21st.dev/assets/mirror/cc/ccf6e78beb7f7cc5b720069cb4f86696912be109614973d49df165d1e51631c8.svg",
  inView = true,
  alt,
  ratio = 16 / 9,
  className = "",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error && fallback && imgSrc !== fallback) {
      setError(true);
      setImgSrc(fallback);
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-md bg-zinc-100"
      style={{ aspectRatio: `${ratio}` }}
    >
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-80'} ${className}`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
