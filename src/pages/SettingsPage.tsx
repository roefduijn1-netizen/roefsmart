import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Moon, Sun, Image as ImageIcon, Loader2, Bell } from 'lucide-react';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { AurumLayout } from '@/components/layout/AurumLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';
import { useNotifications } from '@/hooks/use-notifications';
import { toast } from 'sonner';
export function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark, toggleTheme } = useTheme();
  const { isEnabled: notificationsEnabled, requestPermission } = useNotifications();
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
  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      await requestPermission();
    } else {
      // We can't programmatically revoke permission in browser, but we can tell user
      toast.info('Je kunt meldingen uitschakelen in je browserinstellingen.');
    }
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
      <div className="px-6 py-8 md:py-12 max-w-3xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Instellingen</h1>
          <p className="text-neutral-400 text-sm">Pas je heiligdom aan.</p>
        </header>
        <section className="space-y-8">
          {/* Profile Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              Profiel Uiterlijk
            </h2>
            <div className="luxury-card p-6 md:p-8 rounded-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 flex-shrink-0 mx-auto md:mx-0 shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-neutral-500">
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="avatar-url" className="text-neutral-300">Link naar profielfoto</Label>
                    <Input
                      id="avatar-url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://voorbeeld.nl/afbeelding.png"
                      className="luxury-input h-11"
                    />
                    <p className="text-[10px] text-neutral-500">Plak een directe link naar een afbeelding.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-neutral-300">Weergavenaam</Label>
                    <Input
                      id="display-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="luxury-input h-11"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Notifications Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Meldingen
            </h2>
            <div className="luxury-card p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-white font-medium">Dagelijkse Herinneringen</div>
                <div className="text-xs text-neutral-500">Ontvang een melding voor je dagelijkse studieritueel</div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </div>
          {/* Appearance Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              {isDark ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
              Thema
            </h2>
            <div className="luxury-card p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
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
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={updateUserMutation.isPending}
              className="luxury-button w-full md:w-auto md:min-w-[200px] h-12"
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
          </div>
        </section>
      </div>
    </AurumLayout>
  );
}