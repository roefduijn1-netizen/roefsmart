import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Target, LogOut } from 'lucide-react';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { AurumLayout } from '@/components/layout/AurumLayout';
import { Button } from '@/components/ui/button';
export function ProfilePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('aurum_user_id');
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api<User>(`/api/users/${userId}`),
    enabled: !!userId,
  });
  const handleLogout = () => {
    localStorage.removeItem('aurum_user_id');
    navigate('/auth');
  };
  if (!user) return null;
  const totalTests = user.tests.length;
  const totalSessions = user.tests.reduce((acc, t) => acc + t.sessions.length, 0);
  const completedSessions = user.tests.reduce((acc, t) => acc + t.sessions.filter(s => s.isCompleted).length, 0);
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  return (
    <AurumLayout>
      <div className="px-6 py-8 md:py-12 max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:gap-8 mb-12">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-amber-500/20 flex items-center justify-center mb-4 md:mb-0 shadow-xl overflow-hidden flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl md:text-4xl font-display font-bold text-amber-400">
                {user.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="text-center md:text-left md:pt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-neutral-500 text-sm mb-4">Student • Lid sinds {new Date(user.createdAt || Date.now()).getFullYear()}</p>
            <div className="hidden md:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                    Premium Lid
                </span>
            </div>
          </div>
        </div>
        {/* Stats Grid - Reduced to 2 columns as requested */}
        <div className="grid grid-cols-2 gap-4 mb-12 max-w-2xl">
          <StatCard
            icon={<Target className="w-5 h-5 text-amber-400" />}
            label="Actieve Toetsen"
            value={totalTests.toString()}
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-amber-400" />}
            label="Voltooid"
            value={`${completionRate}%`}
          />
        </div>
        {/* Account Section */}
        <div className="max-w-2xl mx-auto md:mx-0 space-y-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Account Details</h3>
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 pb-4 border-b border-white/5">
              <span className="text-neutral-400 text-sm">E-mailadres</span>
              <span className="text-white text-sm font-medium">{user.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-neutral-400 text-sm">Registratiedatum</span>
              <span className="text-white text-sm font-medium">{new Date(user.createdAt || Date.now()).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto border-red-900/30 text-red-400 hover:bg-red-950/30 hover:text-red-300 hover:border-red-900/50 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </div>
    </AurumLayout>
  );
}
function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col items-center justify-center text-center gap-3 hover:bg-neutral-900/80 transition-colors group">
      <div className="p-3 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-neutral-500 font-medium">{label}</div>
      </div>
    </div>
  );
}