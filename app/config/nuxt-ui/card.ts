// * Nuxt UI Card theme — upstream defaults from @nuxt/ui 4.11.3, deviations: root, body, outline variant (the League card is its only call site)
import type { CardConfig } from '../../types/nuxt-ui';

export default {
  slots: {
    // * Changes: the card blade (slant utility) red on hover and expand; 12px radius; 108px minimum; the expanded surface and ring, keyed on LeagueCard's data-expanded (annexes/design-system.md)
    // * Default: 'rounded-lg overflow-hidden'
    root: 'relative card-blade rounded-xl overflow-hidden min-h-27 motion-safe:transition-colors before:motion-safe:transition-colors hover:ring-(--ui-border-control) hover:before:bg-primary data-[expanded=true]:bg-elevated data-[expanded=true]:ring-primary/45 data-[expanded=true]:before:bg-primary',
    header: 'p-4 sm:px-6',
    title: 'text-highlighted font-semibold',
    description: 'mt-1 text-muted text-sm',
    // * Changes: 16px padding with 22px on the left, clearing the blade
    // * Default: 'p-4 sm:p-6'
    body: 'py-4 pe-4.5 ps-5.5 sm:py-4 sm:pe-4.5 sm:ps-5.5',
    footer: 'p-4 sm:px-6'
  },
  variants: {
    variant: {
      solid: {
        root: 'bg-inverted text-inverted',
        title: 'text-inverted',
        description: 'text-dimmed'
      },
      outline: {
        // * Changes: the card surface and the line colour (annexes/design-system.md, Colour)
        // * Default: 'bg-default ring ring-default divide-y divide-default'
        root: 'bg-elevated/50 ring ring-accented divide-y divide-default'
      },
      soft: {
        root: 'bg-elevated/50 divide-y divide-default'
      },
      subtle: {
        root: 'bg-elevated/50 ring ring-default divide-y divide-default'
      }
    }
  },
  defaultVariants: {
    variant: 'outline'
  }
} satisfies CardConfig;
