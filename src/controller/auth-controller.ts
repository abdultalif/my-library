import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logging';
import {
  forgotPasswordSchemaValidation,
  loginSchemaValidation,
  refreshTokenSchemaValidation,
  registerSchemaValidation,
  resetPasswordSchemaValidation,
} from '../validation/auth-validation';
import { validation } from '../validation/validate';
import { ResponseError } from '../error/response-error';
import { UserModel } from '../model/user-model';
import { compare, hash } from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import config from '../config/environment';
import { generateCode } from '../utils/code-generator';
import { v4 as uuidv4 } from 'uuid';
import { RabbitMQKeys, publishEmailTask } from '../config/rabbitmq';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = await validation.validate(registerSchemaValidation, req.body);

    const existingMember = await UserModel.findOne({ email: validateData.email });
    if (existingMember) {
      throw new ResponseError('Failed', 409, 'Email already exist');
    }

    const codeMember = await generateCode(UserModel, 'U');

    const hashedPassword = await hash(validateData.password, 10);
    const newMember = new UserModel({
      code: codeMember,
      name: validateData.name,
      email: validateData.email,
      password: hashedPassword,
      borrowedBooks: [],
    });

    const result = await UserModel.create(newMember);

    const emailPayload = {
      name: result.name,
      email: result.email,
      token: String(result._id),
    };

    const emailTaskPublished = await publishEmailTask(RabbitMQKeys.REGISTRATION_ROUTING_KEY, emailPayload);

    if (!emailTaskPublished) {
      logger.warn(`Failed to publish registration email task for ${result.email}, but user was created.`);
      throw new ResponseError(
        'Failed',
        500,
        'Failed to queue registration email. Please try registering again later or contact support.',
      );
    }

    // const sendEmail = await sendMail(result.name, result.email, result._id as string);

    // if (!sendEmail) {
    //   throw new ResponseError('Failed', 500, 'Failed to send email');
    // }

    logger.info('Register successfuly, Please check your email');
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Register successfuly, Please check your email',
      data: {
        _id: result._id,
        code: result.code,
        name: result.name,
        email: result.email,
        role: result.role,
        isActive: result.isActive,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    next(error);
  }
};

export const setActiveUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, memberId } = req.params;
    const memberActive = await UserModel.findOne({ email, _id: memberId });
    if (!memberActive) {
      throw new ResponseError('Failed', 404, 'Member not found');
    }
    await UserModel.updateOne({ _id: memberId }, { $set: { isActive: true } });
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Member activated successfully',
    });
    logger.info('Member activated successfully');
  } catch (error) {
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = validation.validate(loginSchemaValidation, req.body);

    const userExist = await UserModel.findOne({ email: validateData.email });
    if (!userExist) {
      throw new ResponseError('Failed', 401, 'Email or Password is wrong');
    }

    const isPasswordValid = await compare(validateData.password, userExist.password);
    if (!isPasswordValid) {
      throw new ResponseError('Failed', 401, 'Email or Password is wrong');
    }

    const user = {
      code: userExist.code,
      name: userExist.name,
      email: userExist.email,
      role: userExist.role,
    };

    const token = jsonwebtoken.sign(user, config.jwtSecret as string, {
      expiresIn: config.jwtExpiresIn || '7200s',
    });

    const refreshToken = jsonwebtoken.sign(user, config.jwtRefreshSecret as string, {
      expiresIn: config.jwtRefreshExpiresIn || '86400s',
    });

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
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = await validation.validate(refreshTokenSchemaValidation, req.body);

    const decoded = jsonwebtoken.verify(validateData.refreshToken, config.jwtRefreshSecret as string) as {
      email: string;
    };

    const userExist = await UserModel.findOne({ email: decoded.email });

    if (!userExist) {
      throw new ResponseError('Failed', 401, 'Invalid refresh token');
    }

    const user = {
      code: userExist.code,
      name: userExist.name,
      email: userExist.email,
    };

    const newToken = jsonwebtoken.sign(user, config.jwtSecret as string, {
      expiresIn: config.jwtExpiresIn || '7200s',
    });

    const newRefreshToken = jsonwebtoken.sign(user, config.jwtRefreshSecret as string, {
      expiresIn: config.jwtRefreshExpiresIn || '86400s',
    });

    logger.info('Token refreshed successfully');
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
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = await validation.validate(forgotPasswordSchemaValidation, req.body);

    const memberExist = await UserModel.findOne({ email: validateData.email });
    if (!memberExist) throw new ResponseError('Failed', 404, 'Email not found');

    const tokenForgotPassword = uuidv4();

    const result = await UserModel.findOneAndUpdate(
      { email: validateData.email },
      { $set: { tokenResetPassword: tokenForgotPassword } },
      { new: true },
    );

    if (!result || !result.tokenResetPassword) {
      throw new ResponseError('Failed', 500, 'Failed to update user with token');
    }

    const emailPayload = {
      name: result.name,
      email: result.email,
      token: result.tokenResetPassword, // Kirim token reset yang baru dibuat
    };
    const emailTaskPublished = await publishEmailTask(RabbitMQKeys.FORGOT_PASSWORD_ROUTING_KEY, emailPayload);

    if (!emailTaskPublished) {
      throw new ResponseError(
        'Failed',
        500,
        'Failed to queue password reset email. Please try again later or contact support.',
      );
    }

    // const sendMailForgot = await sendMailForgotPassword(result.name, result.email, result.tokenResetPassword);

    // if (!sendMailForgot) {
    //   throw new ResponseError('Failed', 500, 'Failed to send email');
    // }
    logger.info('Forgot Password successfuly, please check your email');
    res.status(200).json({
      status: 'Success',
      statusCode: 200,
      message: 'Forgot Password successfuly, please check your email',
      data: {
        _id: result._id,
        code: result.code,
        name: result.name,
        email: validateData.email,
        tokenResetPassword: tokenForgotPassword,
      },
    });
  } catch (error) {
    if (error instanceof ResponseError) {
      logger.error(`${error.message}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    next(error);
  }
};

export const setActiveToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberExist = await UserModel.findOne({ tokenResetPassword: req.params.token });
    if (!memberExist) throw new ResponseError('Failed', 404, 'Invalid token');

    const currentTimestamp = new Date();
    const tokenTimestamp = memberExist.updatedAt ? new Date(memberExist.updatedAt) : new Date();
    const timeDifference = (currentTimestamp.getTime() - tokenTimestamp.getTime()) / 60000;
    if (timeDifference > 30) throw new ResponseError('Failed', 401, 'Expired Token');

    logger.info('Set active token successfuly');
    res.status(200).json({
      status: 'Success',
      statusCode: 200,
      message: 'set active token successfuly',
    });
  } catch (error) {
    if (error instanceof ResponseError) {
      logger.error(`${error.message}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const memberExist = await UserModel.findOne({ tokenResetPassword: token });
    if (!memberExist) throw new ResponseError('Failed', 404, 'Invalid Token');

    const validateData = await validation.validate(resetPasswordSchemaValidation, req.body);

    const newPassword = await hash(validateData.newPassword, 10);
    await UserModel.updateOne(
      { email: memberExist.email },
      { $set: { password: newPassword, tokenResetPassword: null } },
    );

    logger.info('Reset Password successfuly');
    res.status(200).json({
      status: 'Success',
      statusCode: 200,
      message: 'Reset Password successfuly',
    });
  } catch (error) {
    if (error instanceof ResponseError) {
      logger.error(`${error.message}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    next(error);
  }
};
