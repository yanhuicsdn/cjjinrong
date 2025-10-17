'use client';

import { Download } from 'lucide-react';

interface ExportButtonProps {
  data: any;
  filename: string;
  label?: string;
}

export default function ExportButton({ data, filename, label = '导出数据' }: ExportButtonProps) {
  const handleExport = () => {
    // 转换为CSV格式
    const csvContent = convertToCSV(data);
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data: any) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return '';
    }

    // 获取表头
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    // 转换数据行
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // 处理包含逗号的值
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}
