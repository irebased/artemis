import { BaseType } from './bases';

export type Ciphertext = {
  id: number;
  text: string;
  encoding: BaseType;
  ignorePunctuation: boolean;
  ignoreWhitespace: boolean;
  ignoreCasing: boolean;
  color: string;
  hidden?: boolean;
};