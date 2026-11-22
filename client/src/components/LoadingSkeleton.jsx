import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div className="skeleton-wrapper" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={`skeleton skeleton-${type}`}>
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-subtitle"></div>
          <div className="skeleton-line skeleton-text"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
