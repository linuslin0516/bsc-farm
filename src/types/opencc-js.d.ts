declare module 'opencc-js' {
  interface ConverterOptions {
    from: 'tw' | 'cn' | 'hk' | 'jp' | 't' | 's';
    to: 'tw' | 'cn' | 'hk' | 'jp' | 't' | 's';
  }

  export function Converter(options: ConverterOptions): (text: string) => string;
}
