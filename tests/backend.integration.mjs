import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
const config = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }),
);
if (config.API_URL !== 'http://127.0.0.1:56321') throw new Error('LOCAL_SOMNISYNC_ONLY');
const sql = (statement) =>
  execFileSync(
    'docker',
    [
      'exec',
      'supabase_db_somnisync',
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      statement,
    ],
    { stdio: 'pipe' },
  );
const url = config.API_URL;
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, config.SERVICE_ROLE_KEY, options);
const accounts = [];
let assertions = 0;
const ok = (value, label) => {
  assert.ok(value, label);
  assertions++;
  console.log('PASS', label);
};
const call = async (client, body) => {
  const {
    data: { session },
  } = await client.auth.getSession();
  const response = await fetch(url + '/functions/v1/dreams-api', {
    method: 'POST',
    headers: {
      apikey: config.ANON_KEY,
      Authorization: 'Bearer ' + session.access_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
};
const read = async (c, id) =>
  (await c.from('dreams').select('*,dream_tags(tags(slug))').eq('id', id).single()).data;
try {
  for (let i = 0; i < 22; i++) {
    const email = `phase3-${crypto.randomUUID()}@example.test`,
      password = crypto.randomBytes(18).toString('base64');
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    const c = createClient(url, config.ANON_KEY, options);
    accounts.push({ id: data.user.id, c });
    const auth = await c.auth.signInWithPassword({ email, password });
    if (auth.error) throw auth.error;
  }
  const [a, b] = accounts;
  const id = crypto.randomUUID();
  let result = await call(a.c, {
    action: 'create',
    id,
    transcript: 'Rüyamda denizin içinde evime dönüyordum.',
    locale: 'tr',
    inputMode: 'text',
    timezone: 'Europe/Istanbul',
  });
  ok(
    result.status === 200,
    `authenticated Edge creates a persisted dream (status ${result.status}, ${JSON.stringify(result.body)})`,
  );
  let dream = await read(a.c, id);
  ok(
    dream.status === 'ready' && dream.astrology_context.mock === true,
    'server stores mock analysis with explicit provenance',
  );
  ok(
    dream.dream_tags
      .map((x) => x.tags.slug)
      .sort()
      .join(',') === 'home,water',
    'Turkish themes normalize to canonical English tags',
  );
  ok(!dream.aggregate_opt_in && !dream.matching_opt_in, 'dream social participation defaults off');
  ok(
    (await b.c.from('dreams').select('*').eq('id', id)).data.length === 0,
    'cross-user dream reads denied',
  );
  ok(
    (await b.c.from('users').select('*').eq('id', a.id)).data.length === 0,
    'cross-user profile reads denied',
  );
  ok(
    (await b.c.storage.from('dream-images').createSignedUrl(dream.image_path, 30)).error,
    'cross-user private image signing denied',
  );
  const own = await a.c.storage.from('dream-images').createSignedUrl(dream.image_path, 30);
  const image = await fetch(own.data.signedUrl);
  ok(
    image.ok && image.headers.get('content-type').includes('image/png'),
    'owner can read actual private PNG bytes',
  );
  const publicImage = await fetch(
    url + '/storage/v1/object/public/dream-images/' + dream.image_path,
  );
  ok(!publicImage.ok, 'unsigned public image access denied');
  ok(
    (await a.c.from('dreams').update({ status: 'ready' }).eq('id', id)).error,
    'client cannot forge derived fields',
  );
  ok(
    (
      await a.c.rpc('save_mock_dream', {
        p_user: a.id,
        p_id: id,
        p_input: {},
        p_analysis: {},
        p_image: null,
        p_audio: null,
      })
    ).error,
    'server save RPC is inaccessible to client',
  );
  ok(
    (await a.c.from('dreams').delete().eq('id', id)).error,
    'direct deletion cannot bypass media cleanup',
  );
  result = await call(b.c, { action: 'update', id, transcript: 'Forbidden' });
  ok(result.status === 404, 'cross-user server update denied');
  result = await call(a.c, { action: 'create', id, transcript: 'retry', locale: 'tr' });
  ok(
    result.status === 200 && (await a.c.from('dreams').select('id')).data.length === 1,
    'retrying same capture ID is idempotent',
  );
  ok(
    dream.content_report.schemaVersion === 1 &&
      dream.content_report.revision === dream.transcript_revision,
    'grounded report is bound to the current transcript revision',
  );
  const waterIndex = dream.content_report.observations.findIndex((o) => o.tag === 'water');
  result = await call(a.c, {
    action: 'review',
    id,
    observationIndex: waterIndex,
    rejected: true,
    expectedRevision: dream.transcript_revision,
  });
  ok(
    result.status === 200 && !(await read(a.c, id)).dream_tags.some((r) => r.tags.slug === 'water'),
    'rejected observation is removed from persisted tags',
  );
  result = await call(a.c, {
    action: 'review',
    id,
    observationIndex: waterIndex,
    rejected: false,
    expectedRevision: dream.transcript_revision,
  });
  ok(
    result.status === 200 && (await read(a.c, id)).dream_tags.some((r) => r.tags.slug === 'water'),
    'restored observation returns to persisted tags',
  );
  const journal = {
    sleepHours: 7.5,
    sleepQuality: null,
    stressBeforeSleep: 0,
    dreamEmotion: null,
    wakingMood: null,
    recurring: null,
    sleepDate: dream.dream_date,
    timezone: 'Europe/Istanbul',
    capturedAt: new Date().toISOString(),
  };
  result = await call(a.c, { action: 'journal', id, journal });
  ok(
    result.status === 200 && (await read(a.c, id)).journal.stressBeforeSleep === 0,
    'journal preserves zero stress separately from null',
  );
  result = await call(b.c, { action: 'journal', id, journal });
  ok(result.status === 404, 'cross-owner journal save denied');
  result = await call(a.c, { action: 'journal', id, journal: { ...journal, sleepHours: 25 } });
  ok(result.status === 400, 'invalid journal values rejected by Edge');
  result = await call(a.c, {
    action: 'revise',
    id,
    transcript: 'Aynada dişlerim dökülüyordu.',
    expectedRevision: 1,
  });
  dream = await read(a.c, id);
  ok(
    result.status === 200 &&
      dream.transcript_revision === 2 &&
      dream.status === 'draft' &&
      !dream.content_report &&
      !dream.image_path &&
      !dream.neuroscience_interpretation &&
      dream.dream_tags.length === 0,
    'correction atomically invalidates derived data and advances revision',
  );
  ok(dream.journal.sleepHours === 7.5, 'correction keeps optional journal answers');
  result = await call(a.c, { action: 'revise', id, transcript: 'Stale edit', expectedRevision: 1 });
  ok(result.status === 409, 'stale correction rejected');
  result = await call(a.c, {
    action: 'update',
    id,
    transcript: 'Stale analysis',
    expectedRevision: 1,
  });
  ok(
    result.status === 409 && (await read(a.c, id)).transcript === 'Aynada dişlerim dökülüyordu.',
    'stale reanalysis cannot overwrite a correction',
  );
  result = await call(a.c, {
    action: 'update',
    id,
    transcript: 'Aynada dişlerim dökülüyordu.',
    expectedRevision: 2,
  });
  dream = await read(a.c, id);
  ok(
    result.status === 200 &&
      dream.dream_tags.map((x) => x.tags.slug).includes('teeth') &&
      !dream.dream_tags.map((x) => x.tags.slug).includes('water'),
    'transcript update atomically replaces derived tags',
  );
  result = await call(a.c, { action: 'confirm_event', id, expectedRevision: 2 });
  ok(
    result.status === 200 && (await read(a.c, id)).event_confirmed,
    'owner can confirm a genuinely separate dream event',
  );
  result = await call(a.c, {
    action: 'create',
    id: crypto.randomUUID(),
    transcript: 'Invalid',
    inputMode: 'text',
    timezone: 'Invalid/Zone',
  });
  ok(result.status === 400, 'invalid timezone is rejected');
  result = await call(a.c, {
    action: 'create',
    id: crypto.randomUUID(),
    transcript: 'Private audio dream',
    inputMode: 'audio',
    audio: { base64: Buffer.from('RIFF-test-audio-fixture').toString('base64'), mime: 'audio/wav' },
  });
  ok(result.status === 200, 'audio payload is stored in private audio bucket');
  const audioDream = await read(a.c, result.body.id);
  ok(audioDream.audio_path.startsWith(a.id + '/'), 'audio path is scoped to authenticated owner');
  ok(
    (
      await a.c.storage
        .from('dream-audio')
        .upload(a.id + '/' + id + '/bypass.wav', new Uint8Array([1]), { contentType: 'audio/wav' })
    ).error,
    'direct media write cannot bypass server lease',
  );
  let social = await a.c.rpc('get_synastry');
  ok(
    !social.error &&
      social.data.stats.status === 'insufficient_data' &&
      social.data.matches.length === 0,
    'cold start returns no fabricated statistics or matches',
  );
  // Real database fixtures; never put these synthetic participants into the app preview.
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const tags = i < 5 ? ['falling', 'stairs', 'moon'] : ['water', 'home', 'silence'];
    const analysis = {
      image_prompt: 'Mock fixture',
      interpretations: {
        neuroscience: 'Fixture',
        jungian: 'Fixture',
        astrological: 'No transit fixture',
      },
      tags,
    };
    const { error } = await admin.rpc('save_mock_dream', {
      p_user: account.id,
      p_id: crypto.randomUUID(),
      p_input: {
        transcript: 'Test fixture',
        inputMode: 'text',
        dreamDate: yesterday,
        timezone: 'UTC',
        locale: 'tr',
      },
      p_analysis: analysis,
      p_image: null,
      p_audio: null,
    });
    if (error) throw error;
    await account.c
      .from('users')
      .update({
        timezone: 'UTC',
        aggregate_consent_at: i < 19 ? new Date().toISOString() : null,
        matching_consent_at: i < 2 ? new Date().toISOString() : null,
      })
      .eq('id', account.id);
    const optin = await account.c
      .from('dreams')
      .update({ aggregate_opt_in: true, matching_opt_in: true })
      .eq('user_id', account.id);
    if (optin.error) throw optin.error;
  }
  social = await a.c.rpc('get_synastry');
  if (social.error) throw social.error;
  ok(
    social.data.stats.status === 'insufficient_data',
    '19 distinct consenting users remain below threshold',
  );
  await accounts[19].c
    .from('users')
    .update({ aggregate_consent_at: new Date().toISOString() })
    .eq('id', accounts[19].id);
  social = await a.c.rpc('get_synastry');
  if (social.error) throw social.error;
  ok(
    social.data.stats.status === 'ready' && social.data.stats.cohortSize === 20,
    '20 distinct consenting users enable statistics',
  );
  ok(
    social.data.stats.themes.find((t) => t.slug === 'falling').percentage === 25,
    'aggregate counts distinct users, not dream rows',
  );
  ok(
    social.data.matches.length === 1 &&
      !social.data.matches[0].isDemo &&
      Object.keys(social.data.matches[0]).sort().join(',') === 'alias,id,isDemo,sharedTags',
    'matching returns anonymous sanitized connection only',
  );
  const matchId = social.data.matches[0].id;
  ok(
    (await a.c.from('connections').select('*')).error,
    'raw connection identities remain inaccessible',
  );
  await b.c.from('users').update({ matching_consent_at: null }).eq('id', b.id);
  social = await a.c.rpc('get_synastry');
  ok(social.data.matches.length === 0, 'withdrawal immediately removes matching eligibility');
  ok(
    (await admin.from('connections').select('id').eq('id', matchId)).data.length === 0,
    'withdrawal invalidates stored connections',
  );
  await accounts[4].c.from('users').update({ aggregate_consent_at: null }).eq('id', accounts[4].id);
  await accounts[20].c
    .from('users')
    .update({ aggregate_consent_at: new Date().toISOString() })
    .eq('id', accounts[20].id);
  social = await a.c.rpc('get_synastry');
  ok(
    social.data.stats.status === 'insufficient_data' ||
      !social.data.stats.themes.some((t) => t.slug === 'falling'),
    'groups smaller than five are suppressed',
  );
  const token = crypto.randomUUID();
  await admin.rpc('claim_mutation', { p_user: a.id, p_token: token });
  result = await call(a.c, { action: 'delete', id });
  ok(result.status === 409, 'concurrent media mutations are serialized');
  await admin.rpc('release_mutation', { p_user: a.id, p_token: token });
  result = await call(a.c, { action: 'delete', id });
  ok(result.status === 200 && !(await read(a.c, id)), 'single-dream deletion removes DB row');
  ok(
    (await admin.storage.from('dream-images').list(a.id + '/' + id)).data.length === 0,
    'single-dream deletion removes image bytes',
  );
  result = await call(a.c, { action: 'clear' });
  ok(
    result.status === 200 && (await a.c.from('dreams').select('*')).data.length === 0,
    'clear removes all persisted dreams',
  );
  ok(
    (await admin.storage.from('dream-audio').list(a.id)).data.length === 0 &&
      (await admin.storage.from('dream-images').list(a.id)).data.length === 0,
    'clear removes audio/images, including empty folders',
  );
  const p = (await a.c.from('users').select('*').single()).data;
  ok(!p.aggregate_consent_at && !p.matching_consent_at, 'clear resets social permissions');
  result = await call(a.c, {
    action: 'create',
    id: crypto.randomUUID(),
    transcript: 'Final private record',
    inputMode: 'text',
  });
  ok(result.status === 200, 'account stays usable after clearing archive');
  sql(
    `create function private.test_block_cleanup() returns trigger language plpgsql as $$ begin if old.name like '${a.id}/%' then raise exception 'TEST_STORAGE_FAILURE'; end if; return old; end; $$; create trigger test_block_cleanup before delete on storage.objects for each row execute function private.test_block_cleanup();`,
  );
  result = await call(a.c, { action: 'delete_account' });
  ok(result.status === 503, 'storage failure does not report account deletion as successful');
  ok(
    !!(await admin.auth.admin.getUserById(a.id)).data.user,
    'failed cleanup preserves Auth identity for retry',
  );
  ok(
    !!(await admin.from('users').select('deletion_requested_at').eq('id', a.id).single()).data
      .deletion_requested_at,
    'failed cleanup freezes private account data',
  );
  ok(
    (await a.c.from('dreams').select('*')).data.length === 0,
    'frozen account cannot read dreams while deletion is pending',
  );
  result = await call(a.c, { action: 'create', transcript: 'Frozen account' });
  ok(result.status === 409, 'frozen account cannot create new media or dreams');
  sql(
    'drop trigger test_block_cleanup on storage.objects; drop function private.test_block_cleanup();',
  );
  result = await call(a.c, { action: 'delete_account' });
  ok(
    result.status === 200 && (await admin.auth.admin.getUserById(a.id)).error,
    'account deletion removes Auth identity',
  );
  ok(
    (await admin.from('users').select('*').eq('id', a.id)).data.length === 0 &&
      (await admin.from('dreams').select('*').eq('user_id', a.id)).data.length === 0,
    'account deletion cascades to private profile and dream rows',
  );
  ok(
    (await admin.storage.from('dream-images').list(a.id)).data.length === 0,
    'account deletion cleans Storage before Auth cascade',
  );
  result = await call(a.c, { action: 'create', transcript: 'Old token' });
  ok(result.status === 401, 'old bearer token cannot mutate a deleted account');
  console.log(`SUCCESS: ${assertions} backend assertions`);
} finally {
  sql(
    'drop trigger if exists test_block_cleanup on storage.objects; drop function if exists private.test_block_cleanup();',
  );
  for (const account of accounts) {
    for (const bucket of ['dream-audio', 'dream-images']) {
      const { data: folders } = await admin.storage.from(bucket).list(account.id);
      for (const folder of folders ?? []) {
        const { data: files } = await admin.storage
          .from(bucket)
          .list(account.id + '/' + folder.name);
        if (files?.length)
          await admin.storage
            .from(bucket)
            .remove(files.map((f) => account.id + '/' + folder.name + '/' + f.name));
      }
    }
    await admin.auth.admin.deleteUser(account.id);
  }
}
