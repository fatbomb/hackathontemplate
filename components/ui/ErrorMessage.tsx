import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
  <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
    <span>{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-blue-500 hover:text-blue-700 text-xs underline"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorMessage;
