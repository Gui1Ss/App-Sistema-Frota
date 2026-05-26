import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const hoverClass = hoverable ? 'hover:shadow-lg cursor-pointer transition-shadow' : '';

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
