CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE hospital_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('UPLOADED', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('TRIAL', 'BASIC', 'STANDARD', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'RETRYING');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_code varchar(32) NOT NULL UNIQUE,
  slug varchar(160) NOT NULL UNIQUE,
  name varchar(160) NOT NULL,
  facility_type varchar(80) NOT NULL,
  license_number varchar(80) NOT NULL UNIQUE,
  business_email varchar(160) NOT NULL,
  phone varchar(40) NOT NULL,
  province varchar(80) NOT NULL,
  city varchar(80) NOT NULL,
  postal_code varchar(20) NOT NULL,
  address text,
  status hospital_status NOT NULL DEFAULT 'ACTIVE',
  subscription_tier subscription_tier NOT NULL DEFAULT 'TRIAL',
  activated_at timestamptz,
  deactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name varchar(80) NOT NULL,
  last_name varchar(80) NOT NULL,
  email varchar(160) NOT NULL UNIQUE,
  contact_number varchar(40),
  password_hash text NOT NULL,
  role user_role NOT NULL,
  status user_status NOT NULL DEFAULT 'PENDING',
  hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id varchar(40) NOT NULL UNIQUE,
  status application_status NOT NULL DEFAULT 'DRAFT',
  hospital_name varchar(160) NOT NULL,
  facility_type varchar(80) NOT NULL,
  license_number varchar(80) NOT NULL UNIQUE,
  business_email varchar(160) NOT NULL,
  phone varchar(40) NOT NULL,
  province varchar(80) NOT NULL,
  city varchar(80) NOT NULL,
  postal_code varchar(20) NOT NULL,
  address text,
  manager_first_name varchar(80) NOT NULL,
  manager_last_name varchar(80) NOT NULL,
  manager_email varchar(160) NOT NULL,
  manager_contact_number varchar(40) NOT NULL,
  manager_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  rejection_reason text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES hospital_applications(id) ON DELETE CASCADE,
  document_type varchar(80) NOT NULL,
  original_file_name varchar(255) NOT NULL,
  mime_type varchar(120) NOT NULL,
  size_bytes integer NOT NULL,
  storage_provider varchar(40) NOT NULL,
  storage_key text NOT NULL,
  secure_url text,
  status document_status NOT NULL DEFAULT 'UPLOADED',
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  action varchar(80) NOT NULL,
  ip_address varchar(80),
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id text PRIMARY KEY DEFAULT 'global',
  registration_enabled boolean NOT NULL DEFAULT true,
  allowed_file_types jsonb NOT NULL DEFAULT '["application/pdf","image/png","image/jpeg","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]'::jsonb,
  max_upload_size_mb integer NOT NULL DEFAULT 5,
  default_subscription_tier subscription_tier NOT NULL DEFAULT 'TRIAL',
  support_email varchar(160) NOT NULL DEFAULT 'support@halo.pk',
  rejection_reasons jsonb NOT NULL DEFAULT '["Invalid or expired license","Missing required documents","Unable to verify facility details","Duplicate registration"]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type varchar(80) NOT NULL UNIQUE,
  subject varchar(200) NOT NULL,
  body text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type varchar(80) NOT NULL,
  recipient varchar(160) NOT NULL,
  subject varchar(200) NOT NULL,
  body text NOT NULL,
  status notification_status NOT NULL DEFAULT 'PENDING',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_hospital_idx ON users(hospital_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS hospital_applications_status_idx ON hospital_applications(status);
CREATE INDEX IF NOT EXISTS hospital_applications_manager_email_idx ON hospital_applications(manager_email);
CREATE INDEX IF NOT EXISTS hospital_documents_application_idx ON hospital_documents(application_id);
CREATE INDEX IF NOT EXISTS session_audit_logs_user_idx ON session_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS session_audit_logs_action_idx ON session_audit_logs(action);
CREATE INDEX IF NOT EXISTS hospitals_status_idx ON hospitals(status);
CREATE INDEX IF NOT EXISTS notification_logs_status_idx ON notification_logs(status);
