import z from 'zod';

export const addBookSchema = z.object({
  title: z.string().nonempty('Book title is required.'),
  author: z.string().nonempty('Book author is required.'),
  stock: z.number().min(0, 'Book stock must be greater than or equal to 0.'),
});

export const updateBookSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  stock: z.number().optional(),
});
