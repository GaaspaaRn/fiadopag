import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatPhone } from '@/lib/format';
import { Customer } from '@/lib/types';
import { Search, Plus, Eye, Pencil, Trash2, Users, ShoppingBag } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface CustomersViewProps {
  autoOpen?: boolean;
  setAutoOpen?: (v: boolean) => void;
}

export function CustomersView({ autoOpen, setAutoOpen }: CustomersViewProps) {
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">{formData.id ? 'Editar Cadastro' : 'Novo Cadastro'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
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
