import React from 'react';

interface SkeletonProps {
  type?: 'card' | 'text' | 'title' | 'image' | 'banner';
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ type = 'text', className = '' }) => {
  const baseClasses = "animate-pulse bg-surface-black border border-dark-grey rounded-sm";
  
  if (type === 'card') {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        <div className={`${baseClasses} aspect-[3/4] w-full`}></div>
        <div className={`${baseClasses} h-6 w-3/4`}></div>
        <div className={`${baseClasses} h-4 w-1/2`}></div>
        <div className={`${baseClasses} h-8 w-1/3 mt-2`}></div>
      </div>
    );
  }

  if (type === 'banner') {
    return <div className={`${baseClasses} w-full h-[60vh] md:h-[80vh] ${className}`}></div>;
  }

  if (type === 'image') {
    return <div className={`${baseClasses} aspect-square w-full ${className}`}></div>;
  }

  if (type === 'title') {
    return <div className={`${baseClasses} h-10 w-2/3 ${className}`}></div>;
  }

  return <div className={`${baseClasses} h-4 w-full ${className}`}></div>; // text
};

export default Skeleton;