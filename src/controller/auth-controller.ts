// import { NextFunction, Request, Response } from 'express';
// import logger from '../utils/logging';
// import { loginSchemaValidation, registerSchemaValidation } from '../validation/auth-validation';
// import { validation } from '../validation/validate';
// import { ResponseError } from '../error/response-error';
// import { MemberModel } from '../model/member-model';
// import { compare, hash } from 'bcrypt';
// import jsonwebtoken from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import { generateCode } from '../utils/code-generator';
// dotenv.config();

// export const register = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const validateData = validation.validate(registerSchemaValidation, req.body);

//     const existingMember = await MemberModel.findOne({ email: validateData.email });
//     if (existingMember) {
//       throw new ResponseError('Failed', 409, 'Email already exist');
//     }

//     const codeMember = await generateCode(MemberModel, 'M');

//     const hashedPassword = await hash(validateData.password, 10);
//     const newMember = new MemberModel({
//       code: codeMember,
//       name: validateData.name,
//       email: validateData.email,
//       password: hashedPassword,
//       token: '',
//       borrowedBooks: [],
//       penaltyEndDate: null,
//     });

//     await newMember.save();
//     logger.info('Register successfuly');
//     res.status(201).json({
//       status: 'success',
//       statusCode: 201,
//       message: 'Register successfuly',
//     });
//   } catch (error: unknown) {
//     if (error instanceof ResponseError) {
//       logger.error(`${error.statusCode}: ${error.message}`);
//     } else if (error instanceof Error) {
//       logger.error(error.message);
//     } else {
//       logger.error('Unknown error occurred');
//     }
//     next(error);
//   }
// };

// export const login = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const validateData = validation.validate(loginSchemaValidation, req.body);

//     const userExist = await MemberModel.findOne({ email: validateData.email });
//     if (!userExist) {
//       throw new ResponseError('Failed', 401, 'Email or Password is wrong');
//     }

//     const isPasswordValid = await compare(validateData.password, userExist.password);
//     if (!isPasswordValid) {
//       throw new ResponseError('Failed', 401, 'Email or Password is wrong');
//     }

//     const member = {
//       code: userExist.code,
//       name: userExist.name,
//       email: userExist.email,
//     };

//     const token = jsonwebtoken.sign(member, globalThis.process.env.JWT_SECRET as string, {
//       expiresIn: globalThis.process.env.JWT_EXPIRES_IN || '7200s',
//     });

//     await MemberModel.updateOne({ email: validateData.email }, { $set: { token: token } });

//     logger.info('Login successfuly');
//     res.status(200).json({
//       status: 'success',
//       statusCode: 200,
//       message: 'Login successful',
//       data: { token },
//     });
//   } catch (error: unknown) {
//     if (error instanceof ResponseError) {
//       logger.error(`${error.statusCode}: ${error.message}`);
//     } else if (error instanceof Error) {
//       logger.error(error.message);
//     } else {
//       logger.error('Unknown error occurred');
//     }
//     next(error);
//   }
// };
