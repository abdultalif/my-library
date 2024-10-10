import { z } from 'zod';

export const schemaValidation = z.object({
  userCode: z.string().nonempty('Member code is required.'),
  bookCodes: z.array(z.string()).min(1, 'At least one book code is required.'),
});
