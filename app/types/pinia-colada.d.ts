import type { FetchError } from 'ofetch';

import type { ResponseShapeError } from '@/utils/parseResponse';

declare module '@pinia/colada' {
  interface TypesConfig {
    defaultError: FetchError | ResponseShapeError;
  }
}
