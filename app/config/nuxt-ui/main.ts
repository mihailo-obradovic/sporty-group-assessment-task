// * Nuxt UI Main theme — upstream defaults from @nuxt/ui 4.11.3, one deviation (base)
import type { MainConfig } from '../../types/nuxt-ui';

export default {
  // * Changes: link 3 of the height chain — main is the only scrolling region; `min-h-0` out-ranks upstream's viewport arithmetic, which the chain already does (nuxtui.md, The height chain's middle links)
  // * Default: 'min-h-[calc(100vh-var(--ui-header-height))]'
  base: 'min-h-0 flex flex-1 flex-col overflow-y-auto'
} satisfies MainConfig;
