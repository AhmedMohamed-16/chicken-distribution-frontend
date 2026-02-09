import { Injectable, Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'arabicNumber',
  standalone: true
})
@Injectable({
  providedIn: 'root'
})
export class ArabicNumberPipe implements PipeTransform {

  private arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  transform(
    value: number | string | null | undefined,
    fractionDigits: number = 2
  ): string {

    if (value === null || value === undefined || value === '') return '';


  if (typeof value === 'number') {
    return value
      .toLocaleString('ar-EG', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
      .replace(/\d/g, d => this.arabicNumbers[+d]);
  } else {
    return String(value).replace(/\d/g, d => this.arabicNumbers[+d]);
  }
}
}
