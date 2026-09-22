import { useEffect, useState } from 'react';

type BanterLoaderProps = {
  onComplete: () => void;
};

export default function BanterLoader({ onComplete }: BanterLoaderProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsExiting(true), 900);
    const completeTimer = window.setTimeout(onComplete, 1_250);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`page-loader${isExiting ? ' page-loader--exiting' : ''}`}
      role="status"
      aria-label="页面加载中"
    >
      <div className="banter-loader" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => (
          <div className="banter-loader__box" key={index} />
        ))}
      </div>
    </div>
  );
}
