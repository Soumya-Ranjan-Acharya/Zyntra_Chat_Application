import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-secondary)] p-4">
    <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center mb-6"><MessageCircle size={28} className="text-white" /></div>
    <h1 className="text-6xl font-bold text-[var(--color-text-primary)] mb-2">404</h1>
    <p className="text-lg text-[var(--color-text-secondary)] mb-8">Page not found</p>
    <Link to="/"><Button size="lg">Go home</Button></Link>
  </div>
);
export default NotFoundPage;
