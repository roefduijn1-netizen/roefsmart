import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Deze browser ondersteunt geen meldingen.');
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        toast.success('Meldingen ingeschakeld');
        new Notification('ROEFSMART', {
          body: 'Meldingen zijn succesvol ingesteld.',
          icon: '/vite.svg'
        });
        return true;
      } else {
        toast.error('Meldingen geweigerd. Controleer je browserinstellingen.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);
  // Daily reminder logic
  useEffect(() => {
    if (permission !== 'granted') return;
    const checkDailyNotification = () => {
      const lastNotified = localStorage.getItem('aurum_last_notification');
      const today = new Date().toDateString();
      if (lastNotified !== today) {
         try {
             new Notification('Tijd om te studeren', {
               body: 'Je dagelijkse studieritueel wacht op je.',
               tag: 'daily-reminder',
               requireInteraction: true,
             });
             localStorage.setItem('aurum_last_notification', today);
         } catch (e) {
             console.error("Notification failed", e);
         }
      }
    };
    checkDailyNotification();
    // Check periodically (e.g. every hour) in case the app is left open
    const interval = setInterval(checkDailyNotification, 3600000);
    return () => clearInterval(interval);
  }, [permission]);
  return {
    permission,
    requestPermission,
    isEnabled: permission === 'granted'
  };
}