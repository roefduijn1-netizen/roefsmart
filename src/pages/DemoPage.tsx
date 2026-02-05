import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
export function DemoPage() {
  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Demo Page</h1>
        <p className="text-muted-foreground mb-6">
          The demo functionality has been disabled in favor of the main application.
        </p>
        <Button asChild>
          <Link to="/">Go to Dashboard</Link>
        </Button>
      </div>
    </AppLayout>
  );
}