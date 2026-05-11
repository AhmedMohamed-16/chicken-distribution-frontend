import { CurrencyArabicPipe } from './currency-arabic-pipe';
import { ArabicNumberPipe } from './arabic-number-pipe';

describe('CurrencyArabicPipe', () => {
  it('create an instance', () => {
    const arabicNumberPipe = new ArabicNumberPipe();

    const pipe = new CurrencyArabicPipe(arabicNumberPipe);

    expect(pipe).toBeTruthy();
  });
});
