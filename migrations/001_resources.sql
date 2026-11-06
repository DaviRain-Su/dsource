create table if not exists resources (
  id text primary key,
  slug text not null unique,
  title text not null,
  title_zh text not null default '',
  summary text not null default '',
  summary_zh text not null default '',
  body text not null default '',
  body_zh text not null default '',
  source_type text not null default 'article',
  source_url text not null default '',
  source_author text not null default '',
  source_lang text not null default 'zh',
  tags text[] not null default '{}',
  cover_url text not null default '',
  media_urls text[] not null default '{}',
  status text not null default 'published',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_status_idx on resources (status, updated_at desc);
create index if not exists resources_source_type_idx on resources (source_type);
