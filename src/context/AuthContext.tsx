import React, { createContext, useContext, useState, useEffect } from 'react';
import { DbProfile } from '../types/database';
import { authService, UserSession } from '../services/auth/AuthService';

interface AuthContextType {
  session: UserSession;
  user: DbProfile;
  updateProfile: (updates: Partial<DbProfile>) => void;
  purgeAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(() => authService.getCurrentSession());

  const updateProfile = (updates: Partial<DbProfile>) => {
    const updated = authService.updateProfile(updates);
    setSession(updated);
  };

  const purgeAccount = () => {
    authService.purgeAccount();
    const fresh = authService.getCurrentSession();
    setSession(fresh);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session.user,
        updateProfile,
        purgeAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
