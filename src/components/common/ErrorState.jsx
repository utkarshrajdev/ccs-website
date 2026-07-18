import { FiAlertTriangle } from 'react-icons/fi';
import Button from './Button';

export default function ErrorState({ message = "We couldn't load this content.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-900/20">
        <FiAlertTriangle size={28} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
