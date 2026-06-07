import { Shield, ListTodo, FileDown, AlertCircle, CheckCircle, Clock, Plus, User, Calendar, Download, Image, FileText, ListTodo as ListTodoIcon, CheckCheck, LayoutGrid, AlignLeft, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getStatusColor, getStatusLabel } from '@/utils';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { staffMembers } from '@/data/mockData';
import { RectificationDetailModal } from '@/components/RectificationDetailModal';
import { Rectification, RectificationStatus, RectificationPriority } from '@/types';

type TabType = 'rules' | 'rectifications' | 'export';

function RulesPanel() {
  const { violations, rules, totalScore, shelves, currentShelfId, addRectificationFromViolation, setActivePanel } = useAppStore();
  const [generating, setGenerating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const currentShelfViolations = violations.filter((v) => v.shelfId === currentShelfId);
  const errorCount = currentShelfViolations.filter((v) => v.severity === 'error').length;
  const warningCount = currentShelfViolations.filter((v) => v.severity === 'warning').length;

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const handleGenerateRect = async (violation: typeof violations[0]) => {
    const result = addRectificationFromViolation(violation);
    if (result.success) {
      showToast('整改任务已生成', 'success');
    } else if (result.alreadyExists) {
      showToast('该违规已生成过整改任务', 'warning');
    }
  };

  const handleGenerateAll = () => {
    let generated = 0;
    let skipped = 0;
    currentShelfViolations.forEach(v => {
      const result = addRectificationFromViolation(v);
      if (result.success) generated++;
      else if (result.alreadyExists) skipped++;
    });
    if (generated > 0) {
      showToast(`已生成 ${generated} 条整改任务${skipped > 0 ? `，跳过 ${skipped} 条重复项` : ''}`, 'success');
    } else {
      showToast('所有违规都已生成过整改任务', 'warning');
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {toast && (
        <div className={cn(
          "absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-xs text-white shadow-lg animate-fade-in",
          toast.type === 'success' && "bg-green-500",
          toast.type === 'warning' && "bg-amber-500",
          toast.type === 'error' && "bg-red-500"
        )}>
          {toast.message}
        </div>
      )}

      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">陈列评分</h3>
            <p className="text-xs text-gray-500 mt-0.5">基于 {rules.length} 条陈列规则</p>
          </div>
          <div className={cn(
            "text-3xl font-bold",
            totalScore >= 90 ? "text-green-600" : totalScore >= 70 ? "text-amber-600" : "text-red-600"
          )}>
            {totalScore}
            <span className="text-sm font-normal text-gray-500">分</span>
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              totalScore >= 90 ? "bg-green-500" : totalScore >= 70 ? "bg-amber-500" : "bg-red-500"
            )}
            style={{ width: `${totalScore}%` }}
          />
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-900">{errorCount}</span>
            <span className="text-xs text-gray-500">严重</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-900">{warningCount}</span>
            <span className="text-xs text-gray-500">警告</span>
          </div>
          <button
            onClick={handleGenerateAll}
            disabled={currentShelfViolations.length === 0}
            className={cn(
              "ml-auto flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors",
              currentShelfViolations.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <ListTodo className="w-3 h-3" />
            全部生成整改
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {currentShelfViolations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
            <p className="text-sm">当前货架陈列合规</p>
            <p className="text-xs mt-1">所有规则均已通过</p>
          </div>
        ) : (
          currentShelfViolations.map((v, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg border",
                v.severity === 'error'
                  ? "bg-red-50 border-red-200"
                  : v.severity === 'warning'
                  ? "bg-amber-50 border-amber-200"
                  : "bg-blue-50 border-blue-200"
              )}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className={cn(
                  "w-4 h-4 mt-0.5 flex-shrink-0",
                  v.severity === 'error' ? "text-red-500" : v.severity === 'warning' ? "text-amber-500" : "text-blue-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 leading-relaxed">{v.description}</p>
                  {v.layerId && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      {shelves.find(s => s.id === v.shelfId)?.name}
                    </p>
                  )}
                  <button
                    onClick={() => handleGenerateRect(v)}
                    className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    生成整改任务
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 mb-2">陈列规则列表</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {rules.map((rule) => (
            <div key={rule.id} className="text-xs text-gray-600 flex items-center gap-2 py-1">
              <Shield className="w-3 h-3 text-blue-500" />
              <span className="truncate">{rule.description}</span>
              <span className="text-gray-400 ml-auto">{rule.scoreWeight}分</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RectificationsPanel() {
  const { rectifications, updateRectificationStatus, assignRectification, addRectification } = useAppStore();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState(staffMembers[0]);
  const [selectedRect, setSelectedRect] = useState<Rectification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const pendingRects = rectifications.filter(r => r.status === 'pending');
  const inProgressRects = rectifications.filter(r => r.status === 'in_progress');
  const completedRects = rectifications.filter(r => r.status === 'completed');

  const getPriorityLabel = (priority?: RectificationPriority) => {
    const map: Record<RectificationPriority, string> = { low: '低', medium: '中', high: '高', urgent: '紧急' };
    return map[priority || 'medium'];
  };

  const getPriorityColor = (priority?: RectificationPriority) => {
    const map: Record<RectificationPriority, string> = {
      low: 'text-gray-500 bg-gray-100',
      medium: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100',
    };
    return map[priority || 'medium'];
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addRectification({
      title: newTitle,
      description: newDesc,
      assignee: newAssignee,
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN'),
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const openDetail = (rect: Rectification) => {
    setSelectedRect(rect);
    setShowDetailModal(true);
  };

  const renderCard = (rect: Rectification) => (
    <div
      key={rect.id}
      onClick={() => openDetail(rect)}
      className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-gray-900 flex-1 line-clamp-2">{rect.title}</h4>
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap",
          getPriorityColor(rect.priority)
        )}>
          {getPriorityLabel(rect.priority)}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{rect.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {rect.assignee}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {rect.dueDate?.split(' ')[0]}
          </span>
        </div>
      </div>
      {rect.afterPhotoUrl && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <img src={rect.afterPhotoUrl} alt="" className="w-12 h-12 object-cover rounded border" />
        </div>
      )}
      {rect.status !== 'completed' && (
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <select
            value={rect.assignee}
            onChange={(e) => assignRectification(rect.id, e.target.value)}
            className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded"
          >
            {staffMembers.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {rect.status === 'pending' && (
            <button
              onClick={() => updateRectificationStatus(rect.id, 'in_progress')}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              开始
            </button>
          )}
          {rect.status === 'in_progress' && (
            <button
              onClick={() => updateRectificationStatus(rect.id, 'completed')}
              className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
            >
              完成
            </button>
          )}
        </div>
      )}
      {rect.completedAt && (
        <div className="text-[10px] text-green-600 mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          完成: {rect.completedAt}
        </div>
      )}
    </div>
  );

  const renderKanbanColumn = (title: string, count: number, items: Rectification[], status: RectificationStatus, color: string) => (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className={cn(
        "flex items-center justify-between px-2 py-2 rounded-t-lg text-xs font-medium",
        color
      )}>
        <span>{title}</span>
        <span className="bg-white/80 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-b-lg space-y-2 min-h-[200px]">
        {items.length === 0 ? (
          <div className="text-center text-[10px] text-gray-400 py-4">暂无任务</div>
        ) : (
          items.map(rect => renderCard(rect))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">整改清单</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              )}
              title="列表视图"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              )}
              title="看板视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="ml-1 flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-3 h-3" />
              添加
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            待处理 {pendingRects.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            进行中 {inProgressRects.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            已完成 {completedRects.length}
          </span>
        </div>
      </div>

      {showAddForm && (
        <div className="p-3 border-b border-gray-200 bg-blue-50 space-y-2">
          <input
            type="text"
            placeholder="整改标题"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
          />
          <textarea
            placeholder="整改描述"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 resize-none"
          />
          <select
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
          >
            {staffMembers.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              确认添加
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 text-xs bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="h-full overflow-y-auto p-3 space-y-2">
            {rectifications.map(rect => (
              <div
                key={rect.id}
                onClick={() => openDetail(rect)}
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-900 flex-1">{rect.title}</h4>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded",
                      getPriorityColor(rect.priority)
                    )}>
                      {getPriorityLabel(rect.priority)}
                    </span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full",
                      getStatusColor(rect.status)
                    )}>
                      {getStatusLabel(rect.status)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{rect.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {rect.assignee}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {rect.dueDate?.split(' ')[0]}
                    </span>
                  </div>
                </div>
                {rect.status !== 'completed' && (
                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={rect.assignee}
                      onChange={(e) => assignRectification(rect.id, e.target.value)}
                      className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded"
                    >
                      {staffMembers.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {rect.status === 'pending' && (
                      <button
                        onClick={() => updateRectificationStatus(rect.id, 'in_progress')}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        开始
                      </button>
                    )}
                    {rect.status === 'in_progress' && (
                      <button
                        onClick={() => updateRectificationStatus(rect.id, 'completed')}
                        className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
                      >
                        完成
                      </button>
                    )}
                  </div>
                )}
                {rect.completedAt && (
                  <div className="text-[10px] text-green-600 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    完成时间: {rect.completedAt}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex gap-2 p-2">
            {renderKanbanColumn('待处理', pendingRects.length, pendingRects, 'pending', 'bg-amber-100 text-amber-700')}
            {renderKanbanColumn('进行中', inProgressRects.length, inProgressRects, 'in_progress', 'bg-blue-100 text-blue-700')}
            {renderKanbanColumn('已完成', completedRects.length, completedRects, 'completed', 'bg-green-100 text-green-700')}
          </div>
        )}
      </div>

      <RectificationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        rectification={selectedRect}
      />
    </div>
  );
}

function ExportPanel() {
  const { stores, currentStoreId, totalScore, rectifications, shelves, violations, products } = useAppStore();
  const [exporting, setExporting] = useState<string | null>(null);
  const currentStore = stores.find(s => s.id === currentStoreId);

  const handleExportImage = async () => {
    setExporting('image');
    try {
      const { exportReportAsImage } = await import('@/utils/export');
      await exportReportAsImage('export-report-preview', `${currentStore?.name || '门店'}-巡店报告`);
    } catch (err) {
      console.error('图片导出失败:', err);
      alert('图片导出失败，请重试');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    setExporting('pdf');
    try {
      const { exportReportAsPdf } = await import('@/utils/export');
      await exportReportAsPdf({
        store: currentStore,
        score: totalScore,
        shelves,
        violations,
        rectifications,
        products,
      }, `${currentStore?.name || '门店'}-巡店报告`);
    } catch (err) {
      console.error('PDF导出失败:', err);
      alert('PDF导出失败，请重试');
    } finally {
      setExporting(null);
    }
  };

  const completedRects = rectifications.filter(r => r.status === 'completed').length;
  const pendingRects = rectifications.filter(r => r.status !== 'completed').length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <FileDown className="w-4 h-4 text-green-600" />
          导出巡店报告
        </h3>
        <p className="text-xs text-gray-500 mt-1">生成完整的陈列检查报告</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div id="export-report-preview" className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">报告预览</h4>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">门店名称</span>
              <span className="font-medium text-gray-900">{currentStore?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">门店地址</span>
              <span className="font-medium text-gray-900">{currentStore?.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">检查日期</span>
              <span className="font-medium text-gray-900">{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">陈列评分</span>
                <span className={cn(
                  "text-lg font-bold",
                  totalScore >= 90 ? "text-green-600" : totalScore >= 70 ? "text-amber-600" : "text-red-600"
                )}>
                  {totalScore}分
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">货架数量</span>
              <span className="font-medium text-gray-900">{shelves.length} 个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">已完成整改</span>
              <span className="font-medium text-green-600">{completedRects} 项</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">待整改</span>
              <span className="font-medium text-amber-600">{pendingRects} 项</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">导出选项</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              包含货架陈列图
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              包含照片对比
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              包含整改清单
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" className="rounded text-blue-600" />
              包含评分详情
            </label>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white space-y-2">
        <button
          onClick={handleExportPdf}
          disabled={exporting !== null}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-colors",
            exporting === 'pdf'
              ? "bg-blue-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          <FileText className="w-4 h-4" />
          {exporting === 'pdf' ? '导出中...' : '导出 PDF 报告'}
        </button>
        <button
          onClick={handleExportImage}
          disabled={exporting !== null}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-colors",
            exporting === 'image'
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          <Image className="w-4 h-4" />
          {exporting === 'image' ? '导出中...' : '导出为图片'}
        </button>
      </div>
    </div>
  );
}

export function RightPanel() {
  const { activePanel, setActivePanel } = useAppStore();

  const tabs: { key: TabType; label: string; icon: typeof Shield }[] = [
    { key: 'rules', label: '规则', icon: Shield },
    { key: 'rectifications', label: '整改', icon: ListTodo },
    { key: 'export', label: '导出', icon: Download },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActivePanel(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors relative",
              activePanel === tab.key
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activePanel === tab.key && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-t" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activePanel === 'rules' && <RulesPanel />}
        {activePanel === 'rectifications' && <RectificationsPanel />}
        {activePanel === 'export' && <ExportPanel />}
      </div>
    </div>
  );
}
