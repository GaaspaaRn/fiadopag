import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Wallet, Trash2, Save, FileDown, Import, Database, Building2, UserCircle, Lock, LogOut } from 'lucide-react';

export function SettingsView() {
  const store = useStore();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    const { logout } = await import('../../app/login/actions');
    await logout();
  };

  const handleDeleteAccount = async () => {
    const first = confirm('⚠️ ATENÇÃO: Você está prestes a EXCLUIR SUA CONTA e TODOS os seus dados (clientes, vendas, parcelas, produtos). Esta ação é IRREVERSÍVEL.\n\nDeseja continuar?');
    if (!first) return;
    const second = confirm('🚨 ÚLTIMA CONFIRMAÇÃO: Todos os dados serão apagados permanentemente e NÃO poderão ser recuperados.\n\nDigite OK para confirmar.');
    if (!second) return;
    setDeleteLoading(true);
    const { deleteAccount } = await import('../../app/login/actions');
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
