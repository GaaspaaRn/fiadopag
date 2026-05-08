'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { addMonths, parseISO } from 'date-fns';
import { supabase } from './supabase';
import { calcularValorComAtraso, obterStatusDinamicoParcela } from './calculos';

import { Product, Customer, Sale, InstallmentStatus, Installment } from './types';

type StoreState = { 
  customers: Customer[]; 
  sales: Sale[]; 
  installments: Installment[]; 
  products: Product[]; 
  profile: { expiresAt: string | null; fullName: string; email: string; document: string } | null;
  isLoaded: boolean; 
};

type StoreContextType = StoreState & {
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => Promise<string>;
  updateCustomer: (id: string, c: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => Promise<string>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (s: Omit<Sale, 'id' | 'createdAt' | 'lucroOperacao' | 'valorTotalFinanciado' | 'principalPago'>) => Promise<string | void>;
  markInstallmentPaid: (id: string, paidValue: number) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  getDynamicInstallmentStatus: (inst: Installment) => InstallmentStatus;
  getCalculatedValue: (sale: Sale, inst: Installment) => { value: number; interest: number; daysLate: number };
  exportToCSV: () => void;
  importFromJSON: (json: string) => void;
  clearAllData: () => void;
  quitarCapitalPrincipal: (saleId: string) => Promise<void>;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>({ customers: [], sales: [], installments: [], products: [], profile: null, isLoaded: false });

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(s => ({ ...s, isLoaded: true }));
        return;
      }

      const [custRes, prodRes, saleRes, instRes, profileRes] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('installments').select('*').order('data_vencimento', { ascending: true }),
        supabase.from('profiles').select('expires_at').maybeSingle()
      ]);
      const meta = user?.user_metadata || {};

      setState({
        isLoaded: true,
        profile: {
          expiresAt: profileRes.data?.expires_at || null,
          fullName: meta.full_name || '',
          email: user?.email || '',
          document: meta.document || '',
        },
        customers: (custRes.data || []).map(c => ({ id: c.id, name: c.nome, phone: c.telefone, documentNumber: c.documento, address: c.endereco, notes: c.obs, createdAt: c.created_at })),
        products: (prodRes.data || []).map(p => ({ id: p.id, name: p.nome, costPrice: p.preco_custo, sellPrice: p.preco_venda, stock: p.estoque, barcode: p.ean, createdAt: p.created_at })),
        sales: (saleRes.data || []).map(s => ({
          id: s.id, customerId: s.customer_id, product: s.product_nome, totalValue: s.valor_base, installCount: s.qtd_parcelas, startDate: s.created_at, interestRate: s.taxa_atraso, notes: '', createdAt: s.created_at,
          modalidade: s.modalidade, taxaOperacao: s.taxa_operacao, valorTotalFinanciado: s.valor_total_financiado, lucroOperacao: s.lucro_operacao, principalPago: s.principal_pago, frequencia: s.frequencia
        })),
        installments: (instRes.data || []).map(i => {
          const parentSale = (saleRes.data || []).find(s => s.id === i.sale_id);
          return {
            id: i.id,
            saleId: i.sale_id,
            customerId: parentSale ? parentSale.customer_id : '',
            number: i.numero,
            dueDate: i.data_vencimento,
            originalValue: i.valor_original,
            status: i.status === 'pendente' ? 'PENDENTE' : i.status === 'pago' ? 'PAGO' : 'ATRASADO',
            paidDate: i.data_pagamento,
            paidValue: i.valor_original, // Note: Should ideally use a paid_value column if available, but for now matching original
            tipo: i.tipo
          };
        })
      });
    } catch (error) {
      console.error("Error fetching from Supabase", error);
      setState(s => ({ ...s, isLoaded: true }));
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addCustomer = async (c: Omit<Customer, 'id' | 'createdAt'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return '';

    const { data } = await supabase.from('customers').insert({ 
      nome: c.name, 
      telefone: c.phone, 
      documento: c.documentNumber, 
      endereco: c.address, 
      obs: c.notes,
      user_id: user.id 
    }).select().single();
    if (data) {
      const newCust = { id: data.id, name: data.nome, phone: data.telefone, documentNumber: data.documento, address: data.endereco, notes: data.obs, createdAt: data.created_at };
      setState(s => ({ ...s, customers: [newCust, ...s.customers] }));
      return data.id;
    }
    return '';
  };

  const updateCustomer = async (id: string, c: Partial<Customer>) => {
    await supabase.from('customers').update({ nome: c.name, telefone: c.phone, documento: c.documentNumber, endereco: c.address, obs: c.notes }).eq('id', id);
    fetchData();
  };

  const deleteCustomer = async (id: string) => {
    await supabase.from('customers').delete().eq('id', id);
    fetchData();
  };

  const addProduct = async (p: Omit<Product, 'id' | 'createdAt'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return '';

    const { data } = await supabase.from('products').insert({ 
      nome: p.name, 
      preco_venda: p.sellPrice, 
      preco_custo: p.costPrice, 
      estoque: p.stock, 
      ean: p.barcode,
      user_id: user.id
    }).select().single();
    if (data) {
      setState(s => ({ ...s, products: [{ id: data.id, name: data.nome, costPrice: data.preco_custo, sellPrice: data.preco_venda, stock: data.estoque, barcode: data.ean, createdAt: data.created_at }, ...s.products] }));
      return data.id;
    }
    return '';
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    await supabase.from('products').update({ nome: p.name, preco_venda: p.sellPrice, preco_custo: p.costPrice, estoque: p.stock, ean: p.barcode }).eq('id', id);
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const addSale = async (s: Omit<Sale, 'id' | 'createdAt' | 'lucroOperacao' | 'valorTotalFinanciado' | 'principalPago'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return '';

    let valorTotal = s.totalValue;
    let lucro = 0;
    
    if (s.modalidade === 'carne') {
      lucro = s.totalValue * (s.taxaOperacao / 100);
      valorTotal = s.totalValue + lucro;
    } else if (s.modalidade === 'so_juros') {
      lucro = 0; // Lucro mensal será cobrado nas parcelas
      valorTotal = s.totalValue;
    }

    const { data: saleData } = await supabase.from('sales').insert({
      customer_id: s.customerId, 
      product_nome: s.product, 
      valor_base: s.totalValue, 
      qtd_parcelas: s.installCount, 
      frequencia: s.frequencia, 
      modalidade: s.modalidade, 
      taxa_operacao: s.taxaOperacao, 
      taxa_atraso: s.interestRate, 
      valor_total_financiado: valorTotal, 
      lucro_operacao: lucro, 
      principal_pago: false,
      user_id: user.id
    }).select().single();

    if (saleData) {
      const inserts = [];
      let currentDate = parseISO(s.startDate);

      if (s.modalidade === 'so_juros') {
        const jurosMensal = s.totalValue * (s.taxaOperacao / 100);
        for (let i = 1; i <= s.installCount; i++) { // Generate X months of interest
          inserts.push({ sale_id: saleData.id, numero: i, data_vencimento: currentDate.toISOString().split('T')[0], tipo: 'somente_juros', valor_original: jurosMensal, status: 'pendente' });
          currentDate = addMonths(currentDate, 1);
        }
      } else {
        const valPerInstallment = valorTotal / s.installCount;
        for (let i = 1; i <= s.installCount; i++) {
          inserts.push({ sale_id: saleData.id, numero: i, data_vencimento: currentDate.toISOString().split('T')[0], tipo: 'padrao', valor_original: valPerInstallment, status: 'pendente' });
          if (s.frequencia === 'mensal') currentDate = addMonths(currentDate, 1);
          else if (s.frequencia === 'quinzenal') currentDate = new Date(currentDate.setDate(currentDate.getDate() + 15));
          else if (s.frequencia === 'semanal') currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
        }
      }

      if (inserts.length > 0) {
        await supabase.from('installments').insert(inserts.map(i => ({ ...i, user_id: user.id })));
      }
      fetchData();
    }
  };

  const deleteSale = async (id: string) => {
    await supabase.from('sales').delete().eq('id', id);
    fetchData();
  };

  const markInstallmentPaid = async (id: string, paidValue: number) => {
    await supabase.from('installments').update({ status: 'pago', data_pagamento: new Date().toISOString(), valor_juros_atraso: 0 }).eq('id', id);
    fetchData();
  };

  const quitarCapitalPrincipal = async (saleId: string) => {
    await supabase.from('sales').update({ principal_pago: true }).eq('id', saleId);
    await supabase.from('installments').delete().eq('sale_id', saleId).eq('status', 'pendente');
    fetchData();
  };

  const getDynamicInstallmentStatus = (inst: Installment): InstallmentStatus => {
    return obterStatusDinamicoParcela(inst);
  };

  const getCalculatedValue = (sale: Sale, inst: Installment) => {
    return calcularValorComAtraso(sale, inst);
  };

  const exportToCSV = () => {
    const headers = ['ID Venda', 'Cliente', 'Produto', 'Modalidade', 'Frequencia', 'Valor Financiado (R$)', 'Lucro Projetado (R$)', 'Principal Pago', 'Data Venda'];
    const rows = state.sales.map(s => {
      const cust = state.customers.find(c => c.id === s.customerId)?.name || 'Desconhecido';
      return [
        s.id, `"${cust}"`, `"${s.product}"`, s.modalidade, s.frequencia, 
        s.valorTotalFinanciado.toFixed(2), s.lucroOperacao.toFixed(2), 
        s.principalPago ? 'Sim' : 'Nao', s.startDate.split('T')[0]
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fiadopag_relatorio.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const importFromJSON = (json: string) => {
    alert("A importação via JSON local foi desativada, pois o sistema agora opera em nuvem (Supabase).");
  };
  const clearAllData = async () => {};

  return (
    <StoreContext.Provider value={{ ...state, addCustomer, updateCustomer, deleteCustomer, addSale, markInstallmentPaid, deleteSale, getDynamicInstallmentStatus, getCalculatedValue, exportToCSV, importFromJSON, clearAllData, addProduct, updateProduct, deleteProduct, quitarCapitalPrincipal }}>
      {state.isLoaded ? children : <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Carregando Banco de Dados...</div>}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
