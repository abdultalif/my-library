import { Document } from 'mongoose';
 
export interface IBorrowedBook {
  bookCode: string;
  borrowedAt: Date;
}

export interface IMember extends Document {
  code: string;
  name: string;
  borrowedBooks: IBorrowedBook[];
  penaltyUntil: Date | null;
}
