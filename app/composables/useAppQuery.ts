import type { UseQueryReturn } from '@pinia/colada';

import type { AppQueryOptions } from '@/types/api';

export function useAppQuery<T>(options: AppQueryOptions<T>): UseQueryReturn<T> {
  const { errorHandling, ...queryOptions } = options;

  const query = useQuery<T>({
    placeholderData: (previous) => previous,
    ...queryOptions
  });

  // ! Outside a component's setup there is no instance to own the watcher or the toast
  if (getCurrentInstance()) {
    const toast = useToast();

    watch(query.error, (error) => {
      handleApiError(
        error,
        {
          showToast: (message) => toast.add({ title: message, color: 'error' })
        },
        errorHandling
      );
    });
  }

  return query;
}
