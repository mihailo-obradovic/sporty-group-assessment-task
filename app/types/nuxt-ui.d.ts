import type * as theme from '#build/ui';
import type { TVConfig } from '#ui/types';

// * One type per vendored component in app/config/nuxt-ui/, so a typo in a slot name fails the typecheck
type Theme = TVConfig<typeof theme>;

export type AlertConfig = Theme['alert'];
export type BadgeConfig = Theme['badge'];
export type ButtonConfig = Theme['button'];
export type CardConfig = Theme['card'];
export type ContainerConfig = Theme['container'];
export type EmptyConfig = Theme['empty'];
export type InputConfig = Theme['input'];
export type MainConfig = Theme['main'];
export type SelectConfig = Theme['select'];
export type SkeletonConfig = Theme['skeleton'];
export type ToastConfig = Theme['toast'];
export type ToasterConfig = Theme['toaster'];
