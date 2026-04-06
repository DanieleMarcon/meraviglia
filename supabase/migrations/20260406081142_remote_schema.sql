


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invite_token" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "status" "text" DEFAULT 'invited'::"text" NOT NULL,
    "invited_by_user_id" "uuid" NOT NULL,
    "used_by_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "used_at" timestamp with time zone,
    CONSTRAINT "invites_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text"]))),
    CONSTRAINT "invites_status_check" CHECK (("status" = ANY (ARRAY['invited'::"text", 'used'::"text", 'expired'::"text"])))
);

ALTER TABLE ONLY "public"."invites" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."invites" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."activate_invite"("target_invite_token" "uuid") RETURNS "public"."invites"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_invite public.invites%rowtype;
  v_user public.users%rowtype;
  v_auth_email text;
  v_role_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select au.email
    into v_auth_email
  from auth.users au
  where au.id = auth.uid();

  if v_auth_email is null then
    raise exception 'authenticated user email is required';
  end if;

  select *
    into v_invite
  from public.invites i
  where i.invite_token = target_invite_token
  for update;

  if not found then
    raise exception 'invite not found';
  end if;

  if lower(v_invite.email) <> lower(v_auth_email) then
    raise exception 'invite email mismatch';
  end if;

  if v_invite.status = 'used' then
    if v_invite.used_by_user_id = auth.uid() then
      return v_invite;
    end if;

    raise exception 'invite already used';
  end if;

  if v_invite.status <> 'invited' then
    raise exception 'invite is not activatable';
  end if;

  select *
    into v_user
  from public.users u
  where u.id = auth.uid()
  for update;

  if not found then
    raise exception 'profile row not found for authenticated user';
  end if;

  if v_user.organization_id is not null and v_user.organization_id <> v_invite.organization_id then
    raise exception 'user already belongs to another organization';
  end if;

  update public.users
  set organization_id = v_invite.organization_id,
      membership_status = 'active',
      updated_at = now()
  where id = auth.uid();

  select r.id
    into v_role_id
  from public.roles r
  where r.organization_id = v_invite.organization_id
    and r.role_name = v_invite.role;

  if v_role_id is null then
    raise exception 'target role not found in organization';
  end if;

  insert into public.user_roles (user_id, role_id)
  values (auth.uid(), v_role_id)
  on conflict (user_id, role_id) do nothing;

  update public.invites
  set status = 'used',
      used_by_user_id = auth.uid(),
      used_at = now()
  where id = v_invite.id
  returning * into v_invite;

  return v_invite;
end;
$$;


