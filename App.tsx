
import React, { useState, useEffect } from 'react';
import { UserRole, User, CustomerData } from './types';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { LogIn, Users, ShieldCheck, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<CustomerData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('as-isaac-customers');
    if (saved) setCustomers(JSON.parse(saved));
  }, []);

  const saveCustomers = (newCustomers: CustomerData[]) => {
    setCustomers(newCustomers);
    localStorage.setItem('as-isaac-customers', JSON.stringify(newCustomers));
  };

  const handleLogin = (role: UserRole) => {
    setCurrentUser({
      id: role === UserRole.ADMIN ? 'admin-1' : 'user-1',
      username: role === UserRole.ADMIN ? '관리자' : '상담사',
      role
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-600 rounded-2xl">
              <Users size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">AS-ISAAC</h1>
          <p className="text-slate-500 text-center mb-8">통합 고객 관리 시스템</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin(UserRole.ADMIN)}
              className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl border border-slate-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">관리자 모드</p>
                  <p className="text-sm text-slate-500">고객 데이터 업로드 및 총괄 관리</p>
                </div>
              </div>
              <LogIn size={20} className="text-slate-400" />
            </button>

            <button 
              onClick={() => handleLogin(UserRole.USER)}
              className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl border border-slate-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-200 text-slate-600 rounded-lg group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <UserCircle size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">사용자 모드</p>
                  <p className="text-sm text-slate-500">할당된 고객 상담 및 방문 확인</p>
                </div>
              </div>
              <LogIn size={20} className="text-slate-400" />
            </button>
          </div>
          
          <p className="mt-8 text-center text-xs text-slate-400">
            © 2024 AS-ISAAC Customer Management. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600" />
            <span className="text-xl font-bold tracking-tight">AS-ISAAC CRM</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              currentUser.role === UserRole.ADMIN ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'
            }`}>
              {currentUser.role}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">
              <span className="text-slate-900">{currentUser.username}</span>님 환영합니다
            </span>
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser.role === UserRole.ADMIN ? (
          <AdminDashboard customers={customers} onUpdateCustomers={saveCustomers} />
        ) : (
          <UserDashboard customers={customers.filter(c => c.status !== 'pending')} />
        )}
      </main>
    </div>
  );
};

export default App;
