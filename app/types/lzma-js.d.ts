declare module 'lzma-js' {
  export default {
    compress: (input: string | Uint8Array, level?: number) => Uint8Array,
    decompress: (input: Uint8Array) => string | Uint8Array
  };
}