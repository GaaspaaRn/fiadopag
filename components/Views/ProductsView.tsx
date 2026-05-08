import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/format';
import { Plus, Trash2, Pencil, Package } from 'lucide-react';

export function ProductsView() {
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800"><Package size={18} className="text-emerald-600" /> {formData.id ? 'Editar' : 'Novo'} Produto</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
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
