import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import { simularValoresVenda } from '@/lib/calculos';
import { Plus, Wallet, Check, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SalesViewProps {
  autoOpen?: boolean;
  setAutoOpen?: (v: boolean) => void;
}

export function SalesView({ autoOpen, setAutoOpen }: SalesViewProps) {
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

    return simularValoresVenda(valBase, taxa, parcelas, formData.modalidade);
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Buscar/Criar Cliente *</label>
                      <input
                        required type="text" list="customers-list" placeholder="Nome..."
                        value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                      />
                      <datalist id="customers-list">{store.customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Produto/Serviço *</label>
                      <input
                        required type="text" list="products-list" placeholder="Ex: Perfume"
                        value={formData.product}
                        onChange={e => {
                          const val = e.target.value;
                          const prod = store.products.find(p => p.name === val);
                          if (prod && prod.sellPrice && !formData.totalValue) {
                            setFormData({ ...formData, product: val, totalValue: prod.sellPrice.toString() });
                          } else setFormData({ ...formData, product: val });
                        }}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                      />
                      <datalist id="products-list">{store.products.map(p => <option key={p.id} value={p.name} />)}</datalist>
                    </div>
                  </div>
                </div>

                {/* Section 2: Modality */}
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-1">2. Modelo de Operação</h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    <label className={`cursor-pointer rounded-lg border-2 p-1.5 flex flex-col items-center text-center transition-all ${formData.modalidade === 'fiado' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-emerald-300'}`}>
                      <input type="radio" name="modalidade" value="fiado" checked={formData.modalidade === 'fiado'} onChange={() => setFormData({ ...formData, modalidade: 'fiado', taxaOperacao: '0' })} className="sr-only" />
                      <span className="font-bold text-slate-800 text-[11px] sm:text-sm">Fiado</span>
                      <span className="text-[9px] text-slate-500 leading-tight">Sem juros</span>
                    </label>
                    <label className={`cursor-pointer rounded-lg border-2 p-1.5 flex flex-col items-center text-center transition-all ${formData.modalidade === 'carne' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-emerald-300'}`}>
                      <input type="radio" name="modalidade" value="carne" checked={formData.modalidade === 'carne'} onChange={() => setFormData({ ...formData, modalidade: 'carne' })} className="sr-only" />
                      <span className="font-bold text-slate-800 text-[11px] sm:text-sm">Carnê</span>
                      <span className="text-[9px] text-slate-500 leading-tight">Juros Simples</span>
                    </label>
                    <label className={`cursor-pointer rounded-lg border-2 p-1.5 flex flex-col items-center text-center transition-all ${formData.modalidade === 'so_juros' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-emerald-300'}`}>
                      <input type="radio" name="modalidade" value="so_juros" checked={formData.modalidade === 'so_juros'} onChange={() => setFormData({ ...formData, modalidade: 'so_juros', frequencia: 'mensal' })} className="sr-only" />
                      <span className="font-bold text-slate-800 text-[11px] sm:text-sm">Só Juros</span>
                      <span className="text-[9px] text-slate-500 leading-tight">Empréstimo</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className={formData.modalidade === 'fiado' ? 'col-span-2' : ''}>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Valor Principal (R$)</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-[7px] font-bold text-slate-400 text-sm">R$</span>
                        <input required type="number" step="0.01" min="0" placeholder="0.00" value={formData.totalValue} onChange={e => setFormData({ ...formData, totalValue: e.target.value })} className="w-full border-2 border-slate-300 rounded-lg pl-8 pr-2 py-1.5 text-sm font-bold focus:border-emerald-600 outline-none text-slate-900" />
                      </div>
                    </div>

                    {formData.modalidade !== 'fiado' && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="block text-[11px] font-bold text-emerald-700 mb-1">Juros Capital (%)</label>
                        <input required type="number" step="0.1" min="0" placeholder="Ex: 10" value={formData.taxaOperacao} onChange={e => setFormData({ ...formData, taxaOperacao: e.target.value })} className="w-full border-2 border-emerald-200 rounded-lg px-2 py-1.5 text-sm focus:border-emerald-600 outline-none font-bold text-slate-900" />
                      </div>
                    )}
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
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Multa por Atraso (%)</label>
                      <div className="relative">
                        <input required type="number" step="0.1" min="0" value={formData.interestRate} onChange={e => setFormData({ ...formData, interestRate: e.target.value })} className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-600 outline-none pr-10" />
                        <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold">PRO-RATA</span>
                      </div>
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

                  {/* Multa por Atraso was moved inside the grid above */}

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
