import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transactionTypeArabic',
  standalone: true
})
export class TransactionTypeArabicPipe implements PipeTransform {

  private readonly transactionTypeLabels: Record<string, string> = {
    SALE:                 'مبيعات',
    PAID_DEPT:            'سداد دين',
    PURCHASE:             'مشتريات',
    RECEIVE_DEPT:         'استلام دين',
    COST:                 'تكلفة',
    LOSS:                 'خسارة',
    EXPENSE:              'مصروف',
    ADVANCE:              'سلفة',
    ADVANCE_RETURN:       'رد سلفة',
    SALARY:               'مرتب',
    CUSTODY:              'عهدة',
    CUSTODY_RETURN:       'رد عهدة',
    SAFE_TRANSFER:        'تحويل خزنة',
    PARTNER_WITHDRAWAL:   'سحب شريك',
    OTHER:                'أخرى',
    CUSTODY_SETTLEMENT:   'تسوية عهدة',
    PARTNER_REINVESTMENT: 'إعادة استثمار شريك',
    PARTNER_INVESTMENT:   'استثمار شريك',
    OPENING_BALANCE:      'رصيد افتتاحي',
    BALANCE_ADJUSTMENT:   'تسوية رصيد'
  };

  transform(value: string | null | undefined): string {
    if (!value) return '';
    return this.transactionTypeLabels[value] ?? value;
  }
}
