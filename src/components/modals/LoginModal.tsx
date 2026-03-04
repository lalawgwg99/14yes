import React, { useState } from 'react';
import { Language } from '../../lib/types';

interface Props {
  lang: Language;
  onClose: () => void;
  onLogin: (email: string) => Promise<boolean>;
}

export const LoginModal: React.FC<Props> = ({ lang, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setLoading(true);
    setError('');
    const ok = await onLogin(email);
    setLoading(false);
    if (ok) {
      setSent(true);
    } else {
      setError(lang === 'zh-TW' ? '發送失敗，請重試' : 'Failed to send, please retry');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold serif-tc mb-2">
          {lang === 'zh-TW' ? '登入 NEXUS Finance' : 'Sign in to NEXUS Finance'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {lang === 'zh-TW' ? '輸入您的 Email，我們將寄送登入連結' : "Enter your email and we'll send a sign-in link"}
        </p>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-bold">
              {lang === 'zh-TW' ? '已發送！請查看您的信箱。' : 'Sent! Check your inbox.'}
            </p>
            <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-black">
              {lang === 'zh-TW' ? '關閉' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:border-ink focus:ring-0 outline-none"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.includes('@')}
              className="w-full editorial-btn py-3 text-xs font-bold tracking-[0.25em] disabled:opacity-50"
            >
              {loading
                ? (lang === 'zh-TW' ? '發送中...' : 'Sending...')
                : (lang === 'zh-TW' ? '發送登入連結' : 'Send Sign-in Link')
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
