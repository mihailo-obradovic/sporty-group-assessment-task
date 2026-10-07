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
