-- Run this in Supabase SQL Editor to create auth users for seeding
-- Safe to re-run (skips existing users)

do $$
declare
  v_uid uuid;
  v_pw text;
  v_email text;
  v_name text;
  v_i int;
begin
  select crypt('password123', gen_salt('bf')) into v_pw;

  for v_i in 0..5 loop
    case v_i
      when 0 then v_email := 'super_admin@acme.com'; v_name := 'Alice Johnson';
      when 1 then v_email := 'admin@acme.com'; v_name := 'Bob Smith';
      when 2 then v_email := 'manager@acme.com'; v_name := 'Carol Williams';
      when 3 then v_email := 'executive@acme.com'; v_name := 'David Brown';
      when 4 then v_email := 'executive2@acme.com'; v_name := 'Eva Martinez';
      when 5 then v_email := 'viewer@acme.com'; v_name := 'Frank Lee';
    end case;

    if exists (select 1 from auth.users where email = v_email) then
      raise notice 'Already exists: %', v_email;
      continue;
    end if;

    v_uid := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid,
      'authenticated', 'authenticated', v_email, v_pw, now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', v_name),
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (v_uid, v_uid, jsonb_build_object('sub', v_uid::text, 'email', v_email), 'email', v_email, now(), now(), now());

    raise notice 'Created: %', v_email;
  end loop;
end;
$$;
