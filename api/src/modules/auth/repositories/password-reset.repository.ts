import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { SupabaseClientService } from '../../../infraestructure/external-apis/supabase';
import { PasswordReset } from '../../../database/entities/password-reset.entity';

@Injectable()
export class PasswordResetRepository extends BaseRepository<PasswordReset> {
  protected readonly tableName = 'password_resets';

  constructor(supabaseClientService: SupabaseClientService) {
    super(supabaseClientService);
  }

  async createReset(data: Partial<PasswordReset>) {
    return this.create(data);
  }

  async findActiveByEmail(email: string): Promise<PasswordReset | null> {
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .eq('usado', false)
      .gt('expira_en', now)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) {
      throw new Error(`Error buscando password reset: ${error.message}`);
    }

    return (data as PasswordReset) || null;
  }

  async setTokenHash(id: string, tokenHash: string) {
    return this.update(id, { token_hash: tokenHash } as Partial<PasswordReset>);
  }

  async markUsed(id: string) {
    return this.update(id, { usado: true } as Partial<PasswordReset>);
  }

  async invalidateOldResets(email: string) {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({ usado: true })
      .eq('email', email)
      .eq('usado', false);

    if (error) {
      throw new Error(`Error invalidando password resets: ${error.message}`);
    }

    return data;
  }

  async findByTokenActive(tokenHash: string): Promise<PasswordReset | null> {
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('usado', false)
      .gt('expira_en', now)
      .maybeSingle();

    if (error) {
      throw new Error(`Error buscando password reset por token: ${error.message}`);
    }

    return (data as PasswordReset) || null;
  }
}
