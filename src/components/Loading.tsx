import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = 'Carregando...',
}) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <svg className="animate-spin h-12 w-12 text-primary mx-auto" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
};
