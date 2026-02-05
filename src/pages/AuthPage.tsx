import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Crown } from 'lucide-react';
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
      toast.success(`Welkom in ROEFSMART, ${user.name}`);
      navigate('/');
    } catch (error) {
      toast.error('Toegang geweigerd. Probeer het opnieuw.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AurumLayout showNav={false}>
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 relative z-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]">
            <Crown className="w-10 h-10 text-black fill-black/10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-4 tracking-tighter">
            ROEFSMART
          </h1>
          <p className="text-amber-500/80 text-sm font-medium tracking-[0.3em] uppercase">
            Exclusieve Academische Planning
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="luxury-card p-8 rounded-3xl">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-xs text-muted-foreground ml-1 mb-1.5 block font-medium">Naam</label>
                  <Input
                    placeholder="Jouw Naam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="luxury-input h-14 text-lg px-4 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground ml-1 mb-1.5 block font-medium">E-mailadres</label>
                  <Input
                    type="email"
                    placeholder="student@voorbeeld.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="luxury-input h-14 text-lg px-4 rounded-xl"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="luxury-button w-full h-14 text-base rounded-xl mt-4"
              >
                {isLoading ? 'Verifiëren...' : 'Inloggen'}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-xs text-muted-foreground font-light tracking-wide relative z-10"
        >
          Log in om je studieplanning te beheren.
        </motion.p>
      </div>
    </AurumLayout>
  );
}