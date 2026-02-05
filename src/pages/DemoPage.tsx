import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AurumLayout } from '@/components/layout/AurumLayout';
export function DemoPage() {
  return (
    <AurumLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Demo Pagina</h1>
        <p className="text-neutral-400 mb-6">
          De demo functionaliteit is uitgeschakeld ten gunste van de hoofdapplicatie.
        </p>
        <Button asChild className="luxury-button">
          <Link to="/">Ga naar Dashboard</Link>
        </Button>
      </div>
    </AurumLayout>
  );
}