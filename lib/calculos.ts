import { Installment, Sale, InstallmentStatus } from './types';
import { differenceInDays, isBefore, startOfDay, parseISO } from 'date-fns';

/**
 * Calcula os juros por atraso pro-rata e o valor atualizado da parcela
 */
export function calcularValorComAtraso(sale: Sale, inst: Installment): { value: number; interest: number; daysLate: number } {
  if (inst.status === 'PAGO') {
    return { value: inst.paidValue || inst.originalValue, interest: 0, daysLate: 0 };
  }
  
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(inst.dueDate));
  
  if (!isBefore(due, today)) {
    return { value: inst.originalValue, interest: 0, daysLate: 0 };
  }

  const daysLate = differenceInDays(today, due);
  const divisor = sale.frequencia === 'semanal' ? 7 : sale.frequencia === 'quinzenal' ? 15 : 30;
  const dailyRate = (sale.interestRate / 100) / divisor;
  const interest = parseFloat((inst.originalValue * dailyRate * daysLate).toFixed(2));
  const value = inst.originalValue + interest;

  return { value, interest, daysLate };
}

/**
 * Determina dinamicamente se uma parcela está pendente ou atrasada com base na data de hoje
 */
export function obterStatusDinamicoParcela(inst: Installment): InstallmentStatus {
  if (inst.status === 'PAGO') return 'PAGO';
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(inst.dueDate));
  if (isBefore(due, today)) return 'ATRASADO';
  return 'PENDENTE';
}

/**
 * Simula o cenário financeiro da venda antes da criação no banco de dados.
 * Retorna lucro projetado, valor total financiado, valor de cada parcela e uma breve descrição.
 */
export function simularValoresVenda(
  valorBase: number, 
  taxaMensal: number, 
  quantidadeParcelas: number, 
  modalidade: 'fiado' | 'carne' | 'so_juros'
): { lucro: number; total: number; valParcela: number; desc: string } {
  
  if (modalidade === 'carne') {
    const lucro = valorBase * (taxaMensal / 100);
    const total = valorBase + lucro;
    const valParcela = total / quantidadeParcelas;
    return { lucro, total, valParcela, desc: 'Juros embutidos e divididos nas parcelas.' };
    
  } else if (modalidade === 'so_juros') {
    const lucroMensal = valorBase * (taxaMensal / 100);
    const lucroTotal = lucroMensal * quantidadeParcelas;
    return { 
      lucro: lucroTotal, 
      total: valorBase + lucroTotal, 
      valParcela: lucroMensal, 
      desc: 'O cliente paga só os juros. Capital fica intacto até a quitação.' 
    };
    
  } else {
    // Fiado tradicional
    const valParcela = valorBase / quantidadeParcelas;
    return { 
      lucro: 0, 
      total: valorBase, 
      valParcela, 
      desc: 'Sem juros sobre o capital. Juros apenas por atraso.' 
    };
  }
}
