import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProductLibrary } from '@/components/ProductLibrary';
import { ShelfCanvas } from '@/components/ShelfCanvas';
import { RightPanel } from '@/components/RightPanel';
import { PhotoCompare } from '@/components/PhotoCompare';
import { CopyTemplateModal } from '@/components/CopyTemplateModal';
import { useAppStore } from '@/store/useAppStore';
import { GalleryHorizontalEnd, Image as ImageIcon, ListTodo, FileDown, Copy, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { calculateViolations, calculateScore, setActivePanel, rectifications, activePanel, currentStoreId } = useAppStore();
  const [showPhotoCompare, setShowPhotoCompare] = useState(false);
  const [showCopyTemplate, setShowCopyTemplate] = useState(false);

  useEffect(() => {
    calculateViolations();
    calculateScore();
  }, [calculateViolations, calculateScore]);

  const pendingCount = rectifications.filter(r => r.status !== 'completed').length;

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Header onOpenCopyTemplate={() => setShowCopyTemplate(true)} />

      <div className="flex-1 flex overflow-hidden">
        <ProductLibrary />
        <ShelfCanvas />
        <RightPanel />
      </div>

      <div className="h-14 bg-white border-t border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPhotoCompare(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <GalleryHorizontalEnd className="w-4 h-4" />
            照片对比
          </button>
          <button
            onClick={() => setShowCopyTemplate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            复制模板
          </button>
          <button
            onClick={() => alert('保存为模板成功')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存模板
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePanel('rectifications')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors relative",
              activePanel === 'rectifications'
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <ListTodo className="w-4 h-4" />
            整改清单
            {pendingCount > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center rounded-full",
                activePanel === 'rectifications' ? "bg-white text-blue-600" : "bg-red-500 text-white"
              )}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActivePanel('rules')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
              activePanel === 'rules'
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <ImageIcon className="w-4 h-4" />
            规则检查
          </button>
          <button
            onClick={() => setActivePanel('export')}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      <PhotoCompare isOpen={showPhotoCompare} onClose={() => setShowPhotoCompare(false)} />
      <CopyTemplateModal isOpen={showCopyTemplate} onClose={() => setShowCopyTemplate(false)} defaultSourceId={currentStoreId} />
    </div>
  );
}
