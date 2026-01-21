import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arabicNumber'
})
export class ArabicNumberPipe implements PipeTransform {
private arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  transform(value: number | string): string {
    if (value === null || value === undefined) return '';

    return value.toString().replace(/\d/g, (d) => this.arabicNumbers[+d]);
  }
}
