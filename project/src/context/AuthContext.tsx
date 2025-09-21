import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'employee' | 'admin';
  leaveBalance: number;
  department: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate IP-based authentication check
  const checkWiFiConnection = (): boolean => {
    // In real implementation, this would check the client IP against office WiFi IP ranges
    // For demo purposes, we'll simulate this with a random check or localStorage flag
    const isInOffice = localStorage.getItem('wifi_simulation') === 'connected' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
    return isInOffice;
  };

  useEffect(() => {
    // Check for existing session on app load
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check WiFi connection first
      if (!checkWiFiConnection()) {
        throw new Error('Access denied. You must be connected to office WiFi to login.');
      }

      // Simulate API call with demo users
      const demoUsers: User[] = [
        {
          id: '1',
          fullName: 'John Employee',
          email: 'john@company.com',
          role: 'employee',
          leaveBalance: 15,
          department: 'Engineering'
        },
        {
          id: '2',
          fullName: 'Sarah Admin',
          email: 'sarah@company.com',
          role: 'admin',
          leaveBalance: 20,
          department: 'HR'
        },
        {
          id: '3',
          fullName: 'Mike Developer',
          email: 'mike@company.com',
          role: 'employee',
          leaveBalance: 12,
          department: 'Engineering'
        }
      ];

      // Simple demo authentication
      const foundUser = demoUsers.find(u => 
        u.email === email && (password === 'password' || password === '123456')
      );

      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      // Simulate JWT token
      const token = `jwt_token_${foundUser.id}_${Date.now()}`;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(foundUser));
      setUser(foundUser);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};