ALTER FUNCTION "public"."activate_invite"("target_invite_token" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_organization_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select u.organization_id
  from public.users u
  where u.id = auth.uid()
    and u.membership_status = 'active'
  limit 1;
$$;


ALTER FUNCTION "public"."current_user_organization_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_interaction_status_transition"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'planned' then
      raise exception 'M3 interactions must be created with status planned';
    end if;

    new.status_changed_at := coalesce(new.status_changed_at, now());
    return new;
  end if;

  if new.status = old.status then
    return new;
  end if;

  if old.status = 'planned' and new.status in ('completed', 'canceled') then
    new.status_changed_at := now();
    return new;
  end if;

  if old.status in ('completed', 'canceled') and new.status = 'planned' then
    new.status_changed_at := now();
    return new;
  end if;

  raise exception 'Invalid interaction status transition from % to %', old.status, new.status;
end;
$$;


ALTER FUNCTION "public"."enforce_interaction_status_transition"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_auth_user_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_organization_id uuid;
begin
  v_organization_id := nullif(new.raw_user_meta_data ->> 'organization_id', '')::uuid;

  insert into public.users (id, organization_id, email, full_name, membership_status)
  values (
    new.id,
    v_organization_id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when v_organization_id is null then 'invited' else 'active' end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.users.full_name);

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_auth_user_created"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_permission"("target_permission_key" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid()
      and r.organization_id = public.current_user_organization_id()
      and p.permission_key = target_permission_key
  );
$$;


ALTER FUNCTION "public"."has_permission"("target_permission_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("target_role_name" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.organization_id = public.current_user_organization_id()
      and r.role_name = target_role_name
  );
$$;


ALTER FUNCTION "public"."has_role"("target_role_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_membership"("target_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_org_id uuid;
begin
  if not public.has_role('admin') then
    raise exception 'admin role required';
  end if;

  v_org_id := public.current_user_organization_id();

  if v_org_id is null then
    raise exception 'active organization context required';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'admin self-removal is not allowed';
  end if;

  update public.users
  set membership_status = 'removed',
      updated_at = now()
  where id = target_user_id
    and organization_id = v_org_id;

  delete from public.user_roles ur
  using public.roles r
  where ur.role_id = r.id
    and ur.user_id = target_user_id
    and r.organization_id = v_org_id;
end;
$$;


ALTER FUNCTION "public"."remove_membership"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_interaction_participant_scope"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_organization_id uuid;
  v_workspace_id uuid;
begin
  select i.organization_id, i.workspace_id
    into v_organization_id, v_workspace_id
  from public.interactions i
  where i.id = new.interaction_id;

  if v_organization_id is null or v_workspace_id is null then
    raise exception 'interaction % not found for participant linkage', new.interaction_id;
  end if;

  new.organization_id := v_organization_id;
  new.workspace_id := v_workspace_id;

  if not exists (
    select 1
    from public.contacts c
    where c.id = new.contact_id
      and c.organization_id = new.organization_id
      and c.workspace_id = new.workspace_id
  ) then
    raise exception
      'contact % must belong to the same workspace/org as interaction %',
      new.contact_id,
      new.interaction_id;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."sync_interaction_participant_scope"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "role" "text",
    "provenance" "text" DEFAULT 'manual'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "contacts_provenance_check" CHECK (("provenance" = ANY (ARRAY['manual'::"text", 'from_intake'::"text", 'from_ai_review'::"text"])))
);

ALTER TABLE ONLY "public"."contacts" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."intake_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "cognome" "text" NOT NULL,
    "azienda" "text",
    "email" "text",
    "telefono" "text",
    "indirizzo" "text",
    "note" "text",
    "appuntamento_timestamp" timestamp with time zone NOT NULL,
    "consulenza_online" boolean DEFAULT false,
    "stato" "text" DEFAULT 'scheduled'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."intake_leads" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."intake_leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."intakes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "address" "text",
    "is_online" boolean DEFAULT false NOT NULL,
    "notes" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "workspace_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "intakes_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'validated'::"text", 'converted'::"text"])))
);

ALTER TABLE ONLY "public"."intakes" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."intakes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interaction_participants" (
    "interaction_id" "uuid" NOT NULL,
    "contact_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "workspace_id" "uuid" NOT NULL
);

ALTER TABLE ONLY "public"."interaction_participants" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."interaction_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'planned'::"text" NOT NULL,
    "provenance" "text" DEFAULT 'manual'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    "status_changed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "interactions_provenance_m3_check" CHECK (("provenance" = 'manual'::"text")),
    CONSTRAINT "interactions_status_m3_check" CHECK (("status" = ANY (ARRAY['planned'::"text", 'completed'::"text", 'canceled'::"text"]))),
    CONSTRAINT "interactions_type_m3_check" CHECK (("type" = ANY (ARRAY['meeting'::"text", 'call'::"text", 'follow_up'::"text"])))
);

ALTER TABLE ONLY "public"."interactions" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."interactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."organizations" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "permission_key" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."permissions" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."role_permissions" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role_name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."roles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."user_roles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "email" "text" NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "membership_status" "text" DEFAULT 'active'::"text" NOT NULL,
    CONSTRAINT "users_membership_org_consistency_check" CHECK (((("membership_status" = 'active'::"text") AND ("organization_id" IS NOT NULL)) OR (("membership_status" = 'invited'::"text") AND ("organization_id" IS NULL)) OR ("membership_status" = 'removed'::"text"))),
    CONSTRAINT "users_membership_status_check" CHECK (("membership_status" = ANY (ARRAY['invited'::"text", 'active'::"text", 'removed'::"text"])))
);

ALTER TABLE ONLY "public"."users" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "workspace_name" "text" NOT NULL,
    "workspace_slug" "text" NOT NULL,
    "created_by_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."workspaces" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspaces" OWNER TO "postgres";


ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."intake_leads"
    ADD CONSTRAINT "intake_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."intakes"
    ADD CONSTRAINT "intakes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interaction_participants"
    ADD CONSTRAINT "interaction_participants_pkey" PRIMARY KEY ("interaction_id", "contact_id");



