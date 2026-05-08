'use client';

import React, { useState, useMemo } from 'react';
import { useStore, Installment, Sale, Customer } from '@/lib/store';
import { formatCurrency, formatPhone } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, Users, ShoppingBag, Wallet, Plus, Search, Calendar, Check, AlertCircle, AlertTriangle, FileDown, Import, Trash2, Eye, Pencil, Package, Menu, Settings, Info, Database, Building2, UserCircle, Lock, LogOut, Save } from 'lucide-react';
import { format, parseISO, isToday, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Tab = 'dashboard' | 'clientes' | 'produtos' | 'vendas' | 'receber' | 'menu' | 'configuracoes';

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
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 pb-safe">
          <MobileNavItem active={activeTab === 'dashboard'} icon={<LayoutDashboard size={20} />} label="Início" onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
          <MobileNavItem active={activeTab === 'receber'} icon={<Wallet size={20} />} label="Receber" onClick={() => { setActiveTab('receber'); setIsMobileMenuOpen(false); }} />
          <div className="relative -top-5">
            <button
              onClick={() => {
                setActiveTab('vendas');
                setAutoOpenSale(true);
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
            <div className="sm:hidden absolute inset-0 bg-white z-40 p-4 animate-in slide-in-from-bottom-2 duration-200">
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

function MobileNavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${active ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
        }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
        ? 'bg-emerald-50 text-emerald-700'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

// -------------------------------------------------------------
// DASHBOARD
// -------------------------------------------------------------

function DashboardView({ onNewSale, onNewCustomer }: { onNewSale: () => void, onNewCustomer: () => void }) {
  const store = useStore();

  const stats = useMemo(() => {
    let totalReceber = 0;
    let totalAtrasado = 0;
    let totalRecebido = 0;
    let capitalNaRua = 0;
    let lucroProjetado = 0;

    store.installments.forEach(i => {
      const status = store.getDynamicInstallmentStatus(i);
      if (status === 'PAGO') {
        totalRecebido += i.paidValue || i.originalValue;
      } else {
        const sale = store.sales.find(s => s.id === i.saleId);
        if (sale) {
          const calc = store.getCalculatedValue(sale, i);
          totalReceber += calc.value;
          if (status === 'ATRASADO') {
            totalAtrasado += calc.value;
          }
        }
      }
    });

    store.sales.forEach(s => {
      if (!s.principalPago) {
        capitalNaRua += s.totalValue; // Capital original
        lucroProjetado += s.lucroOperacao;
      }
    });

    return { totalReceber, totalAtrasado, totalRecebido, clientes: store.customers.length, capitalNaRua, lucroProjetado };
  }, [store]);

  const chartData = useMemo(() => {
    const months: Record<string, number> = {};
    const sorted = [...store.installments]
      .filter(i => store.getDynamicInstallmentStatus(i) !== 'PAGO')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    sorted.forEach(s => {
      const d = parseISO(s.dueDate);
      const m = format(d, 'MMM/yy', { locale: ptBR });
      months[m] = (months[m] || 0) + s.originalValue;
    });

    return Object.keys(months).slice(0, 6).map(k => ({ name: k, value: months[k] }));
  }, [store]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visão Geral</h1>
          <p className="text-sm text-slate-500">Acompanhe a saúde financeira do seu negócio.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onNewCustomer}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <Users size={18} className="text-emerald-600" />
            <span className="hidden sm:inline">Novo Cliente</span>
            <span className="sm:hidden">Cliente</span>
          </button>
          <button
            onClick={onNewSale}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus size={18} />
            Nova Venda
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard title="A Receber (Parcelas)" value={stats.totalReceber} type="info" icon={<Wallet size={20} className="text-blue-600" />} />
        <SummaryCard title="Valor Vencido (Atrasado)" value={stats.totalAtrasado} type="danger" icon={<AlertCircle size={20} className="text-red-600" />} />
        <SummaryCard title="Capital na Rua (Ativo)" value={stats.capitalNaRua} type="warning" icon={<AlertTriangle size={20} className="text-amber-600" />} />
        <SummaryCard title="Lucro Projetado (Fixo)" value={stats.lucroProjetado} type="success" icon={<Check size={20} className="text-emerald-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-6">Projeção de Recebimentos Futuros</h2>
          {chartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">Nenhum título projetado.</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-fit">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Vencimentos Hoje
          </h2>
          <div className="overflow-y-auto max-h-[150px] mb-6">
            {store.installments.filter(i => isToday(parseISO(i.dueDate)) && store.getDynamicInstallmentStatus(i) !== 'PAGO').length === 0 ? (
              <p className="text-sm text-slate-500">Ufa, nenhum fiado vencendo hoje.</p>
            ) : (
              <ul className="space-y-3">
                {store.installments.filter(i => isToday(parseISO(i.dueDate)) && store.getDynamicInstallmentStatus(i) !== 'PAGO').map(i => {
                  const cust = store.customers.find(c => c.id === i.customerId);
                  return (
                    <li key={i.id} className="border-b border-slate-100 pb-2 text-sm flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">{cust?.name || 'Cliente'}</p>
                        <p className="text-slate-500 text-xs">Parcela {i.number}</p>
                      </div>
                      <span className="font-semibold text-slate-700">{formatCurrency(i.originalValue)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <h2 className="text-lg font-medium mb-4 flex items-center gap-2 border-t border-slate-100 pt-6">
            <AlertCircle size={18} className="text-red-500" />
            Clientes em Atraso
          </h2>
          <div className="overflow-y-auto max-h-[250px]">
            {store.installments.filter(i => store.getDynamicInstallmentStatus(i) === 'ATRASADO').length === 0 ? (
              <p className="text-sm text-slate-500">Ninguém em atraso. Excelente!</p>
            ) : (
              <ul className="space-y-4">
                {store.installments.filter(i => store.getDynamicInstallmentStatus(i) === 'ATRASADO').map(i => {
                  const cust = store.customers.find(c => c.id === i.customerId);
                  const sale = store.sales.find(s => s.id === i.saleId);
                  const calc = sale ? store.getCalculatedValue(sale, i) : { value: i.originalValue, daysLate: 0 };
                  return (
                    <li key={i.id} className="border-b border-slate-100 pb-2 text-sm flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">{cust?.name || 'Cliente'}</p>
                        <p className="text-red-500 text-xs font-bold">{calc.daysLate} dias de atraso</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{formatCurrency(calc.value)}</p>
                        <p className="text-[10px] text-slate-400">Vencimento: {format(parseISO(i.dueDate), 'dd/MM')}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, type = 'info', icon, isNumber = false }: { title: string, value: number, type?: 'info' | 'success' | 'danger' | 'warning', icon: React.ReactNode, isNumber?: boolean }) {
  let colorClass = '';
  if (type === 'danger') colorClass = 'text-red-600';
  if (type === 'success') colorClass = 'text-emerald-600';
  if (type === 'info') colorClass = 'text-slate-900';
  if (type === 'warning') colorClass = 'text-amber-600';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between transition hover:shadow-md">
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="text-slate-500 text-xs sm:text-sm font-medium leading-tight">{title}</h3>
        <div className="p-1.5 sm:p-2 bg-slate-50 rounded-lg shrink-0">{icon}</div>
      </div>
      <p className={`text-xl sm:text-2xl font-semibold tracking-tight ${colorClass} truncate`} title={isNumber ? value.toString() : formatCurrency(value)}>
        {isNumber ? value : formatCurrency(value)}
      </p>
    </div>
  );
}

// -------------------------------------------------------------
// CUSTOMERS
// -------------------------------------------------------------

function CustomersView({ autoOpen, setAutoOpen }: { autoOpen?: boolean, setAutoOpen?: (v: boolean) => void }) {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    if (autoOpen) {
      setIsModalOpen(true);
      if (setAutoOpen) setAutoOpen(false);
    }
  }, [autoOpen, setAutoOpen]);

  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', phone: '', documentNumber: '', address: '', notes: '' });

  const filtered = store.customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      store.updateCustomer(formData.id, {
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        documentNumber: formData.documentNumber,
        address: formData.address,
        notes: formData.notes
      });
    } else {
      store.addCustomer({
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        documentNumber: formData.documentNumber,
        address: formData.address,
        notes: formData.notes
      });
    }
    setIsModalOpen(false);
    setFormData({ id: '', name: '', phone: '', documentNumber: '', address: '', notes: '' });
  };

  const openEditModal = (c: Customer) => {
    setFormData({ id: c.id, name: c.name, phone: c.phone, documentNumber: c.documentNumber || '', address: c.address || '', notes: c.notes });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setFormData({ id: '', name: '', phone: '', documentNumber: '', address: '', notes: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Carteira de Clientes</h1>
        <button onClick={openNewModal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Adicionar Cliente
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-2 items-center bg-slate-50/50">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Encontre o cliente na carteira..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
          />
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Nome Completo</th>
                <th className="py-3 px-6">WhatsApp</th>
                <th className="py-3 px-6">Cliente Desde</th>
                <th className="py-3 px-6">Observações</th>
                <th className="py-3 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Nenhum cliente cadastrado.</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-6 font-medium text-slate-900">{c.name}</td>
                    <td className="py-3 px-6 font-mono text-xs">{formatPhone(c.phone) || '-'}</td>
                    <td className="py-3 px-6">{format(parseISO(c.createdAt), 'dd/MM/yyyy')}</td>
                    <td className="py-3 px-6 truncate max-w-[200px]" title={c.notes}>{c.notes || '-'}</td>
                    <td className="py-3 px-6 text-right flex justify-end gap-2">
                      <button onClick={() => setViewCustomer(c)} className="text-emerald-600 hover:text-emerald-800 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-emerald-50 rounded" title="Ver Histórico">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openEditModal(c)} className="text-slate-500 hover:text-slate-700 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 rounded" title="Editar Cliente">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => { if (confirm('Atenção: Apagar o cliente apagará TAMBÉM todas as suas vendas e contas a receber. Confirma?')) store.deleteCustomer(c.id); }} className="text-slate-400 hover:text-red-500 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Apagar Registro">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">{formData.id ? 'Editar Cadastro' : 'Novo Cadastro'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                <input required type="text" placeholder="Ex: Maria da Silva" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp (Opcional)</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-300" placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nº Documento (Opcional)</label>
                  <input type="text" value={formData.documentNumber} onChange={e => setFormData({ ...formData, documentNumber: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-300" placeholder="CPF/RG" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço (Opcional)</label>
                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-300" placeholder="Rua, número, bairro..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações (Opcional)</label>
                <textarea rows={3} placeholder="Anotações sobre o cliente..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-300 resize-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-slate-100 pt-5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-sm text-white font-medium bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">{formData.id ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
              <div>
                <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2"><h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Fiadopag</h1><Users size={20} /> {viewCustomer.name}</h2>
                <p className="text-xs text-emerald-700 font-medium mt-1">Cliente desde {format(parseISO(viewCustomer.createdAt), 'dd/MM/yyyy')}</p>
              </div>
              <button onClick={() => setViewCustomer(null)} className="text-emerald-400 hover:text-emerald-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">WhatsApp</p>
                  <p className="font-mono text-sm">{formatPhone(viewCustomer.phone) || 'Não informado'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Documento</p>
                  <p className="text-sm">{viewCustomer.documentNumber || 'Não informado'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 sm:col-span-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Endereço</p>
                  <p className="text-sm">{viewCustomer.address || 'Não informado'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 sm:col-span-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-sm">{viewCustomer.notes || 'Nenhuma observação.'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><ShoppingBag size={16} /> Histórico de Vendas</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-4">Data</th>
                        <th className="py-2 px-4">Produto</th>
                        <th className="py-2 px-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {store.sales.filter(s => s.customerId === viewCustomer.id).length === 0 ? (
                        <tr><td colSpan={3} className="py-4 px-4 text-center text-slate-400">Nenhuma venda registrada.</td></tr>
                      ) : store.sales.filter(s => s.customerId === viewCustomer.id).map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2 px-4">{format(parseISO(s.createdAt), 'dd/MM/yyyy')}</td>
                          <td className="py-2 px-4">{s.product}</td>
                          <td className="py-2 px-4 text-right font-medium">{formatCurrency(s.totalValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SALES
// -------------------------------------------------------------

function SalesView({ autoOpen, setAutoOpen }: { autoOpen?: boolean, setAutoOpen?: (v: boolean) => void }) {
  const store = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (autoOpen) {
      setIsModalOpen(true);
      if (setAutoOpen) setAutoOpen(false);
    }
  }, [autoOpen, setAutoOpen]);
  const [formData, setFormData] = useState({
    customerName: '',
    product: '',
    totalValue: '',
    modalidade: 'fiado' as 'fiado' | 'carne' | 'so_juros',
    taxaOperacao: '0',
    frequencia: 'mensal',
    installCount: '1',
    startDate: new Date().toISOString().split('T')[0],
    interestRate: '2', // default 2% per month
    notes: ''
  });

  // Simulator
  const simulatedValues = useMemo(() => {
    const valBase = parseFloat(formData.totalValue.replace(',', '.')) || 0;
    const taxa = parseFloat(formData.taxaOperacao) || 0;
    const parcelas = parseInt(formData.installCount) || 1;

    if (formData.modalidade === 'carne') {
      const lucro = valBase * (taxa / 100);
      const total = valBase + lucro;
      const valParcela = total / parcelas;
      return { lucro, total, valParcela, desc: 'Juros embutidos e divididos nas parcelas.' };
    } else if (formData.modalidade === 'so_juros') {
      const lucroMensal = valBase * (taxa / 100);
      const lucroTotal = lucroMensal * parcelas;
      return { lucro: lucroTotal, total: valBase + lucroTotal, valParcela: lucroMensal, desc: 'O cliente paga só os juros. Capital fica intacto até a quitação.' };
    } else {
      // fiado tradicional
      const valParcela = valBase / parcelas;
      return { lucro: 0, total: valBase, valParcela, desc: 'Sem juros sobre o capital. Juros apenas por atraso.' };
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const typedName = formData.customerName.trim();
      if (!typedName) return;

      let finalCustomerId = '';
      const existingCustomer = store.customers.find(c => c.name.toLowerCase() === typedName.toLowerCase());

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        finalCustomerId = await store.addCustomer({
          name: typedName,
          phone: '',
          documentNumber: '',
          address: '',
          notes: 'Cliente criado automaticamente durante a venda.'
        });
      }

      await store.addSale({
        customerId: finalCustomerId,
        product: formData.product,
        totalValue: parseFloat(formData.totalValue.replace(',', '.')),
        modalidade: formData.modalidade,
        taxaOperacao: parseFloat(formData.taxaOperacao) || 0,
        frequencia: formData.frequencia,
        installCount: parseInt(formData.installCount),
        startDate: new Date(formData.startDate + "T12:00:00Z").toISOString(),
        interestRate: parseFloat(formData.interestRate) || 0,
        notes: formData.notes
      });

      setIsModalOpen(false);
      setFormData({
        customerName: '', product: '', totalValue: '', modalidade: 'fiado', taxaOperacao: '0', frequencia: 'mensal', installCount: '1', startDate: new Date().toISOString().split('T')[0], interestRate: '2', notes: ''
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar venda. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Histórico de Vendas</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Lançar Nova Venda
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Data da Venda</th>
                <th className="py-3 px-6">Cliente Associado</th>
                <th className="py-3 px-6">Produtos</th>
                <th className="py-3 px-6">Modalidade</th>
                <th className="py-3 px-6 text-right">Valor Financiado</th>
                <th className="py-3 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {store.sales.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Nenhuma venda efetuada no sistema. Comece a lançar!</td></tr>
              ) : (
                store.sales.map(s => {
                  const c = store.customers.find(cx => cx.id === s.customerId);
                  const modalidadeLabel = s.modalidade === 'carne' ? 'Carnê' : s.modalidade === 'so_juros' ? 'Só Juros' : 'Fiado';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-6">{format(parseISO(s.createdAt), 'dd/MM/yyyy')}</td>
                      <td className="py-3 px-6 font-medium text-slate-900">{c?.name || 'Cliente Removido'}</td>
                      <td className="py-3 px-6 truncate max-w-[200px]" title={s.product}>{s.product}</td>
                      <td className="py-3 px-6"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">{modalidadeLabel}</span></td>
                      <td className="py-3 px-6 text-right font-semibold text-emerald-700">{formatCurrency(s.valorTotalFinanciado)}</td>
                      <td className="py-3 px-6 flex justify-end">
                        <button onClick={() => { if (confirm('Apagar esta venda cancelará todas as parcelas a receber vinculadas a ela. Tem certeza?')) store.deleteSale(s.id); }} className="text-slate-400 hover:text-red-500 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Deletar Venda">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-700 text-white">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Wallet size={18} /> Lançar Nova Venda / Operação</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-100 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin bg-slate-50">
              <form id="sale-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Section 1: Basic Info */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">1. Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Buscar/Criar Cliente *</label>
                      <input
                        required type="text" list="customers-list" placeholder="Nome do cliente..."
                        value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                      />
                      <datalist id="customers-list">{store.customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Produto/Serviço *</label>
                      <input
                        required type="text" list="products-list" placeholder="Ex: Empréstimo, Perfume..."
                        value={formData.product}
                        onChange={e => {
                          const val = e.target.value;
                          const prod = store.products.find(p => p.name === val);
                          if (prod && prod.sellPrice && !formData.totalValue) {
                            setFormData({ ...formData, product: val, totalValue: prod.sellPrice.toString() });
                          } else setFormData({ ...formData, product: val });
                        }}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                      />
                      <datalist id="products-list">{store.products.map(p => <option key={p.id} value={p.name} />)}</datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Valor Principal (R$)</label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-[9px] font-bold text-slate-400">R$</span>
                      <input required type="number" step="0.01" min="0" placeholder="0.00" value={formData.totalValue} onChange={e => setFormData({ ...formData, totalValue: e.target.value })} className="w-full border-2 border-slate-300 rounded-lg pl-10 pr-3 py-2 text-lg font-bold focus:border-emerald-600 outline-none text-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Modality */}
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-1">2. Modelo de Operação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <label className={`cursor-pointer rounded-lg border-2 p-2 flex flex-col transition-all ${formData.modalidade === 'fiado' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                      <input type="radio" name="modalidade" value="fiado" checked={formData.modalidade === 'fiado'} onChange={() => setFormData({ ...formData, modalidade: 'fiado', taxaOperacao: '0' })} className="sr-only" />
                      <span className="font-bold text-slate-800 text-sm">Fiado</span>
                      <span className="text-[10px] text-slate-500 leading-tight">Sem juros no capital.</span>
                    </label>
                    <label className={`cursor-pointer rounded-lg border-2 p-2 flex flex-col transition-all ${formData.modalidade === 'carne' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                      <input type="radio" name="modalidade" value="carne" checked={formData.modalidade === 'carne'} onChange={() => setFormData({ ...formData, modalidade: 'carne' })} className="sr-only" />
                      <span className="font-bold text-slate-800 text-sm">Carnê</span>
                      <span className="text-[10px] text-slate-500 leading-tight">Juros pré-fixados.</span>
                    </label>
                    <label className={`cursor-pointer rounded-lg border-2 p-2 flex flex-col transition-all ${formData.modalidade === 'so_juros' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                      <input type="radio" name="modalidade" value="so_juros" checked={formData.modalidade === 'so_juros'} onChange={() => setFormData({ ...formData, modalidade: 'so_juros', frequencia: 'mensal' })} className="sr-only" />
                      <span className="font-bold text-slate-800 text-sm">Só Juros</span>
                      <span className="text-[10px] text-slate-500 leading-tight">Cliente paga só juros.</span>
                    </label>
                  </div>
                </div>

                {/* Section 3: Structure */}
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-1">3. Estrutura e Simulação</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Parcelas</label>
                      <input type="number" min="1" max="100" value={formData.installCount} onChange={e => setFormData({ ...formData, installCount: e.target.value })} className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Frequência</label>
                      <select disabled={formData.modalidade === 'so_juros'} value={formData.frequencia} onChange={e => setFormData({ ...formData, frequencia: e.target.value })} className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-600 outline-none bg-white">
                        <option value="semanal">Semanal</option>
                        <option value="quinzenal">Quinzenal</option>
                        <option value="mensal">Mensal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">1º Vencimento</label>
                      <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">{formData.modalidade === 'fiado' ? 'Multa (%)' : 'Juros (%)'}</label>
                      <input required type="number" step="0.1" min="0" value={formData.interestRate} onChange={e => setFormData({ ...formData, interestRate: e.target.value })} className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-600 outline-none" />
                    </div>
                  </div>

                  {/* Dynamic Summary */}
                  <div className="mt-6 bg-slate-900 text-white p-5 rounded-xl shadow-inner relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500 rounded-full blur-2xl opacity-20"></div>
                    <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">Resumo da Operação</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-xs">Valor da Parcela</p>
                        <p className="text-2xl font-bold">{formatCurrency(simulatedValues.valParcela)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Lucro Projetado</p>
                        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(simulatedValues.lucro)}</p>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-700">
                        <p className="text-slate-400 text-xs">Montante Final a Receber</p>
                        <p className="text-lg font-semibold">{formatCurrency(simulatedValues.total)}</p>
                        <p className="text-xs text-slate-500 mt-1 italic">{simulatedValues.desc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Multa por Atraso (%)
                      <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                        Pro-rata {formData.frequencia}
                      </span>
                    </label>
                    <p className="text-[10px] text-slate-400 mb-2">Os juros serão calculados diariamente com base no período {formData.frequencia}.</p>
                    <input required type="number" step="0.1" min="0" value={formData.interestRate} onChange={e => setFormData({ ...formData, interestRate: e.target.value })} className="w-full max-w-xs border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-600 outline-none" />
                  </div>

                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
              <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">Cancelar</button>
              <button
                type="submit"
                form="sale-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed active:scale-95"
              >
                {isSubmitting ? (
                  <>Aguarde... <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></>
                ) : (
                  <>Oficializar Operação <Check size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// RECEIVABLES (INSTALLMENTS)
// -------------------------------------------------------------

function ReceivablesView() {
  const store = useStore();
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [payModalData, setPayModalData] = useState<{ inst: Installment | null, calc: { value: number, interest: number, daysLate: number } | null }>({ inst: null, calc: null });
  const [manualPayValue, setManualPayValue] = useState('');

  const setQuickRange = (type: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date();
    if (type === 'today') {
      const d = format(now, 'yyyy-MM-dd');
      setFilterStartDate(d);
      setFilterEndDate(d);
    } else if (type === 'week') {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      setFilterStartDate(format(start, 'yyyy-MM-dd'));
      setFilterEndDate(format(end, 'yyyy-MM-dd'));
    } else if (type === 'month') {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      setFilterStartDate(format(start, 'yyyy-MM-dd'));
      setFilterEndDate(format(end, 'yyyy-MM-dd'));
    } else {
      setFilterStartDate('');
      setFilterEndDate('');
    }
  };

  const filtered = store.installments.filter(i => {
    const cust = store.customers.find(c => c.id === i.customerId);
    const searchMatch = cust?.name.toLowerCase().includes(filterCustomer.toLowerCase());

    const status = store.getDynamicInstallmentStatus(i);
    const statusMatch = filterStatus === 'ALL' || status === filterStatus;

    const dueDate = parseISO(i.dueDate);
    const dateMatch = (!filterStartDate || dueDate >= parseISO(filterStartDate)) &&
      (!filterEndDate || dueDate <= parseISO(filterEndDate));

    return searchMatch && statusMatch && dateMatch;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const openPayModal = (inst: Installment) => {
    const sale = store.sales.find(s => s.id === inst.saleId);
    if (!sale) return;
    const calc = store.getCalculatedValue(sale, inst);
    setPayModalData({ inst, calc });
    setManualPayValue(calc.value.toFixed(2));
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (payModalData.inst) {
      store.markInstallmentPaid(payModalData.inst.id, parseFloat(manualPayValue));
      setPayModalData({ inst: null, calc: null });
    }
  };

  const totalsFilteredResult = filtered.reduce((acc, i) => {
    const sale = store.sales.find(s => s.id === i.saleId);
    if (!sale) return acc;
    const status = store.getDynamicInstallmentStatus(i);
    if (status === 'PAGO') return acc;
    const calc = store.getCalculatedValue(sale, i);
    return acc + calc.value;
  }, 0);

  return (
<div className="max-w-6xl mx-auto h-full flex flex-col animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Cobranças e Recebimentos</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 space-y-4">
          {/* Row 1: Search and Status */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-[10px] text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={filterCustomer}
                onChange={e => setFilterCustomer(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm font-medium text-slate-700"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PENDENTE">No Prazo</option>
              <option value="ATRASADO">Atrasados</option>
              <option value="PAGO">Pagos</option>
            </select>
          </div>

          {/* Row 2: Date Filters & Quick Actions */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm w-full lg:w-auto">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
                className="text-xs border-none focus:ring-0 p-1 text-slate-600 outline-none bg-transparent"
                title="Data Início"
              />
              <span className="text-slate-300 text-xs px-1">até</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
                className="text-xs border-none focus:ring-0 p-1 text-slate-600 outline-none bg-transparent"
                title="Data Fim"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full no-scrollbar">
              <button onClick={() => setQuickRange('today')} className="whitespace-nowrap px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm">Hoje</button>
              <button onClick={() => setQuickRange('week')} className="whitespace-nowrap px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm">Esta Semana</button>
              <button onClick={() => setQuickRange('month')} className="whitespace-nowrap px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm">Este Mês</button>
              <button onClick={() => setQuickRange('all')} className="whitespace-nowrap px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors shadow-sm">Limpar</button>
            </div>
            
            <div className="hidden lg:flex flex-1 justify-end text-sm text-slate-600 items-center">
              Espectativa de Recebimento do filtro:&nbsp;<span className="font-bold text-emerald-700 text-base">{formatCurrency(totalsFilteredResult)}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 border-b border-slate-200 z-10 shadow-sm">
              <tr>
                <th className="py-3 px-6 w-32">Vencimento</th>
                <th className="py-3 px-6">Devedor (Cliente)</th>
                <th className="py-3 px-6">Produto / Parcela</th>
                <th className="py-3 px-6">Montante Devido</th>
                <th className="py-3 px-6 text-center">Status Operacional</th>
                <th className="py-3 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">Maravilha! Zero títulos encontrados para este cenário.</td></tr>
              ) : (
                filtered.map(i => {
                  const cust = store.customers.find(c => c.id === i.customerId);
                  const sale = store.sales.find(s => s.id === i.saleId);
                  const status = store.getDynamicInstallmentStatus(i);
                  const calc = sale ? store.getCalculatedValue(sale, i) : { value: i.originalValue, interest: 0, daysLate: 0 };

                  return (
                    <tr key={i.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className={`py-4 px-6 ${status === 'ATRASADO' ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                        {format(parseISO(i.dueDate), 'dd/MM/yyyy')}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{cust?.name || '---'}</td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-1 py-0.5 rounded mr-2 text-slate-600">{i.number}/{sale?.installCount || 1}</span>
                        <span className="truncate max-w-[150px] inline-block align-bottom" title={sale?.product}>{sale?.product}</span>
                      </td>
                      <td className="py-4 px-6">
                        {status === 'PAGO' ? (
                          <span className="text-emerald-700 font-semibold line-through opacity-70 decoration-1">{formatCurrency(i.paidValue || i.originalValue)}</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-base">{formatCurrency(calc.value)}</span>
                            {calc.interest > 0 && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">+{formatCurrency(calc.interest)} juros p.</span>}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {status === 'PAGO' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none bg-emerald-100 text-emerald-800"><Check size={12} strokeWidth={3} /> LIQUIDADO</span>}
                        {status === 'PENDENTE' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none bg-indigo-50 text-indigo-700 border border-indigo-100"><Calendar size={12} strokeWidth={3} /> NO PRAZO</span>}
                        {status === 'ATRASADO' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none bg-red-100 text-red-800 animate-pulse"><AlertCircle size={12} strokeWidth={3} /> {calc.daysLate}d ATRASO</span>}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {status !== 'PAGO' ? (
                          <div className="flex flex-col gap-2 items-end">
                            <button onClick={() => openPayModal(i)} className="text-sm font-semibold text-emerald-700 hover:text-white border border-emerald-200 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-all shadow-sm group-hover:shadow focus:ring-2 focus:ring-offset-1 focus:ring-emerald-600 w-full whitespace-nowrap">
                              Baixar Conta
                            </button>
                            {sale?.modalidade === 'so_juros' && !sale?.principalPago && (
                              <button onClick={() => { if (confirm('Tem certeza que deseja quitar o capital principal desta operação? Isso removerá as cobranças futuras de juros e encerrará a dívida principal.')) store.quitarCapitalPrincipal(sale.id); }} className="text-xs font-semibold text-amber-700 hover:text-white border border-amber-200 hover:bg-amber-600 px-4 py-1.5 rounded-lg transition-all shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-amber-600 w-full whitespace-nowrap">
                                Quitar Capital
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium uppercase mt-1 block">Pago em {i.paidDate ? format(parseISO(i.paidDate), 'dd/MM') : ''}</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {payModalData.inst && payModalData.calc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-emerald-500 text-white flex justify-between items-center shadow-inner">
              <h2 className="text-lg font-bold flex items-center gap-2"><Check size={20} strokeWidth={3} className="text-emerald-100" /> Confirmar Recebimento</h2>
            </div>
            <form onSubmit={handlePay} className="p-6 space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-slate-100 rounded-bl-full -z-10 bg-opacity-50"></div>

                <div className="flex justify-between text-sm mb-2 text-slate-600">
                  <span>Valor de Balcão (Original):</span>
                  <span className="font-medium">{formatCurrency(payModalData.inst.originalValue)}</span>
                </div>
                {payModalData.calc.daysLate > 0 && (
                  <div className="flex justify-between text-sm mb-2 text-red-600 font-medium bg-red-50 p-1.5 rounded">
                    <span>Multa Atraso ({payModalData.calc.daysLate} dias):</span>
                    <span>+{formatCurrency(payModalData.calc.interest)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end font-extrabold text-slate-900 pt-3 mt-3 border-t border-slate-200">
                  <span className="text-sm">Recálculo Total:</span>
                  <span className="text-xl">{formatCurrency(payModalData.calc.value)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Qual valor exato foi repassado pelo cliente? (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-[10px] font-bold text-slate-400">R$</span>
                  <input required type="number" step="0.01" value={manualPayValue} onChange={e => setManualPayValue(e.target.value)} className="w-full border-2 border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xl font-bold focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 transition-all outline-none" />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">Você pode abater o valor alterando-o aqui caso conceda algum desconto presencial.</p>
              </div>

              <div className="pt-2 flex justify-end gap-3 flex-col sm:flex-row mt-6">
                <button type="button" onClick={() => setPayModalData({ inst: null, calc: null })} className="w-full px-4 py-3 flex justify-center text-sm text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Abortar Operação</button>
                <button type="submit" className="w-full px-4 py-3 flex justify-center text-sm text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">Dar Quitação Plena</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------------

function ProductsView() {
  const store = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    costPrice: '',
    sellPrice: '',
    stock: '',
    barcode: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(formData.costPrice.replace(',', '.'));
    const sell = parseFloat(formData.sellPrice.replace(',', '.'));
    const stock = parseInt(formData.stock);

    const payload = {
      name: formData.name,
      costPrice: isNaN(cost) ? undefined : cost,
      sellPrice: isNaN(sell) ? undefined : sell,
      stock: isNaN(stock) ? undefined : stock,
      barcode: formData.barcode || undefined
    };

    if (formData.id) {
      store.updateProduct(formData.id, payload);
    } else {
      store.addProduct(payload);
    }

    setIsModalOpen(false);
  };

  const openEdit = (p: any) => {
    setFormData({
      id: p.id,
      name: p.name,
      costPrice: p.costPrice?.toString() || '',
      sellPrice: p.sellPrice?.toString() || '',
      stock: p.stock?.toString() || '',
      barcode: p.barcode || ''
    });
    setIsModalOpen(true);
  };

  const openNew = () => {
    setFormData({ id: '', name: '', costPrice: '', sellPrice: '', stock: '', barcode: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Catálogo de Produtos</h1>
        <button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Cadastrar Produto
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Produto</th>
                <th className="py-3 px-6">Código (EAN)</th>
                <th className="py-3 px-6 text-right">Preço de Venda</th>
                <th className="py-3 px-6 text-right">Estoque</th>
                <th className="py-3 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {store.products.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Nenhum produto cadastrado.</td></tr>
              ) : (
                store.products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-6 font-medium text-slate-900">{p.name}</td>
                    <td className="py-3 px-6">{p.barcode || '-'}</td>
                    <td className="py-3 px-6 text-right font-medium text-emerald-600">{p.sellPrice ? formatCurrency(p.sellPrice) : '-'}</td>
                    <td className="py-3 px-6 text-right">{p.stock !== undefined ? p.stock : '-'}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-emerald-600 p-1" title="Editar"><Pencil size={16} /></button>
                        <button onClick={() => { if (confirm('Apagar este produto? As vendas não serão afetadas.')) store.deleteProduct(p.id); }} className="text-slate-400 hover:text-red-500 p-1" title="Deletar"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800"><Package size={18} className="text-emerald-600" /> {formData.id ? 'Editar' : 'Novo'} Produto</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              <form id="product-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preço de Venda</label>
                    <input type="number" step="0.01" value={formData.sellPrice} onChange={e => setFormData({ ...formData, sellPrice: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Custo</label>
                    <input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({ ...formData, costPrice: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estoque</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cód. Barras</label>
                    <input type="text" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm" />
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" form="product-form" className="px-5 py-2 text-sm text-white font-medium bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">Salvar Produto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// CONFIGURAÇÕES
// -------------------------------------------------------------

function SettingsView() {
  const store = useStore();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    const { logout } = await import('./login/actions');
    await logout();
  };

  const handleDeleteAccount = async () => {
    const first = confirm('⚠️ ATENÇÃO: Você está prestes a EXCLUIR SUA CONTA e TODOS os seus dados (clientes, vendas, parcelas, produtos). Esta ação é IRREVERSÍVEL.\n\nDeseja continuar?');
    if (!first) return;
    const second = confirm('🚨 ÚLTIMA CONFIRMAÇÃO: Todos os dados serão apagados permanentemente e NÃO poderão ser recuperados.\n\nDigite OK para confirmar.');
    if (!second) return;
    setDeleteLoading(true);
    const { deleteAccount } = await import('./login/actions');
    await deleteAccount();
  };

  const profileName = store.profile?.fullName || '';
  const profileEmail = store.profile?.email || '';
  const profileDocument = store.profile?.document || '';

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col animate-in fade-in duration-200 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie as preferências da sua conta e os dados do aplicativo.</p>
      </div>

      <div className="space-y-6">

        {/* Seção Conta Pessoal */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCircle size={18} className="text-emerald-600" />
              <h2 className="font-semibold text-slate-800">Conta Pessoal</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  defaultValue={profileName}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  defaultValue={profileEmail}
                  readOnly
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 outline-none shadow-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  defaultValue={profileDocument}
                  readOnly
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 outline-none shadow-sm cursor-not-allowed"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>

        {/* Seção Perfil/Negócio */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Building2 size={18} className="text-emerald-600" />
            <h2 className="font-semibold text-slate-800">Dados do Negócio</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Estabelecimento</label>
                <input
                  type="text"
                  placeholder="Ex: Minha Loja"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ / CPF</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                <Save size={16} /> Salvar Dados do Negócio
              </button>
            </div>
          </div>
        </div>

        {/* Seção Segurança */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Lock size={18} className="text-emerald-600" />
            <h2 className="font-semibold text-slate-800">Segurança</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha Atual</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                <Lock size={16} /> Atualizar Senha
              </button>
            </div>
          </div>
        </div>

        {/* Seção Banco de Dados / Backup */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Database size={18} className="text-emerald-600" />
            <h2 className="font-semibold text-slate-800">Backup e Dados</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-4">
              Seus dados são salvos com segurança na nuvem (Supabase). Você pode exportá-los para visualizar no Excel ou importar de um backup local.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => store.exportToCSV()}
                className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <FileDown size={16} /> Exportar Backup (CSV)
              </button>
              <button
                onClick={() => {
                  const str = prompt('Cole o texto do JSON salvo: (CUIDADO: Isto poderá sobrescrever os dados atuais)');
                  if (str) store.importFromJSON(str);
                }}
                className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Import size={16} /> Importar Backup (JSON)
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto disabled:opacity-50"
              >
                {deleteLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleteLoading ? 'Excluindo...' : 'EXCLUIR CONTA / APAGAR OS DADOS'}
              </button>
              <p className="text-xs text-red-500 mt-2">Esta ação é irreversível. Todos os seus clientes, vendas, parcelas e produtos serão apagados permanentemente.</p>
            </div>
          </div>
        </div>

        {/* Sair da Conta */}
        <div className="bg-red-50 border border-red-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-red-800">Encerrar Sessão</h2>
              <p className="text-sm text-red-600 mt-1">Sair da sua conta Fiadopag com segurança neste dispositivo.</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {logoutLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              {logoutLoading ? 'Saindo...' : 'Sair da Conta'}
            </button>
          </div>
        </div>

        {/* Seção Sobre */}
        <div className="bg-transparent pt-4 pb-8 flex items-center justify-center text-center">
          <div>
            <div className="flex items-center justify-center gap-2 mb-2 text-slate-400">
              <Wallet size={20} />
              <span className="font-bold tracking-tight text-lg">Fiadopag</span>
            </div>
            <p className="text-xs text-slate-400">Versão 1.2.0 (Cloud-First)</p>
            <p className="text-xs text-slate-400 mt-1">© 2026 Fiadopag. Todos os direitos reservados.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

