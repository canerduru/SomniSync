import type { SynastryService, SynastryOverview } from '../contracts/synastry';
import { client } from './client';
export const supabaseSynastry: SynastryService = {
  async getOverview({ signal }) {
    let query = client().rpc('get_synastry');
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as SynastryOverview;
  },
};
