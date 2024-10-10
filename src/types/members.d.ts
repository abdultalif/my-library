import { Document } from 'mongoose';

export interface IBorrowedBook {
  bookCode: string;
  borrowedAt: Date;
}

export interface IMember extends Document {
  code: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isActive: boolean;
  tokenResetPassword: string | null;
  borrowedBooks: IBorrowedBook[];
  penaltyUntil: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
