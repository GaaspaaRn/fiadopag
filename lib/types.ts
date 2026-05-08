export type Product = { 
  id: string; 
  name: string; 
  costPrice?: number; 
  sellPrice?: number; 
  stock?: number; 
  barcode?: string; 
  createdAt: string; 
};

export type Customer = { 
  id: string; 
  name: string; 
  phone: string; 
  documentNumber: string; 
  address: string; 
  notes: string; 
  createdAt: string; 
};

export type Sale = {
  id: string; 
  customerId: string; 
  product: string; 
  totalValue: number; 
  installCount: number; 
  startDate: string; 
  interestRate: number; 
  notes: string; 
  createdAt: string;
  modalidade: 'fiado' | 'carne' | 'so_juros'; 
  taxaOperacao: number; 
  valorTotalFinanciado: number; 
  lucroOperacao: number; 
  principalPago: boolean; 
  frequencia: string;
};

export type InstallmentStatus = 'PENDENTE' | 'PAGO' | 'ATRASADO';

export type Installment = {
  id: string; 
  saleId: string; 
  customerId: string; 
  number: number; 
  dueDate: string; 
  originalValue: number; 
  status: InstallmentStatus; 
  paidDate?: string; 
  paidValue?: number;
  tipo: 'padrao' | 'somente_juros' | 'quitacao_principal';
};

export type Tab = 'dashboard' | 'clientes' | 'produtos' | 'vendas' | 'receber' | 'menu' | 'configuracoes';
