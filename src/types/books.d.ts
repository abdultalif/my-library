import { Document } from 'mongoose';

export interface IBook extends Document {
  code: string;
  title: string;
  author: string;
  stock: number;
}
