import { groundCandidates, acceptedTags, type Candidate } from '../grounding.ts';
import { educationalText } from '../knowledge.ts';
import {
  analysisJsonSchema,
  analysisSchema,
  PipelineError,
  redactImagePrompt,
  systemPrompt,
  type AiProviders,
  type AudioInput,
  type Locale,
  type TransitContext,
} from './domain.ts';
export function pngBytes(value: Uint8Array) {
  if (
    value.length < 24 ||
    value.length > 10 * 1024 * 1024 ||
    ![137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => value[i] === b)
  )
    throw new PipelineError('INVALID_PROVIDER_IMAGE');
  return value;
}
async function boundedBytes(response: Response, max: number) {
  if (Number(response.headers.get('content-length') ?? 0) > max)
    throw new PipelineError('INVALID_PROVIDER_RESPONSE');
  const reader = response.body?.getReader();
  if (!reader) throw new PipelineError('INVALID_PROVIDER_RESPONSE');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) throw new PipelineError('INVALID_PROVIDER_RESPONSE');
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
export class LiveProviders implements AiProviders {
  constructor(
    private openaiKey: string,
    private request: typeof fetch = fetch,
  ) {}
  private async fetch(url: string, init: RequestInit = {}, timeout = 20000) {
    try {
      const response = await this.request(url, {
        ...init,
        redirect: 'error',
        signal: AbortSignal.timeout(timeout),
      });
      if (!response.ok) {
        let code = '';
        try {
          const payload = JSON.parse(new TextDecoder().decode(await boundedBytes(response, 16384)));
          code = payload.error?.code ?? '';
        } catch {}
        if (code === 'insufficient_quota') throw new PipelineError('AI_QUOTA_EXCEEDED');
        if (['moderation_blocked', 'content_policy_violation'].includes(code))
          throw new PipelineError('IMAGE_BLOCKED', 422);
        if (response.status === 401 || response.status === 403)
          throw new PipelineError('AI_NOT_CONFIGURED');
        throw new PipelineError(
          response.status === 429 ? 'PROVIDER_BUSY' : 'PROVIDER_UNAVAILABLE',
          503,
          response.status === 429 || response.status >= 500,
        );
      }
      return response;
    } catch (error) {
      if (error instanceof PipelineError) throw error;
      throw new PipelineError('PROVIDER_TIMEOUT', 503, true);
    }
  }
  private async json(url: string, init: RequestInit = {}, max = 2 * 1024 * 1024, timeout = 20000) {
    const response = await this.fetch(url, init, timeout);
    try {
      return JSON.parse(new TextDecoder().decode(await boundedBytes(response, max)));
    } catch (e) {
      if (e instanceof PipelineError) throw e;
      throw new PipelineError('INVALID_PROVIDER_RESPONSE');
    }
  }
  async transcribe(audio: AudioInput, locale: Locale) {
    const form = new FormData();
    form.set(
      'file',
      new Blob([audio.bytes as BlobPart], { type: audio.mime }),
      audio.mime === 'audio/wav'
        ? 'dream.wav'
        : audio.mime === 'audio/webm'
          ? 'dream.webm'
          : 'dream.m4a',
    );
    form.set('model', 'whisper-1');
    form.set('language', locale);
    form.set('response_format', 'json');
    const data = await this.json('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.openaiKey}` },
      body: form,
    });
    if (typeof data.text !== 'string' || !data.text.trim() || data.text.length > 20000)
      throw new PipelineError('EMPTY_TRANSCRIPT');
    return data.text.trim();
  }
  async interpret(transcript: string, locale: Locale, context: TransitContext) {
    const data = await this.json('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        store: false,
        max_completion_tokens: 4500,
        messages: [
          { role: 'system', content: systemPrompt(locale) },
          {
            role: 'user',
            content: JSON.stringify({ dream: transcript, transit_context: context }),
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'dream_analysis', strict: true, schema: analysisJsonSchema },
        },
      }),
    });
    const choice = data.choices?.[0];
    if (choice?.message?.refusal) throw new PipelineError('AI_REFUSED', 422);
    if (choice?.finish_reason !== 'stop' || typeof choice?.message?.content !== 'string')
      throw new PipelineError('INVALID_AI_OUTPUT');
    try {
      const raw = JSON.parse(choice.message.content);
      if (!Array.isArray(raw.observations) || raw.observations.length > 40)
        throw new Error('INVALID_OBSERVATIONS');
      const { observations, ...rest } = raw;
      const parsed = analysisSchema.parse(rest);
      const report = groundCandidates(transcript, observations as Candidate[], 1, 'llm');
      return {
        ...parsed,
        tags: acceptedTags(report),
        content_report: report,
        interpretations: {
          ...parsed.interpretations,
          neuroscience: educationalText(report, locale),
        },
        image_prompt: redactImagePrompt(parsed.image_prompt),
      };
    } catch {
      throw new PipelineError('INVALID_AI_OUTPUT');
    }
  }
  async generateImage(prompt: string) {
    const data = await this.json(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt: redactImagePrompt(prompt),
          size: '1024x1536',
          quality: 'low',
          n: 1,
          output_format: 'png',
          moderation: 'auto',
        }),
      },
      14_000_000,
      70000,
    );
    const base64 = data.data?.[0]?.b64_json;
    if (typeof base64 !== 'string' || base64.length > 14_000_000)
      throw new PipelineError('INVALID_PROVIDER_IMAGE');
    let bytes: Uint8Array;
    try {
      bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    } catch {
      throw new PipelineError('INVALID_PROVIDER_IMAGE');
    }
    return { bytes: pngBytes(bytes), mime: 'image/png' as const };
  }
}
