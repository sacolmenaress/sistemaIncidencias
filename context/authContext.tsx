import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { api } from '../services/apiCliente'; 


interface AuthResponse {
  token: string;
  user: User;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'contador' | 'tecnico' | 'admin'; 
  mustChangePassword: boolean;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) { 
        console.error('Error al parsear el usuario de Localstorage', e);
        localStorage.clear();
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false); 
  }, []);


  
  const login = async (data: LoginData) => {
    try {
     
      const response = await api.post('/auth/login', data);
      

      const { token, user } = response as AuthResponse;
      

      setToken(token);
      setUser(user);
      

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));


    } catch (error) {
      console.error('Error en el login:', error);
      throw error; 
    }
  };
  

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    token,
    isAuthenticated: !!token,
    user,
    login,
    logout,
    isLoading,
    setUser
  };

  return <AuthContext.Provider value={value}>
    {children}
    </AuthContext.Provider>;
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}