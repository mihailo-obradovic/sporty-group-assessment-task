import { z } from 'zod';

import { LeagueSourceSchema } from '@/types/league';

const PublicConfigSchema = z.object({
  sportsdbBaseUrl: z.url(),
  sportsdbApiKey: z.string().min(1),
  leagueSource: LeagueSourceSchema
});

// * Configuration is validated at startup: a blank or malformed value stops the app on the error page rather than failing per request
export default defineNuxtPlugin(() => {
  PublicConfigSchema.parse(useRuntimeConfig().public);
});
