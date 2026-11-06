-- Optional one-level quote + structured media (agent-friendly JSON).
-- media_urls remains for backward compatibility.

alter table resources
  add column if not exists quote jsonb,
  add column if not exists media jsonb not null default '[]'::jsonb;
