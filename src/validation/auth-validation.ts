import { z } from 'zod';

export const registerSchemaValidation = z
  .object({
    email: z.string().nonempty('Email Wajib Diisi').email('Email tidak valid'),

    name: z.string().nonempty('name Wajib Diisi'),

    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .nonempty('Password harus diisi')
      .regex(/[A-Z]/, 'Password harus memiliki minimal 1 huruf besar')
      .regex(/[a-z]/, 'Password harus memiliki minimal 1 huruf kecil')
      .regex(/[0-9]/, 'Password harus memiliki minimal 1 angka')
      .regex(/[!@#$%^&*()]/, 'Password harus menerapkan setidaknya 1 simbol'),

    confirmPassword: z.string().nonempty('Konfirmasi Password harus diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan Konfirmasi Password harus sama',
    path: ['confirmPassword'],
  });

export const loginSchemaValidation = z.object({
  email: z.string().nonempty('Email Wajib Diisi').email('Email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .nonempty('Password harus diisi')
    .regex(/[A-Z]/, 'Password harus memiliki minimal 1 huruf besar')
    .regex(/[a-z]/, 'Password harus memiliki minimal 1 huruf kecil')
    .regex(/[0-9]/, 'Password harus memiliki minimal 1 angka')
    .regex(/[!@#$%^&*()]/, 'Password harus menerapkan setidaknya 1 simbol'),
});

export const refreshTokenSchemaValidation = z.object({
  refreshToken: z.string().nonempty('Refresh Token Wajib Diisi').min(1, 'Refresh Token Wajib Diisi'),
});
