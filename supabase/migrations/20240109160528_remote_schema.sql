
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '"public", "extensions"', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."allow_first_request_update_for_provider"() RETURNS trigger
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.first_request IS DISTINCT FROM OLD.first_request AND auth.uid() <> OLD.provider_id THEN
    RAISE EXCEPTION 'Only providers can change first_request status';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."allow_first_request_update_for_provider"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."prevent_messages_update_on_first_request"() RETURNS trigger
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF OLD.first_request AND NEW.messages IS DISTINCT FROM OLD.messages THEN
    RAISE EXCEPTION 'Cannot update messages while first_request is true';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."prevent_messages_update_on_first_request"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."chats" (
    "provider_id" uuid NOT NULL,
    "patient_id" uuid NOT NULL,
    "first_request" boolean DEFAULT true,
    "messages" json[]
);

ALTER TABLE "public"."chats" OWNER TO "postgres";

ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("provider_id", "patient_id");

CREATE TRIGGER check_first_request_update_before_update BEFORE UPDATE OF first_request ON public.chats FOR EACH ROW EXECUTE FUNCTION allow_first_request_update_for_provider();

CREATE TRIGGER check_messages_update_before_update BEFORE UPDATE OF messages ON public.chats FOR EACH ROW EXECUTE FUNCTION prevent_messages_update_on_first_request();

ALTER TABLE "public"."chats" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_for_patient" ON "public"."chats" FOR INSERT WITH CHECK ((auth.uid() = patient_id));

CREATE POLICY "select_chat_policy" ON "public"."chats" FOR SELECT USING (((auth.uid() = patient_id) OR (auth.uid() = provider_id)));

CREATE POLICY "update_chat_policy" ON "public"."chats" FOR UPDATE USING (((auth.uid() = provider_id) OR (auth.uid() = patient_id)));

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."allow_first_request_update_for_provider"() TO "anon";
GRANT ALL ON FUNCTION "public"."allow_first_request_update_for_provider"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."allow_first_request_update_for_provider"() TO "service_role";

GRANT ALL ON FUNCTION "public"."prevent_messages_update_on_first_request"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_messages_update_on_first_request"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_messages_update_on_first_request"() TO "service_role";

GRANT ALL ON TABLE "public"."chats" TO "anon";
GRANT ALL ON TABLE "public"."chats" TO "authenticated";
GRANT ALL ON TABLE "public"."chats" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
