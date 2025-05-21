// types/languagedetect.d.ts
declare module 'languagedetect' {
  type DetectionResult = [string, number][];

  class LanguageDetect {
    constructor();
    detect(text: string, limit?: number): DetectionResult;
    getLanguages(): string[];
  }

  export default LanguageDetect;
}