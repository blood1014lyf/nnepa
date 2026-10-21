/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, LogIn, Lock, User } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLoginView({ onLoginSuccess }: AdminLoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.token);
      } else {
        setError(data.error || 'Access denied. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection to Express database failed. Check dev logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-[75vh] flex items-center justify-center bg-pearl px-6" id="admin-login-view">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-md shadow-[0_12px_40px_rgba(92,61,110,0.05)] border border-lilac/12 animate-fade-in">
        
        {/* Editorial Heading */}
        <div className="text-center mb-8">
          <span className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-lavender block mb-2">
            Luxury Administrative Desk
          </span>
          <h2 className="font-serif text-3xl text-plum-dark font-light">
            Sign In
          </h2>
          <div className="w-12 h-[1px] bg-gradient-to-r from-lavender to-mauve mx-auto mt-4" />
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-700 p-4.5 rounded mb-6 text-xs flex gap-3 items-center">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Username Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-lavender" />
              Username ID
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-lavender" />
              Security Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-gradient-to-br from-lavender via-mauve to-mauve-deep text-white text-[0.62rem] font-bold tracking-[0.22em] uppercase rounded-[2px] border-none cursor-pointer shadow-md transition-all mt-4 hover:opacity-95 text-center flex items-center justify-center gap-2.5 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <LogIn className="w-4 h-4 text-white" />
            {loading ? 'Authenticating...' : 'Access Control Panel'}
          </button>
        </form>

        <div className="mt-5 text-center select-none">
          <p className="text-[0.66rem] text-text-light leading-normal leading-relaxed">
            Secure admin portal. Only authorized personnel may access.
            Please enter your provided credentials.
          </p>
        </div>

      </div>
    </div>
  );
}
