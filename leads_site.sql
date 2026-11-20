-- =====================================================================
-- Pedidos de diagnóstico do site gustavolara.com.br -> CRM do Hub
-- Rodar UMA vez no Supabase: SQL Editor > New query > colar tudo > Run.
--
-- O que faz:
-- 1. Cria a tabela "leads", onde o formulário do site grava cada pedido.
-- 2. O site (sem login) só consegue INSERIR; ninguém de fora lê nada.
-- 3. Cada lead novo vira automaticamente um contato no CRM do Hub
--    (etapa "Novo contato", origem "Site", próxima ação para hoje).
-- =====================================================================

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  nome         text not null,
  whatsapp     text not null,
  empresa      text,
  segmento     text,
  faturamento  text,
  origem       text default 'site',
  pagina       text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  status       text not null default 'novo',
  observacoes  text
);

alter table public.leads enable row level security;

drop policy if exists "site insere lead" on public.leads;
create policy "site insere lead" on public.leads
  for insert to anon, authenticated
  with check (status = 'novo'
              and length(nome) between 2 and 120
              and length(whatsapp) between 8 and 30);

drop policy if exists "admin gerencia leads" on public.leads;
create policy "admin gerencia leads" on public.leads
  for all to authenticated
  using (is_admin()) with check (is_admin());

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Copia o lead para o CRM. Se algo falhar aqui, o lead continua salvo em "leads".
create or replace function public.lead_para_crm()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  begin
    insert into contatos (nome, telefone, empresa, origem, interesse, etapa, proxima_acao, proxima_data)
    values (
      new.nome,
      new.whatsapp,
      new.empresa,
      'Site',
      'Diagnóstico' || coalesce(' · ' || nullif(new.segmento,''), '') || coalesce(' · ' || nullif(new.faturamento,''), ''),
      'novo',
      'Responder o pedido de diagnóstico pelo WhatsApp'
        || case when new.utm_source is not null then ' (veio de ' || new.utm_source || ')' else '' end,
      (now() at time zone 'America/Sao_Paulo')::date
    );
  exception when others then
    raise warning 'lead % não foi copiado para o CRM: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists leads_para_crm on public.leads;
create trigger leads_para_crm
  after insert on public.leads
  for each row execute function public.lead_para_crm();
