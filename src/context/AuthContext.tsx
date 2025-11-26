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
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return { success: false, error: error.message };
    }
    if (data.user) {
      // The trigger `handle_new_user` should create the profile with is_approved: false
      // We don't need to manually insert here.
      // Just set the user with the pending profile.
      const profile = await fetchUserProfile(data.user.id);
      setUser({ ...data.user, profile });
      toast.success("Cadastro realizado com sucesso! Sua conta está aguardando aprovação.");
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: "Erro desconhecido ao cadastrar." };
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