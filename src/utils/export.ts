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

export async function exportReportAsPdf(data: ReportData, fileName: string = '巡店报告') {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('巡店陈列检查报告', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('一、门店信息', 20, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  if (data.store) {
    doc.text(`门店名称: ${data.store.name}`, 25, yPos);
    yPos += 7;
    doc.text(`门店地址: ${data.store.address}`, 25, yPos);
    yPos += 7;
    doc.text(`所属区域: ${data.store.region}`, 25, yPos);
    yPos += 7;
  }
  doc.text(`检查日期: ${new Date().toLocaleDateString('zh-CN')}`, 25, yPos);
  yPos += 10;

  doc.setLineWidth(0.3);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('二、陈列评分', 20, yPos);
  yPos += 10;

  const scoreColor = data.score >= 90 ? [34, 197, 94] : data.score >= 70 ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.score}`, 25, yPos + 20);
  doc.setFontSize(12);
  doc.text('分', 50, yPos + 20);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const errorCount = data.violations.filter(v => v.severity === 'error').length;
  const warningCount = data.violations.filter(v => v.severity === 'warning').length;

  doc.text(`严重违规: ${errorCount} 项`, 80, yPos + 8);
  doc.text(`警告提醒: ${warningCount} 项`, 80, yPos + 20);
  doc.text(`货架数量: ${data.shelves.length} 个`, 130, yPos + 8);
  doc.text(`整改项数: ${data.rectifications.length} 项`, 130, yPos + 20);

  yPos += 35;

  doc.setLineWidth(0.3);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('三、货架陈列概况', 20, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const shelfTypeLabels: Record<string, string> = {
    normal: '普通货架',
    end: '端架',
    display: '堆头',
  };

  data.shelves.forEach((shelf, index) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${shelf.name}`, 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`（${shelfTypeLabels[shelf.type] || shelf.type}）`, 70, yPos);
    yPos += 6;

    doc.text(`层数: ${shelf.layers.length} 层 | 宽度: ${shelf.totalWidth} 排面`, 30, yPos);
    yPos += 6;

    const productCount = shelf.layers.reduce((sum, l) => sum + l.products.length, 0);
    doc.text(`商品数量: ${productCount} 种`, 30, yPos);
    yPos += 8;
  });

  yPos += 5;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('四、违规规则明细', 20, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (data.violations.length === 0) {
    doc.setTextColor(34, 197, 94);
    doc.text('所有陈列规则均已通过，暂无违规项！', 25, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;
  } else {
    data.violations.forEach((v, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      const severityLabel = v.severity === 'error' ? '【严重】' : v.severity === 'warning' ? '【警告】' : '【提示】';
      const shelfName = data.shelves.find(s => s.id === v.shelfId)?.name || '';

      doc.setFont('helvetica', 'bold');
      if (v.severity === 'error') {
        doc.setTextColor(239, 68, 68);
      } else if (v.severity === 'warning') {
        doc.setTextColor(245, 158, 11);
      } else {
        doc.setTextColor(59, 130, 246);
      }
      doc.text(`${index + 1}. ${severityLabel}`, 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      const descLines = doc.splitTextToSize(v.description, pageWidth - 55);
      doc.text(descLines, 30, yPos + 6);
      yPos += 6 + descLines.length * 5;

      if (shelfName) {
        doc.setTextColor(128, 128, 128);
        doc.text(`关联货架: ${shelfName}`, 30, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 5;
      }

      yPos += 3;
    });
  }

  yPos += 5;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('五、整改清单', 20, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (data.rectifications.length === 0) {
    doc.text('暂无整改项', 25, yPos);
    yPos += 8;
  } else {
    const statusLabels: Record<string, string> = {
      pending: '待处理',
      in_progress: '进行中',
      completed: '已完成',
    };

    data.rectifications.forEach((rect, index) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${rect.title}`, 25, yPos);
      doc.setFont('helvetica', 'normal');

      const statusText = statusLabels[rect.status] || rect.status;
      let statusX = pageWidth - 45;
      if (rect.status === 'completed') {
        doc.setTextColor(34, 197, 94);
      } else if (rect.status === 'in_progress') {
        doc.setTextColor(59, 130, 246);
      } else {
        doc.setTextColor(245, 158, 11);
      }
      doc.text(statusText, statusX, yPos);
      doc.setTextColor(0, 0, 0);

      yPos += 6;

      const descLines = doc.splitTextToSize(rect.description, pageWidth - 55);
      doc.text(descLines, 30, yPos);
      yPos += descLines.length * 5;

      doc.setTextColor(128, 128, 128);
      doc.text(`负责人: ${rect.assignee} | 截止日期: ${rect.dueDate}`, 30, yPos);
      if (rect.completedAt) {
        doc.setTextColor(34, 197, 94);
        doc.text(` | 完成时间: ${rect.completedAt}`, 100, yPos);
      }
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    });
  }

  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text('智慧零售陈列管理系统 - 巡店报告', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.save(`${fileName}.pdf`);
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
