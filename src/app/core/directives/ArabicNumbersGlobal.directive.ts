// arabic-numbers.directive.ts
import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appArabicNumbers]',
  standalone: true
})
export class ArabicNumbersDirective implements OnInit, OnDestroy {
  private observer!: MutationObserver;
  private isConverting = false; // علشان نمنع الـ infinite loop

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // فورمات الأرقام الموجودة حالياً
    this.convertToArabicNumbers();

    // راقب أي تغييرات في المحتوى
    this.observer = new MutationObserver(() => {
      if (!this.isConverting) {
        this.convertToArabicNumbers();
      }
    });

    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private convertToArabicNumbers() {
    this.isConverting = true;
    this.convertNodeNumbers(this.el.nativeElement);
    this.isConverting = false;
  }

  private convertNodeNumbers(node: any) {
    // لو text node
    if (node.nodeType === 3) {
      const converted = this.toArabicNumbers(node.textContent);
      if (converted !== node.textContent) {
        node.textContent = converted;
      }
    }
    // لو element node (وليس input أو textarea)
    else if (
      node.nodeType === 1 &&
      node.nodeName !== 'SCRIPT' &&
      node.nodeName !== 'STYLE' &&
      node.nodeName !== 'INPUT' &&
      node.nodeName !== 'TEXTAREA'
    ) {
      // راجع كل الـ child nodes
      Array.from(node.childNodes).forEach((child: any) => {
        this.convertNodeNumbers(child);
      });
    }
  }

  private toArabicNumbers(text: string): string {
    if (!text) return text;
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return text.replace(/\d/g, (digit) => arabicNumbers[parseInt(digit)]);
  }
}
