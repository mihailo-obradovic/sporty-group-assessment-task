import { z } from 'zod';

const PublicConfigSchema = z.object({
  sportsdbBaseUrl: z.url(),
  sportsdbApiKey: z.string().min(1)
});

// * Configuration is validated at startup: a blank or malformed value stops the app on the error page rather than failing per request
export default defineNuxtPlugin(() => {
  PublicConfigSchema.parse(useRuntimeConfig().public);
});
