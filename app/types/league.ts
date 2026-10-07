import { z } from 'zod';

export const LeagueSchema = z.object({
  idLeague: z.string(),
  strLeague: z.string(),
  strSport: z.string(),
  // * The free tier omits the field; elsewhere it may be `null` or `""`. All three mean the League has none.
  strLeagueAlternate: z
    .string()
    .nullish()
    .transform((value) => value ?? '')
});

export type League = z.infer<typeof LeagueSchema>;

export const SeasonSchema = z.object({
  strSeason: z.string(),
  strBadge: z.string().nullable()
});

export type Season = z.infer<typeof SeasonSchema>;

export type SeasonBadge = Season & { strBadge: string };

// * `fixture` swaps in the registered sample list for the degraded free tier (decision 001, KNOWN_FAKES.md)
export const LeagueSourceSchema = z.enum(['live', 'fixture']);

export type LeagueSource = z.infer<typeof LeagueSourceSchema>;
