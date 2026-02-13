// ========================================
// Shared Report Utilities Service
// ========================================
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ReportUtilitiesService {
/**
 * Format currency to Arabic locale
 * @param amount - Number to format (can be undefined or null)
 * @param decimals - Number of decimal places (default: 2)
 */
// formatCurrency(amount: number | undefined | null, decimals: number = 2): string {
//   if (amount === null || amount === undefined) return '0.00'; // قيمة افتراضية لو فارغ
//   return new Intl.NumberFormat('ar-EG', {
//     style: 'decimal',
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals
//   }).format(amount);
// }
formatCurrency(amount: number | string | undefined | null, decimals: number = 2): string {
  if (amount === null || amount === undefined || amount === '' || isNaN(Number(amount))) {
    return '٠.٠٠';
  }

  const num = Number(amount);
  const formatted = num.toFixed(decimals);
  const arabic = this.englishToArabicNumbers(formatted);

  return arabic;
}

formatPercentage(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || value === '') {
    return '٠.٠٠';
  }

  const num = Number(value);

  if (isNaN(num)) {
    return '٠.٠٠';
  }

  const formatted = num.toFixed(decimals);
  const arabic = this.englishToArabicNumbers(formatted);

  return `${arabic}`;
}

  /**
   * Format date and time to Arabic locale
   * @param dateStr - Date string or Date object
   */
  formatDateTime(dateStr: string | Date | null | undefined): string {
    console.log("formatDateTime ====",dateStr);

  if (!dateStr) return ''; // أو أي قيمة افتراضية
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('ar-EG', {
  timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}


  /**
   * Format date only to Arabic locale
   * @param dateStr - Date string or Date object
   */
  formatDate(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  /**
   * Format time only to Arabic locale
   * @param dateStr - Date string or Date object
   */
  formatTime(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
 * Format number OR text with Arabic numerals
 * - Numbers: formatted with decimals
 * - Strings: just convert digits to Arabic
 */
formatNumber(
  value: number | string | null | undefined,
  decimals: number = 0
): string {

  if (value === null || value === undefined) {
    return '';
  }

  // ✅ لو نص (زي plate number)
  if (typeof value === 'string') {
    return this.englishToArabicNumbers(value);
  }

  // ✅ لو رقم
  const formatted = value.toLocaleString('ar-EG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return formatted;
}

  /**
   * Convert Date to ISO string format (YYYY-MM-DD)
   * @param date - Date object
   */
  toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Validate date range
   * @param from - Start date
   * @param to - End date
   */
  validateDateRange(from: Date, to: Date): { valid: boolean; error?: string } {
    if (!from || !to) {
      return { valid: false, error: 'يرجى اختيار نطاق التواريخ' };
    }

    if (from > to) {
      return { valid: false, error: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية' };
    }

    const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 365) {
      return { valid: false, error: 'نطاق التواريخ لا يمكن أن يتجاوز سنة واحدة' };
    }

    return { valid: true };
  }

  /**
   * Export data to Excel
   * @param data - Array of objects to export
   * @param fileName - Name of the file
   * @param sheetName - Name of the sheet (default: 'البيانات')
   */
  exportToExcel(data: any[], fileName: string, sheetName: string = 'البيانات'): void {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('حدث خطأ أثناء تصدير البيانات إلى Excel');
    }
  }

  /**
   * Export multiple sheets to Excel
   * @param sheets - Array of sheet data with names
   * @param fileName - Name of the file
   */
  exportMultipleSheetsToExcel(
    sheets: Array<{ name: string; data: any[] }>,
    fileName: string
  ): void {
    try {
      const wb = XLSX.utils.book_new();

      sheets.forEach(sheet => {
        const ws = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      });

      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('حدث خطأ أثناء تصدير البيانات إلى Excel');
    }
  }

  /**
   * Basic PDF export (placeholder - needs proper implementation)
   * @param elementId - ID of the element to convert to PDF
   * @param fileName - Name of the PDF file
   */
  exportToPDF(elementId: string, fileName: string): void {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text(fileName, 20, 20);

      // Add date
      doc.setFontSize(12);
      doc.text(`Date: ${this.formatDate(new Date())}`, 20, 30);

      // Note: For full HTML to PDF conversion, you would need html2canvas
      // This is a basic implementation

      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('حدث خطأ أثناء تصدير البيانات إلى PDF');
    }
  }

  /**
   * Print the current page
   */
  printPage(): void {
    window.print();
  }

  /**
   * Get last N days date range
   * @param days - Number of days
   */
  getLastNDays(days: number): { from: Date; to: Date } {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    return { from, to };
  }

  /**
   * Get current month date range
   */
  getCurrentMonth(): { from: Date; to: Date } {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from, to };
  }

  /**
   * Get previous month date range
   */
  getPreviousMonth(): { from: Date; to: Date } {
    const today =new Date();
    const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const to = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from, to };
  }

  /**
   * Convert Arabic numerals to English
   * @param str - String with Arabic numerals
   */
  arabicToEnglishNumbers(str: string): string {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return str.split('').map(char => {
      const index = arabicNumbers.indexOf(char);
      return index !== -1 ? englishNumbers[index] : char;
    }).join('');
  }

  /**
   * Convert English numerals to Arabic
   * @param str - String with English numerals
   */
  englishToArabicNumbers(str: string): string {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return str.split('').map(char => {
      const index = englishNumbers.indexOf(char);
      return index !== -1 ? arabicNumbers[index] : char;
    }).join('');
  }
}
