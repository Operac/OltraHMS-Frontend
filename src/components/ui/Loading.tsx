import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Loading...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const container = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`${sizeClasses[size]} border-sky-500 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {container}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[200px]">
      {container}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    <div className="flex gap-4 p-4 bg-gray-50 rounded">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border-b">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-4 space-y-3">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-1/3 ml-auto" />
  </div>
);

export const PageLoader: React.FC<{ text?: string }> = ({ text }) => (
  <Loading size="lg" text={text || 'Loading page...'} fullScreen />
);
