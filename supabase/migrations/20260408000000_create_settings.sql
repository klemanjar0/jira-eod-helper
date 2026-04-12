create table if not exists user_settings (
    user_id uuid not null primary key references auth.users (id) on delete cascade,
    project_id text not null default '',
    issue_query text not null default '',
    content_template text not null default '',
    ticket_item_template text not null default '',
    mail_recipient text not null default '',
    mail_subject text not null default '',
    mail_author text not null default '',
    assignee text not null default '',
    is_using_master_key boolean not null default false,
    api_key text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "users can read own settings"
    on public.user_settings
    for select
                   using (auth.uid() = user_id);

create policy "users can insert own settings"
    on public.user_settings
    for insert
    with check (auth.uid() = user_id);

create policy "users can update own settings"
    on public.user_settings
    for update
                          using (auth.uid() = user_id)
        with check (auth.uid() = user_id);

create policy "users can delete own settings"
    on public.user_settings
    for delete
using (auth.uid() = user_id);

create or replace function public.handle_new_user_settings()
returns trigger as $$
begin
insert into public.user_settings (user_id)
values (new.id);
return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_settings
    after insert on auth.users
    for each row
    execute function public.handle_new_user_settings();