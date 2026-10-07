import type { UseQueryOptions } from '@pinia/colada';

export type ErrorHandling = {
  suppressToasts?: 'all';
};

export type ErrorContext = {
  showToast: (message: string) => void;
};

export type AppQueryOptions<T> = UseQueryOptions<T> & {
  errorHandling?: ErrorHandling;
};