ALTER TABLE ONLY "public"."interactions"
    ADD CONSTRAINT "interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_invite_token_key" UNIQUE ("invite_token");



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_permission_key_key" UNIQUE ("permission_key");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_organization_id_role_name_key" UNIQUE ("organization_id", "role_name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_organization_id_workspace_slug_key" UNIQUE ("organization_id", "workspace_slug");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_contacts_organization_id" ON "public"."contacts" USING "btree" ("organization_id");



CREATE INDEX "idx_contacts_workspace_id" ON "public"."contacts" USING "btree" ("workspace_id");



CREATE INDEX "idx_intakes_organization_id" ON "public"."intakes" USING "btree" ("organization_id");



CREATE INDEX "idx_intakes_workspace_id" ON "public"."intakes" USING "btree" ("workspace_id");



CREATE INDEX "idx_interaction_participants_contact" ON "public"."interaction_participants" USING "btree" ("contact_id");



CREATE INDEX "idx_interaction_participants_contact_id" ON "public"."interaction_participants" USING "btree" ("contact_id");



CREATE INDEX "idx_interaction_participants_workspace_interaction" ON "public"."interaction_participants" USING "btree" ("workspace_id", "interaction_id");



CREATE INDEX "idx_interactions_organization_id" ON "public"."interactions" USING "btree" ("organization_id");



CREATE INDEX "idx_interactions_scheduled_at" ON "public"."interactions" USING "btree" ("scheduled_at");



CREATE INDEX "idx_interactions_workspace_id" ON "public"."interactions" USING "btree" ("workspace_id");



CREATE INDEX "idx_interactions_workspace_status_changed_desc" ON "public"."interactions" USING "btree" ("workspace_id", "status", "status_changed_at" DESC, "scheduled_at" DESC, "id") WHERE ("status" = ANY (ARRAY['completed'::"text", 'canceled'::"text"]));



CREATE INDEX "idx_interactions_workspace_status_scheduled_at" ON "public"."interactions" USING "btree" ("workspace_id", "status", "scheduled_at", "id");



CREATE INDEX "idx_invites_email_status" ON "public"."invites" USING "btree" ("lower"("email"), "status");



CREATE INDEX "idx_invites_org_status" ON "public"."invites" USING "btree" ("organization_id", "status");



CREATE INDEX "idx_roles_organization_id" ON "public"."roles" USING "btree" ("organization_id");



CREATE INDEX "idx_user_roles_role_id" ON "public"."user_roles" USING "btree" ("role_id");



CREATE INDEX "idx_users_organization_id" ON "public"."users" USING "btree" ("organization_id");



CREATE INDEX "idx_workspaces_created_by_user_id" ON "public"."workspaces" USING "btree" ("created_by_user_id");



CREATE INDEX "idx_workspaces_organization_id" ON "public"."workspaces" USING "btree" ("organization_id");



CREATE UNIQUE INDEX "uq_contacts_id_workspace_org" ON "public"."contacts" USING "btree" ("id", "workspace_id", "organization_id");



CREATE UNIQUE INDEX "uq_interactions_id_workspace_org" ON "public"."interactions" USING "btree" ("id", "workspace_id", "organization_id");



CREATE UNIQUE INDEX "uq_workspaces_id_org" ON "public"."workspaces" USING "btree" ("id", "organization_id");



CREATE UNIQUE INDEX "ux_invites_org_email_open" ON "public"."invites" USING "btree" ("organization_id", "lower"("email")) WHERE ("status" = 'invited'::"text");



CREATE OR REPLACE TRIGGER "trg_contacts_set_updated_at" BEFORE UPDATE ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_intakes_set_updated_at" BEFORE UPDATE ON "public"."intakes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_interaction_participants_sync_scope" BEFORE INSERT OR UPDATE OF "interaction_id", "contact_id" ON "public"."interaction_participants" FOR EACH ROW EXECUTE FUNCTION "public"."sync_interaction_participant_scope"();



CREATE OR REPLACE TRIGGER "trg_interactions_enforce_status_transition" BEFORE INSERT OR UPDATE OF "status" ON "public"."interactions" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_interaction_status_transition"();



CREATE OR REPLACE TRIGGER "trg_interactions_set_updated_at" BEFORE UPDATE ON "public"."interactions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_roles_set_updated_at" BEFORE UPDATE ON "public"."roles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_users_set_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_workspaces_set_updated_at" BEFORE UPDATE ON "public"."workspaces" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."intake_leads"
    ADD CONSTRAINT "intake_leads_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."intakes"
    ADD CONSTRAINT "intakes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."intakes"
    ADD CONSTRAINT "intakes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."interaction_participants"
    ADD CONSTRAINT "interaction_participants_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interaction_participants"
    ADD CONSTRAINT "interaction_participants_contact_workspace_org_fk" FOREIGN KEY ("contact_id", "workspace_id", "organization_id") REFERENCES "public"."contacts"("id", "workspace_id", "organization_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interaction_participants"
    ADD CONSTRAINT "interaction_participants_interaction_id_fkey" FOREIGN KEY ("interaction_id") REFERENCES "public"."interactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interaction_participants"
    ADD CONSTRAINT "interaction_participants_interaction_workspace_org_fk" FOREIGN KEY ("interaction_id", "workspace_id", "organization_id") REFERENCES "public"."interactions"("id", "workspace_id", "organization_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interactions"
    ADD CONSTRAINT "interactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interactions"
    ADD CONSTRAINT "interactions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interactions"
    ADD CONSTRAINT "interactions_workspace_org_fk" FOREIGN KEY ("workspace_id", "organization_id") REFERENCES "public"."workspaces"("id", "organization_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_used_by_user_id_fkey" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



CREATE POLICY "Users can insert leads" ON "public"."intake_leads" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "contacts_org_isolation_delete" ON "public"."contacts" FOR DELETE USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "contacts_org_isolation_insert" ON "public"."contacts" FOR INSERT WITH CHECK (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "contacts_org_isolation_select" ON "public"."contacts" FOR SELECT USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "contacts_org_isolation_update" ON "public"."contacts" FOR UPDATE USING (("organization_id" = "public"."current_user_organization_id"())) WITH CHECK (("organization_id" = "public"."current_user_organization_id"()));



ALTER TABLE "public"."intake_leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "intake_leads_owner_select" ON "public"."intake_leads" FOR SELECT USING (("auth"."uid"() = "created_by"));



ALTER TABLE "public"."intakes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "intakes_org_isolation_delete" ON "public"."intakes" FOR DELETE USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "intakes_org_isolation_insert" ON "public"."intakes" FOR INSERT WITH CHECK (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "intakes_org_isolation_select" ON "public"."intakes" FOR SELECT USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "intakes_org_isolation_update" ON "public"."intakes" FOR UPDATE USING (("organization_id" = "public"."current_user_organization_id"())) WITH CHECK (("organization_id" = "public"."current_user_organization_id"()));



ALTER TABLE "public"."interaction_participants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "interaction_participants_org_isolation_delete" ON "public"."interaction_participants" FOR DELETE USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "interaction_participants_org_isolation_insert" ON "public"."interaction_participants" FOR INSERT WITH CHECK (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "interaction_participants_org_isolation_select" ON "public"."interaction_participants" FOR SELECT USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "interaction_participants_org_isolation_update" ON "public"."interaction_participants" FOR UPDATE USING (("organization_id" = "public"."current_user_organization_id"())) WITH CHECK ((("organization_id" = "public"."current_user_organization_id"()) AND (EXISTS ( SELECT 1
   FROM "public"."interactions" "i"
  WHERE (("i"."id" = "interaction_participants"."interaction_id") AND ("i"."workspace_id" = "interaction_participants"."workspace_id") AND ("i"."organization_id" = "interaction_participants"."organization_id")))) AND (EXISTS ( SELECT 1
   FROM "public"."contacts" "c"
  WHERE (("c"."id" = "interaction_participants"."contact_id") AND ("c"."workspace_id" = "interaction_participants"."workspace_id") AND ("c"."organization_id" = "interaction_participants"."organization_id"))))));



ALTER TABLE "public"."interactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "interactions_org_isolation_delete" ON "public"."interactions" FOR DELETE USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "interactions_org_isolation_insert" ON "public"."interactions" FOR INSERT WITH CHECK ((("organization_id" = "public"."current_user_organization_id"()) AND (EXISTS ( SELECT 1
   FROM "public"."workspaces" "w"
  WHERE (("w"."id" = "interactions"."workspace_id") AND ("w"."organization_id" = "interactions"."organization_id"))))));



