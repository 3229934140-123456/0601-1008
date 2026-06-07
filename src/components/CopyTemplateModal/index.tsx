import { useState } from 'react';
import { X, Copy, Store, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface CopyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSourceId?: string;
}

export function CopyTemplateModal({ isOpen, onClose, defaultSourceId }: CopyTemplateModalProps) {
  const { stores, copyStoreTemplate, setCurrentStore, currentStoreId } = useAppStore();
  const [sourceId, setSourceId] = useState(defaultSourceId || '');
  const [targetId, setTargetId] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [copying, setCopying] = useState(false);

  const handleCopy = () => {
    setStatus(null);
    setCopying(true);

    setTimeout(() => {
      const result = copyStoreTemplate(sourceId, targetId);
      setCopying(false);

      if (!result.success) {
        setStatus({ type: 'error', message: result.error || '复制失败' });
      } else {
        setStatus({ type: 'success', message: '模板复制成功！' });
        setTimeout(() => {
          setCurrentStore(targetId);
          onClose();
        }, 1000);
      }
    }, 500);
  };

  const sourceStore = stores.find(s => s.id === sourceId);
  const targetStore = stores.find(s => s.id === targetId);
  const canCopy = sourceId && targetId && sourceId !== targetId;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-14 px-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#1e3a5f] to-[#2c5282]">
          <div className="flex items-center gap-2 text-white">
            <Copy className="w-5 h-5" />
            <h2 className="font-bold">复制门店模板</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              源门店（复制模板来源）
            </label>
            <select
              value={sourceId}
              onChange={(e) => {
                setSourceId(e.target.value);
                setStatus(null);
              }}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
            >
              <option value="">请选择源门店</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} - {store.region}
                </option>
              ))}
            </select>
            {sourceStore && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <Store className="w-3 h-3" />
                {sourceStore.address}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Copy className="w-4 h-4 text-blue-600" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标门店（应用模板的门店）
            </label>
            <select
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
                setStatus(null);
              }}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
            >
              <option value="">请选择目标门店</option>
              {stores
                .filter(s => s.id !== sourceId)
                .map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.region}
                  </option>
                ))}
            </select>
            {targetStore && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <Store className="w-3 h-3" />
                {targetStore.address}
              </p>
            )}
          </div>

          {sourceId === targetId && sourceId && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                源门店和目标门店不能相同，请选择不同的门店
              </p>
            </div>
          )}

          {status && (
            <div className={cn(
              "flex items-start gap-2 p-3 rounded-lg",
              status.type === 'error' && "bg-red-50 border border-red-200",
              status.type === 'success' && "bg-green-50 border border-green-200"
            )}>
              {status.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <p className={cn(
                "text-xs",
                status.type === 'error' && "text-red-700",
                status.type === 'success' && "text-green-700"
              )}>
                {status.message}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1.5">
            <p className="font-medium text-gray-700">复制内容包括：</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>货架数量和类型（普通货架/端架/堆头）</li>
              <li>层板数量和高度设置</li>
              <li>商品陈列位置和排面数</li>
              <li>端架和堆头配置</li>
            </ul>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCopy}
            disabled={!canCopy || copying}
            className={cn(
              "flex-1 py-2.5 text-sm text-white rounded-lg transition-colors flex items-center justify-center gap-2",
              canCopy && !copying
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {copying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                复制中...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                确认复制
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
