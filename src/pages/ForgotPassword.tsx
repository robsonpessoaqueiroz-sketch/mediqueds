import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { PillIcon, ArrowLeftIcon, CheckIcon } from '@/components/icons';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('E-mail é obrigatório.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('E-mail inválido.');
      return;
    }

    setLoading(true);

    // Allow forcing the frontend URL via environment variable (useful for production)
    const frontendUrl = (import.meta.env.VITE_APP_URL as string) || window.location.origin;

    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/reset-password`,
    });

    setLoading(false);

    if (supabaseError) {
      setError(supabaseError.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-200 mb-4">
            <PillIcon width={32} height={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">MediQueds</h1>
          <p className="text-slate-500 text-sm mt-1">Seu controle de medicamentos</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          {sent ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <CheckIcon width={32} height={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">E-mail enviado!</h2>
              <p className="text-slate-500 text-sm mb-6">
                Enviamos um link de recuperação para <strong className="text-slate-700">{email}</strong>.
                Verifique sua caixa de entrada e siga as instruções.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
              >
                <ArrowLeftIcon width={16} height={16} />
                Voltar para o login
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Recuperar senha</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Informe seu e-mail e enviaremos um link de recuperação.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className={`w-full px-4 py-2.5 rounded-lg border text-slate-800 placeholder-slate-400 text-sm outline-none transition-all
                      focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                      ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg shadow-md shadow-teal-200 hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar link de recuperação'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
                >
                  <ArrowLeftIcon width={16} height={16} />
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
