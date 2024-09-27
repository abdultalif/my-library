import { ResponseError } from '../error/response-error';
import { ZodType } from 'zod';

export class validation {
  static validate<T>(schema: ZodType, data: T): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      // Membuat format error yang kamu inginkan
      const formattedErrors: Record<string, string[]> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }
        formattedErrors[field].push(err.message);
      });

      throw new ResponseError('failed', 400, formattedErrors);
    }

    return result.data;
  }
}
