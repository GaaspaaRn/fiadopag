import React, { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import { SummaryCard } from '@/components/Dashboard/SummaryCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, Plus, AlertCircle, AlertTriangle, Check, Wallet } from 'lucide-react';

interface DashboardViewProps {
  onNewSale: () => void;
  onNewCustomer: () => void;
}

export function DashboardView({ onNewSale, onNewCustomer }: DashboardViewProps) {
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
