import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logging';
import { loginSchemaValidation, registerSchemaValidation } from '../validation/auth-validation';
import { validation } from '../validation/validate';
import { ResponseError } from '../error/response-error';
import { MemberModel } from '../model/member-model';
import { compare, hash } from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import config from '../config/environment';
import { generateCode } from '../utils/code-generator';
import { sendMail } from '../utils/send-mail';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = validation.validate(registerSchemaValidation, req.body);

    const existingMember = await MemberModel.findOne({ email: validateData.email });
    if (existingMember) {
      throw new ResponseError('Failed', 409, 'Email already exist');
    }

    const codeMember = await generateCode(MemberModel, 'M');

    const hashedPassword = await hash(validateData.password, 10);
    const newMember = new MemberModel({
      code: codeMember,
      name: validateData.name,
      email: validateData.email,
      password: hashedPassword,
      borrowedBooks: [],
    });

    const result = await newMember.save();
    const sendEmail = await sendMail(result.name, result.email, result._id as string);

    if (!sendEmail) {
      throw new ResponseError('Failed', 500, 'Failed to send email');
    }

    logger.info('Register successfuly');
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Register successfuly',
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    } else if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('Unknown error occurred');
    }
    next(error);
  }
};

export const setActiveUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, memberId } = req.params;
    const memberActive = await MemberModel.findOne({ email, _id: memberId });
    if (!memberActive) {
      throw new ResponseError('Failed', 404, 'Member not found');
    }
    await MemberModel.updateOne({ _id: memberId }, { $set: { isActive: true } });
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Member activated successfully',
    });
    logger.info('Member activated successfully');
  } catch (error) {
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    } else if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('Unknown error occurred');
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = validation.validate(loginSchemaValidation, req.body);

    const userExist = await MemberModel.findOne({ email: validateData.email });
    if (!userExist) {
      throw new ResponseError('Failed', 401, 'Email or Password is wrong');
    }

    const isPasswordValid = await compare(validateData.password, userExist.password);
    if (!isPasswordValid) {
      throw new ResponseError('Failed', 401, 'Email or Password is wrong');
    }

    const member = {
      code: userExist.code,
      name: userExist.name,
      email: userExist.email,
    };

    const token = jsonwebtoken.sign(member, config.jwtSecret as string, {
      expiresIn: config.jwtExpiresIn || '7200s',
    });

    const refreshToken = jsonwebtoken.sign(member, config.jwtRefreshSecret as string, {
      expiresIn: config.jwtRefreshExpiresIn || '86400s',
    });

    await MemberModel.updateOne({ email: validateData.email }, { $set: { token: token } });

    logger.info('Login successfuly');
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Login successfuly',
      data: { token, refreshToken },
    });
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    } else if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('Unknown error occurred');
    }
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ResponseError('Failed', 401, 'Refresh token is required');
    }

    const decoded = jsonwebtoken.verify(refreshToken, config.jwtRefreshSecret as string) as { email: string };

    const userExist = await MemberModel.findOne({ email: decoded.email });

    if (!userExist) {
      throw new ResponseError('Failed', 401, 'Invalid refresh token');
    }

    const member = {
      code: userExist.code,
      name: userExist.name,
      email: userExist.email,
    };

    const newToken = jsonwebtoken.sign(member, config.jwtSecret as string, {
      expiresIn: config.jwtExpiresIn || '7200s',
    });

    const newRefreshToken = jsonwebtoken.sign(member, config.jwtRefreshSecret as string, {
      expiresIn: config.jwtRefreshExpiresIn || '86400s',
    });

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: unknown) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      next(new ResponseError('Failed', 403, 'Invalid refresh token'));
    } else if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
      next(error);
    } else {
      logger.error('Unknown error occurred');
      next(new ResponseError('Failed', 500, 'Internal server error'));
    }
  }
};
