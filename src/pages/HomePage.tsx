import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export function HomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-neutral-500">
      <p>Wordt omgeleid...</p>
    </div>
  );
}