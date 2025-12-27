
import React, { useState, useRef } from 'react';
import { CustomerData } from '../types';
import MapDisplay from './MapDisplay';
import { Upload, UserPlus, Trash2, CheckCircle2, AlertCircle, X, Search, FileText } from 'lucide-react';
import { geocodeAddresses } from '../services/geminiService';
import * as XLSX from 'xlsx';

interface AdminDashboardProps {
  customers: CustomerData[];
  onUpdateCustomers: (customers: CustomerData[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ customers, onUpdateCustomers }) => {
  const [pendingUploads, setPendingUploads] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // 스프레드시트의 컬럼명을 CustomerData 필드와 유연하게 매핑
      const rawParsed: Partial<CustomerData>[] = jsonData.map(row => {
        // 한글/영문 다양한 헤더 대응
        const findVal = (keys: string[]) => {
          const key = Object.keys(row).find(k => keys.some(target => k.includes(target)));
          return key ? String(row[key]).trim() : '';
        };

        return {
          id: Math.random().toString(36).substr(2, 9),
          name: findVal(['이름', '성함', '고객', 'name', 'customer']),
          phone: findVal(['전화', '연락처', '휴대폰', 'phone', 'tel', 'mobile']),
          address: findVal(['주소', '지번', '도로명', 'address', 'addr']),
          memo: findVal(['메모', '비고', '특이사항', 'memo', 'note', 'desc']),
        };
      }).filter(item => item.name || item.address); // 이름이나 주소 중 하나는 있어야 유효함

      if (rawParsed.length === 0) {
        alert('유효한 데이터를 찾을 수 없습니다. 파일의 헤더(이름, 주소 등)를 확인해주세요.');
        setIsLoading(false);
        return;
      }

      // Gemini 서비스를 통해 주소 정제 및 좌표 추출
      const enriched = await geocodeAddresses(rawParsed);
      setPendingUploads(prev => [...prev, ...enriched]);
    } catch (error) {
      console.error("File upload error:", error);
      alert('파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePending = (id: string) => {
    setPendingUploads(prev => prev.filter(p => p.id !== id));
  };

  const confirmUploads = () => {
    const updated = [...customers, ...pendingUploads.map(p => ({ ...p, status: 'active' as const }))];
    onUpdateCustomers(updated);
    setPendingUploads([]);
  };

  const deleteExisting = (id: string) => {
    onUpdateCustomers(customers.filter(c => c.id !== id));
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">고객 데이터 업로드</h2>
            <UserPlus className="text-indigo-600" />
          </div>
          <p className="text-sm text-slate-500 mb-6">XLSX, XLS, CSV 파일을 업로드하여 고객 리스트를 등록하세요.</p>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv, .xlsx, .xls"
            className="hidden"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-slate-600 hover:text-indigo-600 font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                <span>데이터 분석 중...</span>
              </div>
            ) : (
              <>
                <Upload size={20} />
                <span>엑셀/CSV 파일 선택</span>
              </>
            )}
          </button>
        </section>

        {pendingUploads.length > 0 && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-200 ring-4 ring-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-indigo-800">검토 대기 중 ({pendingUploads.length})</h2>
              <button 
                onClick={() => setPendingUploads([])}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4 pr-2 custom-scrollbar">
              {pendingUploads.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 truncate">{item.address}</p>
                  </div>
                  <button 
                    onClick={() => removePending(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={confirmUploads}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              최종 데이터 확정
            </button>
          </section>
        )}

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">등록 고객 명단</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="고객명, 주소 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-40"
              />
            </div>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto text-slate-300 mb-2" size={40} />
                <p className="text-slate-400 text-sm">등록된 고객 데이터가 없습니다.</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div key={customer.id} className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{customer.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          customer.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {customer.status === 'active' ? '진행중' : '완료'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">{customer.address}</p>
                    </div>
                    <button 
                      onClick={() => deleteExisting(customer.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
          <MapDisplay customers={[...customers, ...pendingUploads]} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
