-- Create the agent_audit_logs table
create table if not exists public.agent_audit_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  query_id text not null,
  action_type text not null, -- 'LLM_THINK', 'TOOL_EXEC', 'ERROR', 'SYSTEM'
  details jsonb default '{}'::jsonb
);

-- Enable Row Level Security (RLS)
alter table public.agent_audit_logs enable row level security;

-- Create policy to allow users to insert their own logs (if needed from client, though mostly server-side)
create policy "Users can insert their own logs"
  on public.agent_audit_logs for insert
  with check (auth.uid() = user_id);

-- Create policy to allow users to view their own logs
create policy "Users can view their own logs"
  on public.agent_audit_logs for select
  using (auth.uid() = user_id);
