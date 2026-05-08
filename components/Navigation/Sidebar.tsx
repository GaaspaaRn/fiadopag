import React from 'react';
import { LayoutDashboard, Users, ShoppingBag, Wallet, Settings, Package, FileDown, Import } from 'lucide-react';
import { NavItem } from './NavItem';
import { Tab } from '@/lib/types';
import { useStore } from '@/lib/store';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const store = useStore();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden sm:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xl tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Wallet size={18} />
          </span>
          Fiadopag
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavItem active={activeTab === 'dashboard'} icon={<LayoutDashboard size={18} />} label="Início" onClick={() => setActiveTab('dashboard')} />
        <NavItem active={activeTab === 'receber'} icon={<Wallet size={18} />} label="Contas a Receber" onClick={() => setActiveTab('receber')} />
        <NavItem active={activeTab === 'clientes'} icon={<Users size={18} />} label="Clientes" onClick={() => setActiveTab('clientes')} />
        <NavItem active={activeTab === 'produtos'} icon={<Package size={18} />} label="Produtos" onClick={() => setActiveTab('produtos')} />
        <NavItem active={activeTab === 'vendas'} icon={<ShoppingBag size={18} />} label="Vendas Feitas" onClick={() => setActiveTab('vendas')} />
        <NavItem active={activeTab === 'configuracoes'} icon={<Settings size={18} />} label="Configurações" onClick={() => setActiveTab('configuracoes')} />
      </nav>
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button onClick={() => store.exportToCSV()} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 w-full px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
          <FileDown size={16} /> Exportar Relatório (CSV)
        </button>
        <button onClick={() => {
          const str = prompt('Cole o texto do JSON salvo: (Isto sobrescreverá os dados atuais)');
          if (str) store.importFromJSON(str);
        }}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 w-full px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
          <Import size={16} /> Importar Backup (JSON)
        </button>
      </div>
    </aside>
  );
}
