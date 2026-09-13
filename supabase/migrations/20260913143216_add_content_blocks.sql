alter table public.contents
  add column if not exists content_blocks jsonb not null default '[]'::jsonb;

alter table public.contents
  drop constraint if exists contents_content_blocks_is_array;

alter table public.contents
  add constraint contents_content_blocks_is_array
  check (jsonb_typeof(content_blocks) = 'array');

comment on column public.contents.content_blocks is
  'Ordered structured blocks for column bodies; body remains as a plain-text fallback.';
