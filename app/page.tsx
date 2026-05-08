'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Tab } from '@/lib/types';
import { Wallet, AlertTriangle } from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';

import { Sidebar } from '@/components/Navigation/Sidebar';
import { MobileBottomNav } from '@/components/Navigation/MobileBottomNav';
import { MobileMenu } from '@/components/Navigation/MobileMenu';
import { DashboardView } from '@/components/Views/DashboardView';
import { CustomersView } from '@/components/Views/CustomersView';
import { SalesView } from '@/components/Views/SalesView';
import { ReceivablesView } from '@/components/Views/ReceivablesView';
import { ProductsView } from '@/components/Views/ProductsView';
import { SettingsView } from '@/components/Views/SettingsView';

export default function AppDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [autoOpenSale, setAutoOpenSale] = useState(false);
  const [autoOpenCustomer, setAutoOpenCustomer] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const store = useStore();

  if (store.profile?.expiresAt) {
    const expiresAt = parseISO(store.profile.expiresAt);
    if (isBefore(expiresAt, new Date())) {
      return <PaywallView expiresAt={expiresAt} />;
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (Top) */}
        <header className="sm:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
          <div className="font-bold text-emerald-700 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center">
              <Wallet size={14} />
            </span>
            Fiadopag
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onNewSaleClick={() => {
            setActiveTab('vendas');
            setAutoOpenSale(true);
          }}
        />

        {/* Dynamic View Context Menu */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-8 sm:pb-8 relative">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNewSale={() => { setActiveTab('vendas'); setAutoOpenSale(true); }}
              onNewCustomer={() => { setActiveTab('clientes'); setAutoOpenCustomer(true); }}
            />
          )}
          {activeTab === 'clientes' && <CustomersView autoOpen={autoOpenCustomer} setAutoOpen={setAutoOpenCustomer} />}
          {activeTab === 'produtos' && <ProductsView />}
          {activeTab === 'vendas' && <SalesView autoOpen={autoOpenSale} setAutoOpen={setAutoOpenSale} />}
          {activeTab === 'receber' && <ReceivablesView />}
          {activeTab === 'configuracoes' && <SettingsView />}

          {/* Mobile Hamburger Menu Overlay */}
          {isMobileMenuOpen && (
            <MobileMenu 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              setIsMobileMenuOpen={setIsMobileMenuOpen} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

function PaywallView({ expiresAt }: { expiresAt: Date }) {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#ef4444] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-3">Assinatura Expirada</h1>

        <p className="text-[#a1a1aa] mb-6 text-sm leading-relaxed">
          Seu período de acesso ao Fiadopag expirou no dia <strong className="text-white">{format(expiresAt, 'dd/MM/yyyy')}</strong>.
          Para continuar usando todas as ferramentas de gestão, realize o pagamento da sua mensalidade.
        </p>

        <div className="bg-[#09090b] border border-white/10 rounded-xl p-5 mb-8 text-left">
          <p className="text-sm text-[#a1a1aa] mb-1">Valor da Mensalidade:</p>
          <p className="text-2xl font-bold text-[#10b981] mb-4">R$ 49,90</p>

          <p className="text-sm text-[#a1a1aa] mb-1">Chave PIX (Telefone):</p>
          <div className="bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="font-mono text-white text-sm">47 99999-9999</span>
            <button
              onClick={() => navigator.clipboard.writeText('47999999999')}
              className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors"
            >
              Copiar
            </button>
          </div>
        </div>

        <a
          href="https://wa.me/5547999999999?text=Ol%C3%A1%21%20Segue%20o%20comprovante%20de%20pagamento%20da%20minha%20mensalidade%20do%20Fiadopay."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          Enviar Comprovante no WhatsApp
        </a>
      </div>

      <div className="mt-8 text-center text-xs text-white/30">
        Fiadopag © 2026. Todos os direitos reservados.
      </div>
    </div>
  );
}
