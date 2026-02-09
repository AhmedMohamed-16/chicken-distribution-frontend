import { Pipe, PipeTransform } from '@angular/core';
import { ArabicNumberPipe } from './arabic-number-pipe';

@Pipe({
  name: 'currencyArabic',
  standalone: true
})
export class CurrencyArabicPipe implements PipeTransform {

  constructor(private arabicNumber: ArabicNumberPipe) {}

  transform(
    value: number | string | null | undefined,
    currency: string = 'جنيه'
  ): string {

    const formatted = this.arabicNumber.transform(value);

    return formatted ? `${formatted} ${currency}` : '';
  }
}
