import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Installment } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Search, Calendar, Check, AlertCircle } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function ReceivablesView() {
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
