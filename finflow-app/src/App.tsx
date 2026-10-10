import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import { FinanceService } from './services/financeService';
import type { Transaction, Budget, AppNotification, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { TransactionModal } from './components/TransactionModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { BudgetPage } from './pages/Budget';
import { AnalyticsPage } from './pages/Analytics';
import { AIAssistantPage } from './pages/AIAssistant';
import { ProfilePage } from './pages/ProfilePage';
import { SplashScreen } from './pages/SplashScreen';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

type AppState = 'splash' | 'login' | 'signup' | 'app';

export function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [session, setSession] = useState<Session | null>(null);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(() => FinanceService.getTransactions());
  const [budget, setBudget] = useState<Budget>(() => FinanceService.getBudget());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => FinanceService.getNotifications());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => FinanceService.getUserProfile());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => userProfile.theme || 'dark');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  const summary = FinanceService.getSummary();

  // ──────────────────────────────────────────────
  // Supabase session: restore on mount + subscribe
  // ──────────────────────────────────────────────
  useEffect(() => {
    // Check for existing session (e.g. page refresh after login)
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setSession(data.session);
        await FinanceService.loadUserDataFromSupabase(data.session.user.id);
        setTransactions(FinanceService.getTransactions());
        setBudget(FinanceService.getBudget());
        setUserProfile(FinanceService.getUserProfile());
        setAppState('app');
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await FinanceService.loadUserDataFromSupabase(newSession.user.id);
        setTransactions(FinanceService.getTransactions());
        setBudget(FinanceService.getBudget());
        setUserProfile(FinanceService.getUserProfile());
      } else if (appState === 'app') {
        setAppState('login');
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Apply theme class to body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const newTheme: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    const updatedProfile: UserProfile = { ...userProfile, theme: newTheme };
    setUserProfile(updatedProfile);
    FinanceService.saveUserProfile(updatedProfile);
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    FinanceService.addTransaction(newTx);
    setTransactions(FinanceService.getTransactions());
  };

  const handleDeleteTransaction = (id: string) => {
    FinanceService.deleteTransaction(id);
    setTransactions(FinanceService.getTransactions());
  };

  const handleUpdateBudget = (newBudget: Budget) => {
    FinanceService.saveBudget(newBudget);
    setBudget(newBudget);
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    FinanceService.saveUserProfile(updated);
    setUserProfile(updated);
  };

  const handleMarkNotifRead = (id: string) => {
    const updated = FinanceService.markNotificationRead(id);
    setNotifications(updated);
  };

  const handleClearNotifs = () => {
    FinanceService.clearNotifications();
    setNotifications([]);
  };

  const handleLogin = useCallback((newSession: Session) => {
    setSession(newSession);
    setAppState('app');
  }, []);

  const handleSignup = useCallback((newSession: Session) => {
    setSession(newSession);
    setAppState('app');
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAppState('login');
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // ── Splash ──
  if (appState === 'splash') {
    return <SplashScreen onFinish={() => setAppState('login')} />;
  }

  // ── Login ──
  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} onGoSignup={() => setAppState('signup')} />;
  }

  // ── Signup ──
  if (appState === 'signup') {
    return <SignupPage onSignup={handleSignup} onGoLogin={() => setAppState('login')} />;
  }

  // ── Main App ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        netBalance={summary.netBalance}
        unreadNotifCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            summary={summary}
            transactions={transactions}
            onOpenAddModal={() => setIsModalOpen(true)}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <Transactions
            transactions={transactions}
            onAddTransactionClick={() => setIsModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPage
            budget={budget}
            transactions={transactions}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage transactions={transactions} />
        )}

        {activeTab === 'ai-assistant' && (
          <AIAssistantPage
            accessToken={session?.access_token ?? null}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            profile={userProfile}
            netBalance={summary.netBalance}
            onUpdateProfile={handleUpdateProfile}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onLogout={handleLogout}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 transition-colors">
        <p>© 2026 FinFlow AI Personal Finance Assistant • Currency: INR (₹) • Built with React &amp; Tailwind CSS</p>
      </footer>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifRead}
        onClearAll={handleClearNotifs}
      />
    </div>
  );
}

export default App;
