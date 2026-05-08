import React from 'react';
import { LayoutDashboard, Users, Wallet, Plus, Menu } from 'lucide-react';
import { MobileNavItem } from './MobileNavItem';
import { Tab } from '@/lib/types';

interface MobileBottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onNewSaleClick: () => void;
}

export function MobileBottomNav({ 
  activeTab, 
  setActiveTab, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  onNewSaleClick 
}: MobileBottomNavProps) {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 pb-safe">
      <MobileNavItem active={activeTab === 'dashboard'} icon={<LayoutDashboard size={20} />} label="Início" onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
      <MobileNavItem active={activeTab === 'receber'} icon={<Wallet size={20} />} label="Receber" onClick={() => { setActiveTab('receber'); setIsMobileMenuOpen(false); }} />
      
      <div className="relative -top-5">
        <button
          onClick={() => {
            onNewSaleClick();
            setIsMobileMenuOpen(false);
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 bg-emerald-600 text-white hover:bg-emerald-700`}
        >
          <Plus size={24} />
        </button>
      </div>
      
      <MobileNavItem active={activeTab === 'clientes'} icon={<Users size={20} />} label="Clientes" onClick={() => { setActiveTab('clientes'); setIsMobileMenuOpen(false); }} />
      <MobileNavItem active={isMobileMenuOpen} icon={<Menu size={20} />} label="Menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
    </nav>
  );
}
