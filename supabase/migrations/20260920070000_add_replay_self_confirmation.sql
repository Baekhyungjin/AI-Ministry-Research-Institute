create or replace function public.confirm_replay_access(p_access_id text)
returns table(video_url text, replay_title text)
language sql
security definer
set search_path = ''
as $$
  update public.replay_accesses as access
  set payment_status = 'confirmed'
  from public.replays as replay
  where access.id = p_access_id
    and access.replay_id = replay.id
    and access.payment_status in ('pending', 'confirmed')
    and replay.status = 'published'
  returning replay.video_url, replay.title;
$$;

revoke all on function public.confirm_replay_access(text) from public;
grant execute on function public.confirm_replay_access(text) to anon, authenticated;
