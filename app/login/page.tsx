'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { Store, KeyRound, ArrowRight, Loader2, User, FileText, MailCheck } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    // Validações de frontend apenas para o Cadastro
    if (!isLogin) {
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string
      const document = formData.get('document') as string

      if (password !== confirmPassword) {
        setError('As senhas não coincidem.')
        setLoading(false)
        return
      }

      // Remover caracteres especiais para checar tamanho do CPF/CNPJ
      const cleanDoc = document.replace(/\D/g, '')
      if (cleanDoc.length < 11) {
        setError('CPF ou CNPJ inválido (mínimo de 11 dígitos).')
        setLoading(false)
        return
      }
    }
    
    if (isLogin) {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
      // If login succeeds, redirect happens server-side — no need to setLoading(false)
    } else {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else if (result?.success) {
        setSignupSuccess(true)
        setLoading(false)
      }
    }
  }

  // Tela de sucesso do cadastro
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#10b981] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#059669] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-[#10b981]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#10b981]/20">
            <MailCheck className="w-8 h-8 text-[#10b981]" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">Conta criada com sucesso!</h1>
          
          <p className="text-[#a1a1aa] text-sm leading-relaxed mb-8">
            Enviamos um link de confirmação para o seu e-mail. 
            <strong className="text-white"> Abra seu e-mail e clique no link</strong> para ativar sua conta e começar a usar o Fiadopay.
          </p>

          <div className="bg-[#09090b] border border-white/10 rounded-xl p-4 mb-6">
            <p className="text-xs text-[#a1a1aa]">
              💡 Não encontrou? Verifique a pasta de <strong className="text-white">Spam</strong> ou <strong className="text-white">Lixo eletrônico</strong>.
            </p>
          </div>

          <button
            onClick={() => {
              setSignupSuccess(false)
              setIsLogin(true)
              setError(null)
            }}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Já confirmei, fazer login
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-4 text-center text-xs text-white/30">
          Fiadopay © 2026. Todos os direitos reservados.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decoração de Fundo */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#10b981] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#059669] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl mt-8 mb-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#10b981]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#10b981]/20">
            <Store className="w-8 h-8 text-[#10b981]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Fiadopag</h1>
          <p className="text-[#a1a1aa] text-center">
            {isLogin ? 'Bem-vindo de volta! Faça login para continuar.' : 'Crie sua conta para começar a gerenciar.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm">
            {error === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5" htmlFor="fullName">
                  Nome Completo
                </label>
                <div className="relative">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={!isLogin}
                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-white/30 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                    placeholder="Seu nome completo"
                  />
                  <User className="w-5 h-5 text-[#a1a1aa] absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5" htmlFor="document">
                  CPF ou CNPJ
                </label>
                <div className="relative">
                  <input
                    id="document"
                    name="document"
                    type="text"
                    required={!isLogin}
                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-white/30 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                    placeholder="000.000.000-00"
                  />
                  <FileText className="w-5 h-5 text-[#a1a1aa] absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5" htmlFor="email">
              E-mail Válido
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-white/30 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                placeholder="••••••••"
              />
              <KeyRound className="w-5 h-5 text-[#a1a1aa] absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5" htmlFor="confirmPassword">
                Confirme sua Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={!isLogin}
                  className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-white/30 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                  placeholder="••••••••"
                />
                <KeyRound className="w-5 h-5 text-[#a1a1aa] absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Entrar na Conta' : 'Criar Conta'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-[#a1a1aa] text-sm">
            {isLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
              className="text-[#10b981] hover:underline ml-1 font-medium focus:outline-none"
            >
              {isLogin ? 'Criar agora' : 'Fazer login'}
            </button>
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-center text-xs text-white/30">
        Fiadopay © 2026. Todos os direitos reservados.
      </div>
    </div>
  )
}
