import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';
import { EyeIcon, EyeOffIcon } from '@/components/icons/EyeIcon';
import { PillIcon, CheckIcon } from '@/components/icons';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [validSession, setValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check for Supabase recovery/session info in the URL hash (access_token, error, etc.)
    const handleSession = async () => {
      try {
        const hash = window.location.hash || '';

        if (hash) {
          // Convert fragment string to query-like so we can read params
          const params = new URLSearchParams(hash.replace('#', '?'));

          // If Supabase returned an error in hash, show it
          if (params.get('error')) {
            const desc = params.get('error_description') || params.get('error');
            setErrors((prev) => ({ ...prev, general: decodeURIComponent(desc || '') }));
            setCheckingSession(false);
            return;
          }

          // If we have an access token or type=recovery try to let Supabase process the URL
          if (params.get('access_token') || params.get('type') === 'recovery') {
            // Prefer built-in helper if available
            try {
              if (typeof (supabase.auth as any).getSessionFromUrl === 'function') {
                await (supabase.auth as any).getSessionFromUrl({ storeSession: true });
              }
            } catch (e) {
              // ignore - some clients may not expose getSessionFromUrl
            }
          }
        }

        // Now check if there's an authenticated session
        const { data } = await supabase.auth.getSession();
        if (data && data.session) {
          setValidSession(true);
        } else {
          // fall back to listening for auth state change for a short period
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            if (session) setValidSession(true);
          });

          setTimeout(async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData && sessionData.session) setValidSession(true);
            setCheckingSession(false);
            try {
              subscription.unsubscribe();
            } catch (e) {}
          }, 1500);
          return;
        }

        setCheckingSession(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setCheckingSession(false);
      }
    };

    handleSession();
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!password) newErrors.password = 'Nova senha é obrigatória.';
    else if (password.length < 8) newErrors.password = 'A senha deve ter no mínimo 8 caracteres.';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirmação de senha é obrigatória.';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrors({ general: error.message });
      setLoading(false);
      return;
    }

    setSuccess(true);
    showToast('Senha redefinida com sucesso!', 'success');
    setTimeout(() => navigate('/login'), 3000);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Verificando sessão...</p>
        </div>
      </div>
    );
  }

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
          {success ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <CheckIcon width={32} height={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Senha redefinida!</h2>
              <p className="text-slate-500 text-sm">
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
            </div>
          ) : !validSession ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Link inválido</h2>
              <p className="text-slate-500 text-sm mb-6">
                Este link de recuperação é inválido ou expirou. Solicite um novo link.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
              >
                Solicitar novo link
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Redefinir senha</h2>
                <p className="text-slate-500 text-sm mt-1">Escolha uma nova senha para sua conta.</p>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-slate-800 placeholder-slate-400 text-sm outline-none transition-all
                        focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                        ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-slate-800 placeholder-slate-400 text-sm outline-none transition-all
                        focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                        ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg shadow-md shadow-teal-200 hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </span>
                  ) : (
                    'Redefinir senha'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