CREATE POLICY "interactions_org_isolation_select" ON "public"."interactions" FOR SELECT USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "interactions_org_isolation_update" ON "public"."interactions" FOR UPDATE USING (("organization_id" = "public"."current_user_organization_id"())) WITH CHECK ((("organization_id" = "public"."current_user_organization_id"()) AND (EXISTS ( SELECT 1
   FROM "public"."workspaces" "w"
  WHERE (("w"."id" = "interactions"."workspace_id") AND ("w"."organization_id" = "interactions"."organization_id"))))));



ALTER TABLE "public"."invites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invites_admin_delete_org" ON "public"."invites" FOR DELETE USING ((("organization_id" = "public"."current_user_organization_id"()) AND "public"."has_role"('admin'::"text")));



CREATE POLICY "invites_admin_insert" ON "public"."invites" FOR INSERT WITH CHECK ((("organization_id" = "public"."current_user_organization_id"()) AND ("invited_by_user_id" = "auth"."uid"()) AND "public"."has_role"('admin'::"text") AND ("role" = ANY (ARRAY['admin'::"text", 'member'::"text"])) AND ("status" = 'invited'::"text")));



CREATE POLICY "invites_admin_read_org" ON "public"."invites" FOR SELECT USING ((("organization_id" = "public"."current_user_organization_id"()) AND "public"."has_role"('admin'::"text")));



