"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  is_approved: boolean;
  is_admin: boolean;
}

interface AuthContextType {
  user: (User & { profile?: UserProfile | null }) | null; // Allow profile to be null or undefined
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & { profile?: UserProfile | null }) | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error.message);
      return null;
    }
    return data as UserProfile;
  };

  const refreshUser = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id);
      setUser({ ...session.user, profile });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, session) => { // Removed unused 'event' parameter
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser({ ...session.user, profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Initial session check
    refreshUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return { success: false, error: error.message };
    }
    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      setUser({ ...data.user, profile });
      if (profile?.is_approved) {
        toast.success("Login realizado com sucesso!");
        return { success: true };
      } else {
        // If not approved, sign out immediately and redirect to pending page
        await supabase.auth.signOut();
        setUser(null);
        toast.warning("Sua conta está aguardando aprovação. Por favor, aguarde a autorização do administrador.");
        return { success: false, error: "Account pending approval" };
      }
    }
    setLoading(false);
    return { success: false, error: "Unknown error during sign in." };
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 1. Cria o usuário no Auth
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: email.split('@')[0], // Usa a parte antes do @ como nome
            avatar_url: '' // URL de avatar vazia por padrão
          },
          emailRedirectTo: 'https://projeto-3-sandy.vercel.app/auth/confirm' // URL de produção para redirecionamento
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // 2. Aguarda um pouco para o trigger do banco de dados processar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 3. Tenta buscar o perfil criado pelo trigger
        let profile = await fetchUserProfile(data.user.id);
        
        // 4. Se o perfil não foi criado pelo trigger, tenta criar manualmente
        if (!profile) {
          console.warn('Perfil não encontrado, criando manualmente...');
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                email: email,
                is_approved: false,
                is_admin: false
              }
            ])
            .select()
            .single();
            
          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            throw new Error('Erro ao criar perfil do usuário');
          }
          
          profile = newProfile;
        }

        setUser({ ...data.user, profile });
        toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.");
        return { success: true };
      }
      
      throw new Error('Erro desconhecido ao criar usuário');
      
    } catch (error: any) {
      console.error('Erro no registro:', error);
      const errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
    setUser(null);
    toast.success("Logout realizado com sucesso!");
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};