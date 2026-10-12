import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { backendEnabled, supabase } from '@/services/supabase/client';
const AuthContext = createContext<{ session: Session | null; loading: boolean }>({
  session: null,
  loading: true,
});
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(backendEnabled);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, value) => {
      if (alive) {
        setSession(value);
        setLoading(false);
      }
    });
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (alive) {
          setSession(data.session);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);
  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
