import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

interface Props {
  onUnlock: (password: string) => boolean;
  hasPassword: boolean;
}

export function LockScreen({ onUnlock, hasPassword }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hasPassword) {
      if (password.length < 4) {
        setError('Password must be at least 4 characters');
        shake();
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match');
        shake();
        return;
      }
    }

    const ok = onUnlock(password);
    if (!ok) {
      setError('Incorrect password');
      setPassword('');
      shake();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className={`w-full max-w-md animate-fade-in ${shaking ? 'animate-bounce' : ''}`}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-6">
            <Lock className="w-9 h-9 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Vault Journal</h1>
          <p className="text-slate-400 text-sm">
            {hasPassword ? 'Enter your password to unlock' : 'Create a password to secure your journal'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={hasPassword ? 'Your password' : 'Create password'}
              className="w-full bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors pr-12"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {!hasPassword && (
            <input
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="w-full bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          )}

          {error && (
            <p className="text-red-400 text-sm text-center animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {hasPassword ? 'Unlock Journal' : 'Create Journal'}
          </button>
        </form>

        {/* Security note */}
        <div className="mt-8 flex items-center gap-2 text-slate-500 text-xs justify-center">
          <Shield className="w-4 h-4" />
          <span>AES-256 encrypted • Stored locally • Never synced</span>
        </div>
      </div>
    </div>
  );
}
