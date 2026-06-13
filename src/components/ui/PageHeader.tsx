import { AppIcon } from '../icons/AppIcon';
import React from 'react';
import { useNavigate } from 'react-router-dom';


interface PageHeaderProps {
  title: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex items-center justify-between mb-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/80 flex items-center justify-center text-gray-600 hover:text-black hover:bg-white/80 transition-all shadow-sm"
      >
        <AppIcon icon="lucide:chevron-left" className="w-5 h-5" strokeWidth={2.5} />
      </button>
      <h1 className="text-xl font-black text-gray-900 tracking-tight">{title}</h1>
      <div className="w-10 h-10"></div>
    </div>
  );
};
