import React, { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '0.7s' }} />

      {/* Logo + brand */}
      <div className="relative flex flex-col items-center space-y-6 splash-enter">
        {/* Logo ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-600 to-emerald-400 blur-xl opacity-60 scale-110 animate-pulse" />
          <div className="relative h-28 w-28 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10">
            <img src="/logo.png" alt="FinFlow Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-emerald-300">
            FinFlow
          </h1>
          <p className="mt-2 text-slate-400 text-sm font-medium tracking-widest uppercase">
            AI Personal Finance Assistant
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex space-x-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-indigo-400 splash-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .splash-enter {
          animation: splashIn 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes splashIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .splash-dot {
          animation: splashBounce 1.2s ease-in-out infinite;
        }
        @keyframes splashBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
};
