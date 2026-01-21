import { ArabicNumberPipe } from './arabic-number-pipe';

describe('ArabicNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new ArabicNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
