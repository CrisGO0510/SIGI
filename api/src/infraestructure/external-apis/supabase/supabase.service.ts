import { Injectable } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { loadSupabaseConfig } from '../../../config/supabase.config';

@Injectable()
export class SupabaseClientService {
  private readonly client: SupabaseClient;

  constructor() {
    const { url, key } = loadSupabaseConfig();

    this.client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
