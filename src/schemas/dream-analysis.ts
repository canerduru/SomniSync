import { z } from 'zod';
export const dreamAnalysisSchema = z.strictObject({
  image_prompt: z.string().trim().min(1).max(1000),
  interpretations: z.strictObject({
    neuroscience: z.string().trim().min(1).max(6000),
    jungian: z.string().trim().min(1).max(6000),
    astrological: z.string().trim().min(1).max(6000),
  }),
  content_report: z.unknown().optional(),
  tags: z
    .array(z.string().regex(/^[a-z]+(?:_[a-z]+)*$/))
    .min(0)
    .max(6)
    .refine((tags) => new Set(tags).size === tags.length, 'Tags must be unique'),
});
export type DreamAnalysis = z.infer<typeof dreamAnalysisSchema>;
