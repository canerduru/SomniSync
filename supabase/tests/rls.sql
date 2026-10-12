begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users (id) values
 ('10000000-0000-0000-0000-000000000001'),
 ('20000000-0000-0000-0000-000000000002');
select is((select count(*)::int from public.users where id in ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002')), 2, 'Auth trigger creates private profiles');
select ok((select bool_and(aggregate_consent_at is null and matching_consent_at is null and analytics_consent_at is null) from public.users where id in ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002')), 'All consents are off by default');
insert into public.dreams (id, user_id, transcript, input_mode, dream_date) values
 ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Private dream A', 'text', '2026-10-10'),
 ('22000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Private dream B', 'text', '2026-10-10');
insert into public.tags (id, slug) values ('33000000-0000-0000-0000-000000000003', 'rls_fixture_water');
insert into public.dream_tags (dream_id, tag_id) values
 ('11000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000003'),
 ('22000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000003');
insert into public.connections (user_a_id, user_b_id, match_score, expires_at) values
 ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 0.5, now() + interval '1 day');
insert into storage.objects (bucket_id, name) values
 ('dream-audio', '10000000-0000-0000-0000-000000000001/11000000-0000-0000-0000-000000000001/audio.m4a'),
 ('dream-images', '20000000-0000-0000-0000-000000000002/22000000-0000-0000-0000-000000000002/image.png');
select ok((select bool_and(not public) from storage.buckets where id in ('dream-audio','dream-images')), 'Dream buckets are private');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select is((select count(*)::int from public.users where id in ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002')), 1, 'User A sees only own profile');
select is((select count(*)::int from public.dreams), 1, 'User A sees only own dream');
select is((select count(*)::int from public.dream_tags), 1, 'User A sees only own tag assignments');
select is((select count(*)::int from public.tags where id='33000000-0000-0000-0000-000000000003'), 1, 'Theme vocabulary is readable');
select is((select count(*)::int from storage.objects), 1, 'User A sees only own media');
select throws_ok($$insert into public.dreams(user_id,transcript,input_mode,dream_date) values ('20000000-0000-0000-0000-000000000002','Forbidden','text','2026-10-10')$$, '42501', null, 'Cannot create a dream for another user');
select throws_ok($$update public.dreams set status = 'ready'$$, '42501', null, 'Cannot forge AI processing status');
select throws_ok($$update public.dreams set user_id = '20000000-0000-0000-0000-000000000002'$$, '42501', null, 'Cannot transfer ownership');
select throws_ok($$update public.dreams set transcript = 'Replaced'$$, '42501', null, 'Transcript changes require server invalidation');
select throws_ok($$insert into public.tags(slug) values ('fake_tag')$$, '42501', null, 'Cannot forge global tags');
select throws_ok($$delete from public.dream_tags$$, '42501', null, 'Cannot rewrite derived tags');
select throws_ok($$select * from public.connections$$, '42501', null, 'Raw matching records are inaccessible');
select throws_ok($$delete from public.users$$, '42501', null, 'Account deletion requires complete server cleanup');
select throws_ok($$update public.users set timezone = 'Invalid/Zone'$$, '23514', null, 'Invalid timezone is rejected');
select lives_ok($$update public.users set locale = 'en', timezone = 'Europe/Istanbul'$$, 'Own preferences can be updated');
select lives_ok($$update public.dreams set title = 'My dream'$$, 'Owner can edit title');
update public.dreams set title = 'Forbidden' where user_id = '20000000-0000-0000-0000-000000000002';
select is((select count(*)::int from public.dreams where title = 'Forbidden'), 0, 'Cannot edit another user dream');
select throws_ok($$delete from public.dreams$$, '42501', null, 'Deletion must clean media through the server');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('dream-audio','20000000-0000-0000-0000-000000000002/22000000-0000-0000-0000-000000000002/forged.m4a')$$, '42501', null, 'Cannot upload media for another user');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('dream-images','10000000-0000-0000-0000-000000000001/11000000-0000-0000-0000-000000000001/forged.png')$$, '42501', null, 'Client cannot forge generated images');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('dream-audio','10000000-0000-0000-0000-000000000001/99000000-0000-0000-0000-000000000009/orphan.m4a')$$, '42501', null, 'Audio upload requires an owned existing dream');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('dream-audio','10000000-0000-0000-0000-000000000001/11000000-0000-0000-0000-000000000001/new.m4a')$$, '42501', null, 'Media uploads use the authenticated server lease');
select lives_ok($$insert into public.dreams(user_id,transcript,input_mode,dream_date) values ('10000000-0000-0000-0000-000000000001','New private dream','text','2026-10-10')$$, 'Owner can create a dream');
select ok((select bool_and(not aggregate_opt_in and not matching_opt_in) from public.dreams), 'New dreams do not participate in social features');
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select is((select count(*)::int from public.dreams), 1, 'User B cannot see User A dreams or lose own dream to User A deletion');
select is((select title from public.dreams limit 1), null::text, 'User B title was not changed by User A');
select is((select count(*)::int from public.dream_tags), 1, 'User B cannot see User A theme assignments');
select is((select count(*)::int from storage.objects), 1, 'User B cannot see User A media');

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok($$select * from public.dreams$$, '42501', null, 'Unauthenticated access is denied');
select is((select count(*)::int from storage.objects), 0, 'Unauthenticated media access is denied');
reset role;
delete from auth.users where id = '10000000-0000-0000-0000-000000000001';
select is((select count(*)::int from public.users where id in ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002')), 1, 'Auth deletion cascades to profile');
select is((select count(*)::int from public.dreams where user_id='20000000-0000-0000-0000-000000000002'), 1, 'Auth deletion cascades to dreams');
select is((select count(*)::int from public.dream_tags where dream_id='22000000-0000-0000-0000-000000000002'), 1, 'Auth deletion cascades to tag assignments');
select is((select count(*)::int from public.connections where user_a_id='10000000-0000-0000-0000-000000000001'), 0, 'Auth deletion cascades to connections');
select * from finish();
rollback;