CREATE POLICY "invites_admin_update_org" ON "public"."invites" FOR UPDATE USING ((("organization_id" = "public"."current_user_organization_id"()) AND "public"."has_role"('admin'::"text"))) WITH CHECK ((("organization_id" = "public"."current_user_organization_id"()) AND "public"."has_role"('admin'::"text") AND ("role" = ANY (ARRAY['admin'::"text", 'member'::"text"])) AND ("status" = ANY (ARRAY['invited'::"text", 'used'::"text", 'expired'::"text"]))));



CREATE POLICY "invites_invitee_read_own" ON "public"."invites" FOR SELECT USING ((("status" = 'invited'::"text") AND ("lower"("email") = "lower"(COALESCE(("auth"."jwt"() ->> 'email'::"text"), ''::"text")))));



ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizations_admin_update" ON "public"."organizations" FOR UPDATE USING ((("id" = "public"."current_user_organization_id"()) AND "public"."has_permission"('rbac.manage'::"text"))) WITH CHECK ((("id" = "public"."current_user_organization_id"()) AND "public"."has_permission"('rbac.manage'::"text")));



CREATE POLICY "organizations_no_client_delete" ON "public"."organizations" FOR DELETE USING (false);



CREATE POLICY "organizations_no_client_insert" ON "public"."organizations" FOR INSERT WITH CHECK (false);



CREATE POLICY "organizations_org_read" ON "public"."organizations" FOR SELECT USING (("id" = "public"."current_user_organization_id"()));



ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "permissions_admin_delete" ON "public"."permissions" FOR DELETE USING ("public"."has_permission"('rbac.manage'::"text"));



CREATE POLICY "permissions_admin_insert" ON "public"."permissions" FOR INSERT WITH CHECK ("public"."has_permission"('rbac.manage'::"text"));



CREATE POLICY "permissions_admin_update" ON "public"."permissions" FOR UPDATE USING ("public"."has_permission"('rbac.manage'::"text")) WITH CHECK ("public"."has_permission"('rbac.manage'::"text"));



CREATE POLICY "permissions_read_authenticated" ON "public"."permissions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."organization_id" = "public"."current_user_organization_id"())))));



ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "role_permissions_admin_delete" ON "public"."role_permissions" FOR DELETE USING (("public"."has_permission"('rbac.manage'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."roles" "r"
  WHERE (("r"."id" = "role_permissions"."role_id") AND ("r"."organization_id" = "public"."current_user_organization_id"()))))));



CREATE POLICY "role_permissions_admin_insert" ON "public"."role_permissions" FOR INSERT WITH CHECK (("public"."has_permission"('rbac.manage'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."roles" "r"
  WHERE (("r"."id" = "role_permissions"."role_id") AND ("r"."organization_id" = "public"."current_user_organization_id"()))))));



CREATE POLICY "role_permissions_org_read" ON "public"."role_permissions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."roles" "r"
  WHERE (("r"."id" = "role_permissions"."role_id") AND ("r"."organization_id" = "public"."current_user_organization_id"())))));



ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roles_admin_delete" ON "public"."roles" FOR DELETE USING ((("organization_id" = "public"."current_user_organization_id"()) AND "public"."has_permission"('rbac.manage'::"text")));



CREATE POLICY "roles_admin_insert" ON "public"."roles" FOR INSERT WITH CHECK ((("organization_id" = "public"."current_user_organization_id"()) AND "public"."has_permission"('rbac.manage'::"text")));



CREATE POLICY "roles_admin_update" ON "public"."roles" FOR UPDATE USING ((("organization_id" = "public"."current_user_organization_id"()) AND "public"."has_permission"('rbac.manage'::"text"))) WITH CHECK ((("organization_id" = "public"."current_user_organization_id"()) AND "public"."has_permission"('rbac.manage'::"text")));



