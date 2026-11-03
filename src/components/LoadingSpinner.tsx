import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'white' | 'black';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'white' 
}) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    white: 'border-pure-white border-t-transparent',
    black: 'border-primary-black border-t-transparent'
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Cargando"
      />
    </div>
  );
};

export default LoadingSpinner;