import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyArabic'
})
export class CurrencyArabicPipe implements PipeTransform {
 transform(value: number | null | undefined, showCurrency: boolean = true): string {
    if (value === null || value === undefined) return '٠';

    const formatted = value.toLocaleString('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return showCurrency ? `${formatted} جنيه` : formatted;
  }
}
