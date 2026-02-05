import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Flame, Target, LogOut } from 'lucide-react';
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
      <div className="px-6 py-8">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-amber-500/20 flex items-center justify-center mb-4 shadow-xl">
            <span className="text-3xl font-display font-bold text-amber-400">
              {user.name.charAt(0)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-neutral-500 text-sm">Scholar</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard 
            icon={<Target className="w-5 h-5 text-amber-400" />} 
            label="Tests Active" 
            value={totalTests.toString()} 
          />
          <StatCard 
            icon={<Trophy className="w-5 h-5 text-amber-400" />} 
            label="Completion" 
            value={`${completionRate}%`} 
          />
          <StatCard 
            icon={<Flame className="w-5 h-5 text-amber-400" />} 
            label="Sessions Done" 
            value={completedSessions.toString()} 
          />
          <StatCard 
            icon={<Target className="w-5 h-5 text-amber-400" />} 
            label="Total Planned" 
            value={totalSessions.toString()} 
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Account</h3>
          <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-400 text-sm">Email</span>
              <span className="text-white text-sm">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">Member Since</span>
              <span className="text-white text-sm">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full border-red-900/30 text-red-400 hover:bg-red-950/30 hover:text-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </AurumLayout>
  );
}
function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col items-center justify-center text-center gap-2">
      <div className="p-2 rounded-full bg-amber-500/10">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-neutral-500">{label}</div>
      </div>
    </div>
  );
}