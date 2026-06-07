import { useState } from 'react';
import { Store, MapPin, Copy, ChevronDown, Star, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function Header() {
  const { stores, currentStoreId, setCurrentStore, totalScore } = useAppStore();
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  const currentStore = stores.find((s) => s.id === currentStoreId);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <header className="h-16 bg-[#1e3a5f] text-white flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide">智慧零售陈列管理系统</h1>
          <p className="text-xs text-blue-200">Smart Shelf Display Management</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors min-w-[280px]"
          >
            <Store className="w-5 h-5 text-orange-400" />
            <div className="text-left flex-1">
              <div className="text-sm font-medium">{currentStore?.name}</div>
              <div className="text-xs text-blue-200 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {currentStore?.address}
              </div>
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform", storeDropdownOpen && "rotate-180")} />
          </button>

          {storeDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      setCurrentStore(store.id);
                      setStoreDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between",
                      store.id === currentStoreId && "bg-blue-50"
                    )}
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {store.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs px-2 py-1 rounded-full", getScoreColor(store.score || 0))}>
                        {store.score}分
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t p-3">
                <button className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 py-2 rounded hover:bg-blue-50">
                  <Copy className="w-4 h-4" />
                  复制门店模板
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <div>
            <div className="text-xs text-blue-200">陈列评分</div>
            <div className={cn("text-lg font-bold", totalScore >= 90 ? "text-green-400" : totalScore >= 70 ? "text-yellow-400" : "text-red-400")}>
              {totalScore}分
            </div>
          </div>
        </div>

        <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center font-medium text-sm">
          李
        </div>
      </div>
    </header>
  );
}
