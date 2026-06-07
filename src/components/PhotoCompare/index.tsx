import { useState, useRef } from 'react';
import { X, Upload, Image, Columns, Layers, Plus, Trash2, Camera, GalleryHorizontalEnd } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface PhotoCompareProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoCompare({ isOpen, onClose }: PhotoCompareProps) {
  const { photos, addPhoto, removePhoto, currentShelfId, shelves } = useAppStore();
  const [compareMode, setCompareMode] = useState<'split' | 'overlay'>('split');
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [selectedOnsiteId, setSelectedOnsiteId] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const standardPhotos = photos.filter(p => p.type === 'standard');
  const onsitePhotos = photos.filter(p => p.type === 'onsite');

  const currentShelf = shelves.find(s => s.id === currentShelfId);
  const shelfStandardPhotos = standardPhotos.filter(p => p.shelfId === currentShelfId);

  const handleUpload = (type: 'standard' | 'onsite') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          addPhoto({
            url,
            name: `${type === 'standard' ? '标准图' : '现场图'}-${Date.now()}`,
            type,
            shelfId: currentShelfId,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const selectedStandard = photos.find(p => p.id === selectedStandardId);
  const selectedOnsite = photos.find(p => p.id === selectedOnsiteId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-full flex flex-col overflow-hidden">
        <div className="h-14 px-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#1e3a5f] to-[#2c5282]">
          <div className="flex items-center gap-3 text-white">
            <GalleryHorizontalEnd className="w-5 h-5" />
            <h2 className="font-bold">照片对比</h2>
            <span className="text-sm text-blue-200">{currentShelf?.name}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50">
            <div className="p-3 border-b border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-2">对比模式</div>
              <div className="flex gap-1">
                <button
                  onClick={() => setCompareMode('split')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-lg transition-colors",
                    compareMode === 'split'
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  )}
                >
                  <Columns className="w-3.5 h-3.5" />
                  分屏
                </button>
                <button
                  onClick={() => setCompareMode('overlay')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-lg transition-colors",
                    compareMode === 'overlay'
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  叠加
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    标准图
                  </span>
                  <button
                    onClick={() => handleUpload('standard')}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    上传
                  </button>
                </div>
                <div className="space-y-2">
                  {shelfStandardPhotos.length === 0 && standardPhotos.length === 0 ? (
                    <div className="text-center py-4 bg-white rounded-lg border border-dashed border-gray-300">
                      <Image className="w-6 h-6 mx-auto text-gray-300 mb-1" />
                      <p className="text-xs text-gray-400">暂无标准图</p>
                    </div>
                  ) : (
                    [...shelfStandardPhotos, ...standardPhotos.filter(p => p.shelfId !== currentShelfId)].map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedStandardId(photo.id)}
                        className={cn(
                          "bg-white rounded-lg border overflow-hidden cursor-pointer transition-all",
                          selectedStandardId === photo.id
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="aspect-video bg-gray-100 relative">
                          {photo.url ? (
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-8 h-8 text-gray-300 absolute inset-0 m-auto" />
                          )}
                          {photo.shelfId && (
                            <span className="absolute top-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                              {shelves.find(s => s.id === photo.shelfId)?.name}
                            </span>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-gray-700 truncate">{photo.name}</p>
                          <p className="text-[10px] text-gray-400">{photo.uploadTime}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    现场图
                  </span>
                  <button
                    onClick={() => handleUpload('onsite')}
                    className="text-blue-600 text-xs hover:underline flex items-center gap-0.5"
                  >
                    <Camera className="w-3 h-3" />
                    上传
                  </button>
                </div>
                <div className="space-y-2">
                  {onsitePhotos.length === 0 ? (
                    <div className="text-center py-4 bg-white rounded-lg border border-dashed border-gray-300">
                      <Camera className="w-6 h-6 mx-auto text-gray-300 mb-1" />
                      <p className="text-xs text-gray-400">暂无现场图</p>
                    </div>
                  ) : (
                    onsitePhotos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedOnsiteId(photo.id)}
                        className={cn(
                          "bg-white rounded-lg border overflow-hidden cursor-pointer transition-all group",
                          selectedOnsiteId === photo.id
                            ? "border-orange-500 ring-2 ring-orange-200"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="aspect-video bg-gray-100 relative">
                          {photo.url ? (
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-8 h-8 text-gray-300 absolute inset-0 m-auto" />
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 text-white rounded-full items-center justify-center opacity-0 group-hover:flex transition-opacity hover:bg-red-600 hidden"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-gray-700 truncate">{photo.name}</p>
                          <p className="text-[10px] text-gray-400">{photo.uploadTime}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-gray-900 p-4">
            {compareMode === 'overlay' && (
              <div className="mb-3 flex items-center gap-3 text-white text-xs">
                <span className="text-gray-400">透明度</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="w-10 text-right">{overlayOpacity}%</span>
              </div>
            )}

            <div className="flex-1 relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              {compareMode === 'split' ? (
                <div className="flex w-full h-full">
                  <div className="flex-1 border-r border-gray-700 relative flex items-center justify-center">
                    <div className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      标准图
                    </div>
                    {selectedStandard ? (
                      <img src={selectedStandard.url} alt="标准图" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">请选择标准图</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative flex items-center justify-center">
                    <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      现场图
                    </div>
                    {selectedOnsite ? (
                      <img src={selectedOnsite.url} alt="现场图" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">请选择现场图</p>
                        <button
                          onClick={() => handleUpload('onsite')}
                          className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                        >
                          上传现场照片
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {selectedStandard && (
                    <img src={selectedStandard.url} alt="标准图" className="max-w-full max-h-full object-contain absolute" />
                  )}
                  {selectedOnsite && (
                    <img
                      src={selectedOnsite.url}
                      alt="现场图"
                      className="max-w-full max-h-full object-contain relative"
                      style={{ opacity: overlayOpacity / 100 }}
                    />
                  )}
                  {!selectedStandard && !selectedOnsite && (
                    <div className="text-center text-gray-500">
                      <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">请选择两张照片进行叠加对比</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {selectedStandard && selectedOnsite && (
                  <span>正在对比: {selectedStandard.name} ↔ {selectedOnsite.name}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpload('onsite')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  上传现场照
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
