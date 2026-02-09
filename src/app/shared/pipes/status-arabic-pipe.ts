import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusArabic'
})
export class StatusArabicPipe implements PipeTransform {

  transform(value: string): string {
    const statusMap: { [key: string]: string } = {
      'OPEN': 'مفتوح',
      'CLOSED': 'مغلق',
      'ADMIN': 'مدير',
      'USER': 'مستخدم',
      'ACTIVE': 'نشط',
      'INACTIVE': 'غير نشط',
      'COMPLETED': 'مكتملة'
    };

    return statusMap[value] || value;
  }
}
