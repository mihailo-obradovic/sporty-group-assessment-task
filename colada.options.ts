import type { PiniaColadaOptions } from '@pinia/colada';

export default {
  queryOptions: {
    staleTime: 5_000,
    refetchOnWindowFocus: false
  }
} satisfies PiniaColadaOptions;
