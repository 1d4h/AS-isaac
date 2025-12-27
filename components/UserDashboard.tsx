
import React, { useState } from 'react';
import { CustomerData } from '../types';
import MapDisplay from './MapDisplay';
import { Phone, MessageSquare, CheckCircle, MapPin, Search, Calendar } from 'lucide-react';

interface UserDashboardProps {
  customers: CustomerData[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ customers }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCustomer = customers.find(c => c.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-4 order-2 lg:order-1 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="text-indigo-600" />
            내 상담/방문 리스트
          </h2>
          
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {customers.length === 0 ? (
              <div className="text-center py-20">
                <Search size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400">배정된 고객 정보가 없습니다.</p>
              </div>
            ) : (
              customers.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedId === c.id 
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100 shadow-md' 
                    : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      c.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-200'
                    }`}>
                      {c.status === 'completed' ? '관리완료' : '진행중'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{c.address}</p>
                  
                  {selectedId === c.id && (
                    <div className="flex gap-2 pt-2 border-t border-indigo-200">
                      <a href={`tel:${c.phone}`} className="flex-1 flex items-center justify-center py-2 bg-white border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                        <Phone size={16} />
                      </a>
                      <button className="flex-1 flex items-center justify-center py-2 bg-white border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                        <MessageSquare size={16} />
                      </button>
                      <button className="flex-[2] flex items-center justify-center gap-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm">
                        <CheckCircle size={16} />
                        관리 완료
                      </button>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {selectedCustomer && (
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <MapPin size={18} className="text-indigo-400" />
              고객 요구사항 및 특이사항
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {selectedCustomer.memo || '기록된 상담 메모가 없습니다.'}
            </p>
          </div>
        )}
      </div>

      <div className="lg:col-span-8 order-1 lg:order-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
        <MapDisplay customers={customers} selectedCustomer={selectedCustomer} />
      </div>
    </div>
  );
};

export default UserDashboard;
