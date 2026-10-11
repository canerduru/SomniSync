import { DbProfile } from '../../types/database';

export interface UserSession {
  user: DbProfile;
  token: string;
}

export class AuthService {
  private readonly STORAGE_KEY = 'somnisync_user_session';

  getCurrentSession(): UserSession {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    // Initialize new anonymous dreamer session
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const newSession: UserSession = {
      user: {
        id: 'usr-' + Date.now().toString(36),
        anonymous_tag: `Dreamer #${randomHex}`,
        preferred_language: 'tr',
        allow_synastry: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      token: 'anon-jwt-' + Math.random().toString(36),
    };

    this.saveSession(newSession);
    return newSession;
  }

  saveSession(session: UserSession): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }

  updateProfile(updates: Partial<DbProfile>): UserSession {
    const session = this.getCurrentSession();
    session.user = {
      ...session.user,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveSession(session);
    return session;
  }

  purgeAccount(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export const authService = new AuthService();
