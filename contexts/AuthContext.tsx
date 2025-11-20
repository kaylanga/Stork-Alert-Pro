import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Store } from '../types';

type AuthStatus = 'loading' | 'loggedOut' | 'awaitingConfirmation' | 'loggedIn';

interface AuthContextType {
  user: User | null;
  store: Store | null;
  status: AuthStatus;
  login: () => void;
  logout: () => void;
  confirmEmail: () => void;
}

const MOCK_USER: User = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  avatarUrl: 'https://i.pravatar.cc/150?u=jane_doe',
};

const MOCK_STORE: Store = {
    name: 'Momentum Wear',
    domain: 'momentum-wear.myshopify.com',
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    try {
      const storedStatus = localStorage.getItem('authStatus');
      if (storedStatus === 'loggedIn') {
        setUser(MOCK_USER);
        setStore(MOCK_STORE);
        setStatus('loggedIn');
      } else if (storedStatus === 'awaitingConfirmation') {
        setUser(MOCK_USER);
        setStore(MOCK_STORE);
        setStatus('awaitingConfirmation');
      } else {
        setStatus('loggedOut');
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
      setStatus('loggedOut');
    }
  }, []);

  const login = () => {
    setUser(MOCK_USER);
    setStore(MOCK_STORE);
    setStatus('awaitingConfirmation');
    localStorage.setItem('authStatus', 'awaitingConfirmation');
  };
  
  const confirmEmail = () => {
      if (status === 'awaitingConfirmation') {
          setStatus('loggedIn');
          localStorage.setItem('authStatus', 'loggedIn');
      }
  };

  const logout = () => {
    setUser(null);
    setStore(null);
    setStatus('loggedOut');
    localStorage.removeItem('authStatus');
  };

  const value = { user, store, status, login, logout, confirmEmail };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};