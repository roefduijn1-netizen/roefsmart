import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { toast } from 'sonner';
import { AurumLayout } from '@/components/layout/AurumLayout';
export function AuthPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const user = await api<User>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ email, name })
      });
      localStorage.setItem('aurum_user_id', user.id);
      toast.success(`Welkom terug, ${user.name}`);
      navigate('/');
    } catch (error) {
      toast.error('Inloggen mislukt. Probeer het opnieuw.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AurumLayout showNav={false}>
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">
            Aurum Study
          </h1>
          <p className="text-neutral-400 text-lg font-light">
            Academische excellentie, verfijnd.
          </p>
        </motion.div>
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4"
        >
          <div className="space-y-2 text-left">
            <Input
              placeholder="Jouw Naam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-neutral-900/50 border-neutral-800 focus:border-amber-500/50 transition-colors"
            />
            <Input
              type="email"
              placeholder="E-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-neutral-900/50 border-neutral-800 focus:border-amber-500/50 transition-colors"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-medium bg-amber-500 hover:bg-amber-600 text-black transition-all duration-300 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]"
          >
            {isLoading ? 'Ontgrendelen...' : 'Betreed Heiligdom'}
            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </motion.form>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-xs text-neutral-600"
        >
          Door binnen te gaan, committeer je je aan focus en discipline.
        </motion.p>
      </div>
    </AurumLayout>
  );
}