import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showUserInfo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showUserInfo = true,
}) => {
  const { motorista } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start">
          <div>
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>

          {showUserInfo && motorista && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{motorista.nome}</p>
              <p className="text-xs text-gray-500">{motorista.cpf}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
