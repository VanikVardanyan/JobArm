/** Нормализация ввода с маской +374 XX XXX XXX в E.164 +374XXXXXXXX (8 цифр после кода страны). */
export function toE164AmPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("374")) {
    return `+${digits}`;
  }
  if (digits.length === 8) {
    return `+374${digits}`;
  }
  return null;
}
