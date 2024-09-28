import { Schema, model } from 'mongoose';
import { IBook } from '../types/books';

const BookSchema = new Schema<IBook>({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
});

export const Book = model<IBook>('Book', BookSchema);
