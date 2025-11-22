export interface SupabaseConfig {
  url: string;
  key: string;
  schema?: string;
}

export const loadSupabaseConfig = (): SupabaseConfig => {

  const url = process.env.SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SUPABASE_ANON_KEY?.trim();

  if (!url) {
    throw new Error('Supabase URL not provided. Set the SUPABASE_URL environment variable. ' + url);
  }

  if (!key) {
    throw new Error(
      'Supabase key not provided. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable.',
    );
  }

  const schema = process.env.SUPABASE_SCHEMA?.trim();

  return { url, key, schema };
};