CREATE POLICY "roles_org_isolation_select" ON "public"."roles" FOR SELECT USING (("organization_id" = "public"."current_user_organization_id"()));



ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_roles_admin_delete" ON "public"."user_roles" FOR DELETE USING (("public"."has_permission"('rbac.manage'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_roles"."user_id") AND ("u"."organization_id" = "public"."current_user_organization_id"())))) AND (EXISTS ( SELECT 1
   FROM "public"."roles" "r"
  WHERE (("r"."id" = "user_roles"."role_id") AND ("r"."organization_id" = "public"."current_user_organization_id"()))))));



CREATE POLICY "user_roles_admin_insert" ON "public"."user_roles" FOR INSERT WITH CHECK (("public"."has_permission"('rbac.manage'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_roles"."user_id") AND ("u"."organization_id" = "public"."current_user_organization_id"())))) AND (EXISTS ( SELECT 1
   FROM "public"."roles" "r"
  WHERE (("r"."id" = "user_roles"."role_id") AND ("r"."organization_id" = "public"."current_user_organization_id"()))))));



CREATE POLICY "user_roles_org_isolation_select" ON "public"."user_roles" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "user_roles"."user_id") AND ("u"."organization_id" = "public"."current_user_organization_id"())))) AND (EXISTS ( SELECT 1
   FROM "public"."roles" "r"
  WHERE (("r"."id" = "user_roles"."role_id") AND ("r"."organization_id" = "public"."current_user_organization_id"()))))));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_admin_delete" ON "public"."users" FOR DELETE USING ((("organization_id" = "public"."current_user_organization_id"()) AND "public"."has_permission"('rbac.manage'::"text")));



CREATE POLICY "users_no_direct_insert" ON "public"."users" FOR INSERT WITH CHECK (false);



CREATE POLICY "users_org_isolation_select" ON "public"."users" FOR SELECT USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "users_self_or_admin_update" ON "public"."users" FOR UPDATE USING ((("organization_id" = "public"."current_user_organization_id"()) AND (("id" = "auth"."uid"()) OR "public"."has_permission"('rbac.manage'::"text")))) WITH CHECK ((("organization_id" = "public"."current_user_organization_id"()) AND (("id" = "auth"."uid"()) OR "public"."has_permission"('rbac.manage'::"text"))));



CREATE POLICY "users_self_read" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."workspaces" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workspaces_org_isolation_delete" ON "public"."workspaces" FOR DELETE USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "workspaces_org_isolation_insert" ON "public"."workspaces" FOR INSERT WITH CHECK (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "workspaces_org_isolation_select" ON "public"."workspaces" FOR SELECT USING (("organization_id" = "public"."current_user_organization_id"()));



CREATE POLICY "workspaces_org_isolation_update" ON "public"."workspaces" FOR UPDATE USING (("organization_id" = "public"."current_user_organization_id"())) WITH CHECK (("organization_id" = "public"."current_user_organization_id"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON TABLE "public"."invites" TO "anon";
GRANT ALL ON TABLE "public"."invites" TO "authenticated";
GRANT ALL ON TABLE "public"."invites" TO "service_role";



GRANT ALL ON FUNCTION "public"."activate_invite"("target_invite_token" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."activate_invite"("target_invite_token" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."activate_invite"("target_invite_token" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_organization_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_organization_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_organization_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_interaction_status_transition"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_interaction_status_transition"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_interaction_status_transition"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("target_permission_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("target_permission_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("target_permission_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("target_role_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("target_role_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("target_role_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_membership"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_membership"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_membership"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_interaction_participant_scope"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_interaction_participant_scope"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_interaction_participant_scope"() TO "service_role";
























GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON TABLE "public"."intake_leads" TO "anon";
GRANT ALL ON TABLE "public"."intake_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."intake_leads" TO "service_role";



GRANT ALL ON TABLE "public"."intakes" TO "anon";
GRANT ALL ON TABLE "public"."intakes" TO "authenticated";
GRANT ALL ON TABLE "public"."intakes" TO "service_role";



GRANT ALL ON TABLE "public"."interaction_participants" TO "anon";
GRANT ALL ON TABLE "public"."interaction_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."interaction_participants" TO "service_role";



GRANT ALL ON TABLE "public"."interactions" TO "anon";
GRANT ALL ON TABLE "public"."interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."interactions" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."workspaces" TO "anon";
GRANT ALL ON TABLE "public"."workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."workspaces" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();


