import { useState, useRef, useEffect } from 'react';
import { X, User, Calendar, AlertTriangle, FileText, Image as ImageIcon, Save } from 'lucide-react';
import { Rectification, RectificationStatus, RectificationPriority } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface RectificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rectification: Rectification | null;
}

const statusOptions: { value: RectificationStatus; label: string; color: string }[] = [
  { value: 'pending', label: '待处理', color: 'text-amber-600 bg-amber-50' },
  { value: 'in_progress', label: '进行中', color: 'text-blue-600 bg-blue-50' },
  { value: 'completed', label: '已完成', color: 'text-green-600 bg-green-50' },
];

const priorityOptions: { value: RectificationPriority; label: string; color: string }[] = [
  { value: 'low', label: '低', color: 'text-gray-600 bg-gray-50' },
  { value: 'medium', label: '中', color: 'text-blue-600 bg-blue-50' },
  { value: 'high', label: '高', color: 'text-orange-600 bg-orange-50' },
  { value: 'urgent', label: '紧急', color: 'text-red-600 bg-red-50' },
];

const assigneeOptions = ['张三', '李四', '王五', '赵六', '孙七'];

export function RectificationDetailModal({ isOpen, onClose, rectification }: RectificationDetailModalProps) {
  const { updateRectification, shelves, rectifications } = useAppStore();
  const [formData, setFormData] = useState<Partial<Rectification>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && rectification) {
      const latest = rectifications.find(r => r.id === rectification.id);
      setFormData(latest ? { ...latest } : { ...rectification });
    }
  }, [isOpen, rectification, rectifications]);

  const handleSave = () => {
    if (!rectification) return;
    setSaving(true);
    setTimeout(() => {
      updateRectification(rectification.id, formData);
      setSaving(false);
      onClose();
    }, 300);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setFormData({ ...formData, afterPhotoUrl: url });
      };
      reader.readAsDataURL(file);
    }
  };

  const getShelfName = (shelfId?: string) => {
    if (!shelfId) return '-';
    return shelves.find(s => s.id === shelfId)?.name || shelfId;
  };

  if (!isOpen || !rectification) return null;

  const currentStatus = statusOptions.find(s => s.value === formData.status);
  const currentPriority = priorityOptions.find(p => p.value === formData.priority);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onTransitionEnd={handleOpen}>
        <div className="h-14 px-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] flex-shrink-0">
          <div className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold">整改任务详情</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">任务标题</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  优先级
                </span>
              </label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as RectificationPriority })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
              >
                {priorityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  状态
                </span>
              </label>
              <select
                value={formData.status || 'pending'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RectificationStatus })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  负责人
                </span>
              </label>
              <select
                value={formData.assignee || ''}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
              >
                {assigneeOptions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  截止日期
                </span>
              </label>
              <input
                type="date"
                value={formData.dueDate ? formData.dueDate.replace(/\//g, '-') : ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">关联货架</label>
            <div className="px-3 py-2.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg">
              {getShelfName(formData.shelfId)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">任务描述</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">处理说明</label>
            <textarea
              value={formData.resolutionNote || ''}
              onChange={(e) => setFormData({ ...formData, resolutionNote: e.target.value })}
              rows={3}
              placeholder="请输入整改处理说明..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" />
                整改后照片
              </span>
            </label>
            <div className="space-y-2">
              {formData.afterPhotoUrl ? (
                <div className="relative inline-block">
                  <img
                    src={formData.afterPhotoUrl}
                    alt="整改后照片"
                    className="w-full max-w-[200px] h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, afterPhotoUrl: '' })}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : null}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                上传整改后照片
              </button>
            </div>
          </div>

          {formData.completedAt && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                完成时间：{formData.completedAt}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex-1 py-2.5 text-sm text-white rounded-lg transition-colors flex items-center justify-center gap-2",
              saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存修改
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
