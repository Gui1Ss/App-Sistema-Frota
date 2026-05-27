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
      className={`rounded-lg shadow-[0_0_5px_rgba(0,0,0,0.25)] p-4 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
