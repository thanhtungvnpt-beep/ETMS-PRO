import React, { useState } from 'react';
import { MasterAsset, UserProfile } from '../../types';
import { Search, Plus, Filter, Cpu, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AssetManagementProps {
  assets: MasterAsset[];
  currentUser: UserProfile;
}

export const AssetManagement: React.FC<AssetManagementProps> = ({ assets, currentUser }) => {
  const [filterFactory, setFilterFactory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = assets.filter((a) => {
    const factory = a.physicalFactory || (a as any).currentFactory;
    const matchFactory = filterFactory === 'ALL' || factory === filterFactory;
    const matchSearch =
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serial.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFactory && matchSearch;
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã tài sản, tên thiết bị, serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white"
            />
          </div>
          <select
            value={filterFactory}
            onChange={(e) => setFilterFactory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:bg-white"
          >
            <option value="ALL">Tất cả nhà máy</option>
            <option value="Nhà máy A">Nhà máy A</option>
            <option value="Nhà máy B">Nhà máy B</option>
            <option value="Nhà máy C">Nhà máy C</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Tổng danh mục: <strong className="text-slate-900">{filtered.length}</strong> thiết bị
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="border border-slate-200 rounded-lg p-3 bg-white hover:border-slate-300 transition-all flex gap-3"
          >
            <img
              src={asset.image}
              alt={asset.name}
              className="w-20 h-20 object-cover rounded-md border border-slate-200 shrink-0 shadow-2xs"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono font-bold text-blue-700 text-xs">{asset.code}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      (asset.operationalStatus || (asset as any).status) === 'Đang điều động'
                        ? 'bg-amber-100 text-amber-800'
                        : (asset.operationalStatus || (asset as any).status) === 'Sẵn sàng điều chuyển' || (asset as any).status === 'Sẵn sàng'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {asset.operationalStatus || (asset as any).status || 'Sẵn sàng'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 truncate" title={asset.name}>
                  {asset.name}
                </h4>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  SN: {asset.serial}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Vị trí: <strong>{asset.physicalFactory || (asset as any).currentFactory}</strong></span>
                <span className="font-mono tabular-nums text-slate-500">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(asset.originalValue)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
