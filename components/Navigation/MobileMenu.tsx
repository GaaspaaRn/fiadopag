import React from 'react';
import { ShoppingBag, Settings, Package, FileDown, Import } from 'lucide-react';
import { Tab } from '@/lib/types';
import { useStore } from '@/lib/store';

interface MobileMenuProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function MobileMenu({ activeTab, setActiveTab, setIsMobileMenuOpen }: MobileMenuProps) {
  const store = useStore();

  return (
    <div className="sm:hidden fixed top-14 bottom-16 left-0 right-0 overflow-y-auto bg-white z-40 p-6 animate-in slide-in-from-bottom-2 duration-200">
      <h2 className="text-xl font-bold mb-6 text-slate-800">Menu</h2>
      <div className="space-y-2">
        <button onClick={() => { setActiveTab('produtos'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left font-medium transition-colors ${activeTab === 'produtos' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
          <Package size={20} className={activeTab === 'produtos' ? 'text-emerald-600' : 'text-slate-500'} />
          Produtos
        </button>
        <button onClick={() => { setActiveTab('vendas'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left font-medium transition-colors ${activeTab === 'vendas' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
          <ShoppingBag size={20} className={activeTab === 'vendas' ? 'text-emerald-600' : 'text-slate-500'} />
          Vendas Feitas
        </button>
        <button onClick={() => { setActiveTab('configuracoes'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left font-medium transition-colors ${activeTab === 'configuracoes' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
          <Settings size={20} className={activeTab === 'configuracoes' ? 'text-emerald-600' : 'text-slate-500'} />
          Configurações
        </button>

        <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
          <button onClick={() => { store.exportToCSV(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-slate-600 w-full px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
            <FileDown size={20} className="text-slate-400" /> Exportar Backup (CSV)
          </button>
          <button onClick={() => {
            const str = prompt('Cole o texto do JSON salvo: (Isto sobrescreverá os dados atuais)');
            if (str) store.importFromJSON(str);
            setIsMobileMenuOpen(false);
          }}
            className="flex items-center gap-3 text-slate-600 w-full px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
            <Import size={20} className="text-slate-400" /> Importar Backup (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
