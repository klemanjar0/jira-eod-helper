alter table public.user_settings
    add column assignee_is_current_user boolean not null default true;
