import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArabicNumberService {
  private arabicNumbers = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];

  toArabic(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return str.replace(/\d/g, d => this.arabicNumbers[+d]);
  }

  // لو البيانات array أو object كامل
  convertObject(obj: any): any {
    if (Array.isArray(obj)) return obj.map(o => this.convertObject(o));
    if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        newObj[key] = this.convertObject(obj[key]);
      }
      return newObj;
    }
    if (typeof obj === 'number' || (typeof obj === 'string' && /^\d+$/.test(obj))) {
      return this.toArabic(obj);
    }
    return obj;
  }
}
