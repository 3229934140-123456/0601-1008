import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { StoreInfo, Shelf, RuleViolation, Rectification } from '@/types';

interface ReportData {
  store: StoreInfo | undefined;
  score: number;
  shelves: Shelf[];
  violations: RuleViolation[];
  rectifications: Rectification[];
  products: any[];
}

export async function exportReportAsImage(elementId: string, fileName: string = 'report') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('找不到导出元素');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function getShelfName(shelves: Shelf[], shelfId: string): string {
  return shelves.find(s => s.id === shelfId)?.name || '未知货架';
}

function generateReportHtml(data: ReportData): string {
  const { store, score, shelves, violations, rectifications } = data;
  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;

  const scoreColor = score >= 90 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444';
  const shelfTypeLabels: Record<string, string> = {
    normal: '普通货架',
    end: '端架',
    display: '堆头',
  };
  const statusLabels: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
  };
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#22c55e',
  };

  return `
    <div style="width: 750px; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; background: #fff; color: #111827;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #1e3a5f; margin: 0 0 8px 0;">巡店陈列检查报告</h1>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">生成时间：${new Date().toLocaleString('zh-CN')}</p>
      </div>

      <div style="height: 2px; background: linear-gradient(to right, #1e3a5f, #3b82f6); margin-bottom: 30px;"></div>

      <div style="margin-bottom: 35px;">
        <h2 style="font-size: 18px; font-weight: bold; color: #1e3a5f; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">一、门店信息</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
          <div><span style="color: #6b7280;">门店名称：</span><span style="font-weight: 500;">${store?.name || '-'}</span></div>
          <div><span style="color: #6b7280;">所属区域：</span><span style="font-weight: 500;">${store?.region || '-'}</span></div>
          <div style="grid-column: 1 / -1;"><span style="color: #6b7280;">门店地址：</span><span style="font-weight: 500;">${store?.address || '-'}</span></div>
          <div><span style="color: #6b7280;">检查日期：</span><span style="font-weight: 500;">${new Date().toLocaleDateString('zh-CN')}</span></div>
        </div>
      </div>

      <div style="margin-bottom: 35px;">
        <h2 style="font-size: 18px; font-weight: bold; color: #1e3a5f; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">二、陈列评分</h2>
        <div style="display: flex; align-items: center; gap: 40px;">
          <div style="text-align: center;">
            <div style="font-size: 56px; font-weight: bold; color: ${scoreColor}; line-height: 1;">${score}</div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">综合得分</div>
          </div>
          <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
            <div style="padding: 12px; background: #fef2f2; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${errorCount}</div>
              <div style="font-size: 12px; color: #6b7280;">严重违规</div>
            </div>
            <div style="padding: 12px; background: #fffbeb; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${warningCount}</div>
              <div style="font-size: 12px; color: #6b7280;">警告提醒</div>
            </div>
            <div style="padding: 12px; background: #eff6ff; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${shelves.length}</div>
              <div style="font-size: 12px; color: #6b7280;">货架数量</div>
            </div>
            <div style="padding: 12px; background: #f0fdf4; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${rectifications.length}</div>
              <div style="font-size: 12px; color: #6b7280;">整改项数</div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 35px;">
        <h2 style="font-size: 18px; font-weight: bold; color: #1e3a5f; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">三、货架陈列概况</h2>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${shelves.map((shelf, index) => {
            const productCount = shelf.layers.reduce((sum, l) => sum + l.products.length, 0);
            return `
              <div style="padding: 12px 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-weight: 600; font-size: 14px;">${index + 1}. ${shelf.name}</span>
                    <span style="margin-left: 8px; font-size: 12px; color: #6b7280; padding: 2px 8px; background: #e5e7eb; border-radius: 4px;">${shelfTypeLabels[shelf.type] || shelf.type}</span>
                  </div>
                  <div style="font-size: 12px; color: #6b7280;">${shelf.layers.length} 层 · ${productCount} 种商品 · ${shelf.totalWidth} 排面宽</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="margin-bottom: 35px;">
        <h2 style="font-size: 18px; font-weight: bold; color: #1e3a5f; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">四、违规规则明细</h2>
        ${violations.length === 0 ? `
          <div style="padding: 20px; text-align: center; background: #f0fdf4; border-radius: 8px;">
            <div style="font-size: 16px; font-weight: 500; color: #22c55e;">✓ 所有陈列规则均已通过</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">暂无违规项</div>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${violations.map((v, index) => {
              const severityLabel = v.severity === 'error' ? '严重' : v.severity === 'warning' ? '警告' : '提示';
              const severityColor = v.severity === 'error' ? '#ef4444' : v.severity === 'warning' ? '#f59e0b' : '#3b82f6';
              const shelfName = getShelfName(shelves, v.shelfId);
              return `
                <div style="padding: 12px 16px; border-radius: 8px; border: 1px solid ${severityColor}20; background: ${severityColor}08;">
                  <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <span style="display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 500; color: white; background: ${severityColor}; border-radius: 4px; flex-shrink: 0;">${severityLabel}</span>
                    <div style="flex: 1;">
                      <div style="font-size: 13px; font-weight: 500; color: #111827;">${index + 1}. ${v.description}</div>
                      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">关联货架：${shelfName}</div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; color: #1e3a5f; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">五、整改清单</h2>
        ${rectifications.length === 0 ? `
          <div style="padding: 30px; text-align: center; color: #9ca3af; font-size: 14px; background: #f9fafb; border-radius: 8px;">
            该门店暂无整改项
          </div>
        ` : `
          ${(() => {
            const pending = rectifications.filter(r => r.status === 'pending');
            const inProgress = rectifications.filter(r => r.status === 'in_progress');
            const completed = rectifications.filter(r => r.status === 'completed');

            const priorityLabels: Record<string, string> = { low: '低', medium: '中', high: '高', urgent: '紧急' };
            const priorityColors: Record<string, string> = {
              low: '#6b7280',
              medium: '#3b82f6',
              high: '#f97316',
              urgent: '#ef4444',
            };

            const renderGroup = (title: string, items: typeof rectifications, bgColor: string) => {
              if (items.length === 0) return '';
              return `
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                  <div style="width: 3px; height: 14px; background: ${bgColor}; border-radius: 2px;"></div>
                    <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0;">${title}</h3>
                    <span style="font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 1px 6px; border-radius: 4px;">${items.length} 项</span>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${items.map((rect, idx) => `
                      <div style="padding: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e7eb; border-left: 3px solid ${bgColor};">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                          <div style="font-size: 13px; font-weight: 500; color: #111827; flex: 1;">${idx + 1}. ${rect.title}</div>
                          ${rect.priority ? `
                            <span style="font-size: 10px; padding: 2px 6px; background: ${priorityColors[rect.priority]}15; color: ${priorityColors[rect.priority]}; border-radius: 4px; margin-left: 8px; flex-shrink: 0;">
                              ${priorityLabels[rect.priority]}
                            </span>
                          ` : ''}
                        </div>
                        <div style="font-size: 12px; color: #4b5563; margin-bottom: 8px; white-space: pre-line; line-height: 1.6;">
                          ${rect.description}
                        </div>
                        ${rect.resolutionNote ? `
                          <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px; padding: 6px 8px; background: #f0fdf4; border-radius: 4px;">
                            <span style="font-weight: 500; color: #16a34a;">处理说明：</span>${rect.resolutionNote}
                          </div>
                        ` : ''}
                        <div style="display: flex; gap: 16px; font-size: 11px; color: #6b7280;">
                          <span>负责人：${rect.assignee}</span>
                          <span>截止日期：${rect.dueDate || '-'}</span>
                          ${rect.completedAt ? `<span style="color: #22c55e;">完成：${rect.completedAt}</span>` : ''}
                        </div>
                        ${rect.afterPhotoUrl ? `
                          <div style="margin-top: 8px;">
                            <img src="${rect.afterPhotoUrl}" alt="整改后照片" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb;" />
                          </div>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            };

            return renderGroup('待处理', pending, '#f59e0b') +
              renderGroup('进行中', inProgress, '#3b82f6') +
              renderGroup('已完成', completed, '#22c55e');
          })()}
        `}
      </div>

      <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af;">
        智慧零售陈列管理系统 · 巡店报告
      </div>
    </div>
  `;
}

export async function exportReportAsPdf(data: ReportData, fileName: string = '巡店报告') {
  const reportHtml = generateReportHtml(data);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.innerHTML = reportHtml;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const doc = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save(`${fileName}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

export function downloadJSON(data: any, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
