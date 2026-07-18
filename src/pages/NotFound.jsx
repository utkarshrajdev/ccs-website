import useSeo from '../hooks/useSeo';
import Button from '../components/common/Button';

export default function NotFound() {
  useSeo({ title: 'Page Not Found' });

  return (
    <div className="container-x section flex flex-col items-center justify-center text-center">
      <p className="font-display text-8xl font-bold text-primary-200 dark:text-primary-900">404</p>
      <h1 className="mb-3 text-2xl font-bold">Page not found</h1>
      <p className="mb-8 max-w-md text-slate-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button to="/">Back to Home</Button>
    </div>
  );
}
