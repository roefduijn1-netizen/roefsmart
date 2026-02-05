import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Moon, Sun, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { AurumLayout } from '@/components/layout/AurumLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';
import { toast } from 'sonner';
export function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark, toggleTheme } = useTheme();
  const userId = localStorage.getItem('aurum_user_id');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [name, setName] = useState('');
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api<User>(`/api/users/${userId}`),
    enabled: !!userId,
  });
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatarUrl || '');
      setName(user.name || '');
    }
  }, [user]);
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return api<User>(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Instellingen opgeslagen');
    },
    onError: () => {
      toast.error('Kon instellingen niet opslaan');
    }
  });
  const handleSave = () => {
    if (!userId) return;
    updateUserMutation.mutate({ name, avatarUrl });
  };
  if (isLoading) {
    return (
      <AurumLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      </AurumLayout>
    );
  }
  return (
    <AurumLayout>
      <div className="px-6 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Instellingen</h1>
          <p className="text-neutral-400 text-sm">Pas je heiligdom aan.</p>
        </header>
        <section className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              Profiel Uiterlijk
            </h2>
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-neutral-500">
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="avatar-url" className="text-neutral-300">Avatar URL</Label>
                  <Input
                    id="avatar-url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://voorbeeld.nl/afbeelding.png"
                    className="bg-neutral-950/50 border-neutral-800 focus:border-amber-500/50"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="display-name" className="text-neutral-300">Weergavenaam</Label>
                <Input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-neutral-950/50 border-neutral-800 focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
          {/* Appearance Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              {isDark ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
              Thema
            </h2>
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-white font-medium">Donkere Modus</div>
                <div className="text-xs text-neutral-500">Schakel applicatie thema</div>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateUserMutation.isPending}
            className="w-full h-12 bg-amber-500 text-black hover:bg-amber-600 font-medium shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]"
          >
            {updateUserMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Opslaan
              </>
            )}
          </Button>
        </section>
      </div>
    </AurumLayout>
  );
}