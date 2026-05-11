import { Pipe, PipeTransform } from '@angular/core';

/**
 * Balance Direction Pipe
 * Transforms balance type/direction into human-readable Arabic labels
 * Used across all report components to ensure consistent display
 */
@Pipe({
  name: 'balanceDirection',
  standalone: true
})
export class BalanceDirectionPipe implements PipeTransform {

  private readonly labels: Record<string, string> = {
    // Farm balance types
    'RECEIVABLE': 'مستحق (عليه)',
    'PAYABLE': 'دائن (له)',
    'SETTLED': 'مسدد',

    // Buyer balance types
    'CREDIT': 'رصيد لصالحه',
    'NET_RECEIVABLE': 'ذمم مستحقة',
    'NET_CREDIT': 'رصيد دائن',
    'BALANCED': 'متزن',

    // Legacy/position types
    'NET_PAYABLE': 'دائن',
    'POSITIVE': 'موجب',
    'NEGATIVE': 'سالب',
    'NEUTRAL': 'محايد'
  };

  private readonly cssClasses: Record<string, string> = {
    'RECEIVABLE': 'text-red-600',
    'PAYABLE': 'text-green-600',
    'CREDIT': 'text-green-600',
    'SETTLED': 'text-gray-600',
    'NET_RECEIVABLE': 'text-red-600',
    'NET_CREDIT': 'text-green-600',
    'BALANCED': 'text-gray-600',
    'NET_PAYABLE': 'text-green-600'
  };

  /**
   * Transform balance type to display label
   * @param value The balance type string
   * @param format 'label' | 'class' | 'both' - what to return
   * @returns Arabic label, CSS class, or object with both
   */
  transform(
    value: string | null | undefined,
    format: 'label' | 'class' | 'both' = 'label'
  ): string | { label: string; cssClass: string } {
    if (!value) {
      if (format === 'class') return 'text-gray-600';
      if (format === 'both') return { label: '-', cssClass: 'text-gray-600' };
      return '-';
    }

    const normalizedValue = value.toUpperCase();
    const label = this.labels[normalizedValue] || value;
    const cssClass = this.cssClasses[normalizedValue] || 'text-gray-600';

    switch (format) {
      case 'class':
        return cssClass;
      case 'both':
        return { label, cssClass };
      case 'label':
      default:
        return label;
    }
  }

  /**
   * Helper method to determine balance type from numeric balance
   * @param balance The numeric balance value
   * @param entityType 'farm' | 'buyer' - affects the type mapping
   * @returns Balance type string
   */
  static getTypeFromBalance(
    balance: number,
    entityType: 'farm' | 'buyer' = 'farm'
  ): 'RECEIVABLE' | 'PAYABLE' | 'CREDIT' | 'SETTLED' {
    if (balance === 0) return 'SETTLED';

    if (entityType === 'buyer') {
      return balance > 0 ? 'RECEIVABLE' : 'CREDIT';
    }

    return balance > 0 ? 'RECEIVABLE' : 'PAYABLE';
  }

  /**
   * Helper to get CSS class directly from balance number
   */
  static getClassFromBalance(balance: number): string {
    if (balance === 0) return 'text-gray-600';
    return balance > 0 ? 'text-red-600' : 'text-green-600';
  }
}
