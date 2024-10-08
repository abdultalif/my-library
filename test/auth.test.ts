import { ResponseError } from '../src/error/response-error';
import { MemberModel } from '../src/model/member-model';
import { generateCode } from '../src/utils/code-generator';
import { sendMail } from '../src/utils/send-mail';
import createServer from '../src/utils/server';
import { validation } from '../src/validation/validate';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

const app = createServer();

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/utils/send-mail');
jest.mock('../src/model/member-model');
jest.mock('../src/utils/code-generator');
jest.mock('../src/validation/validate');

const mockFindOne = MemberModel.findOne as jest.Mock;
const mockValidate = validation.validate as jest.Mock;
const mockUpdateOne = MemberModel.updateOne as jest.Mock;
const mockCreateMember = MemberModel.create as jest.Mock;
const mockCodeGenerator = generateCode as jest.Mock;
const mockSendMail = sendMail as jest.Mock;
const mockJWTVerify = jsonwebtoken.verify as jest.Mock;
const mockJWTSign = jsonwebtoken.sign as jest.Mock;
const mockBcryptHash = bcrypt.hash as jest.Mock;
const mockBcryptCompare = bcrypt.compare as jest.Mock;

describe('POST /api/v1/auth - Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 201 status code and the correct data when registration is successful', async () => {
    const mockRequestData = {
      email: 'abdultalif@gmail.com',
      name: 'Abdul Talif',
      password: 'Talif123!',
      confirmPassword: 'Talif123!',
    };

    const mockMember = {
      _id: 'mockedMemberId',
      code: 'M001',
      email: 'abdultalif@gmail.com',
      name: 'Abdul Talif',
      isActive: false,
      isAdmin: false,
    };

    mockValidate.mockResolvedValue(mockRequestData);
    mockCodeGenerator.mockResolvedValue('M001');
    mockFindOne.mockResolvedValue(null);
    mockCreateMember.mockResolvedValue(mockMember);
    mockSendMail.mockResolvedValue(true);
    mockBcryptHash.mockResolvedValue(true);

    const response = await request(app).post('/api/v1/auth').send(mockRequestData);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Register successfuly, Please check your email');
    expect(response.body.data.name).toBe('Abdul Talif');
    expect(response.body.data.email).toBe('abdultalif@gmail.com');

    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
    expect(mockSendMail).toHaveBeenCalledWith('Abdul Talif', 'abdultalif@gmail.com', 'mockedMemberId');
    expect(mockCodeGenerator).toHaveBeenCalledWith(MemberModel, 'M');
    expect(mockBcryptHash).toHaveBeenCalledWith(mockRequestData.password, 10);
  });

  it('should return 400 status code for invalid data', async () => {
    const mockRequestData = {
      email: 'abdultalifgmail.com',
      name: 'Abdul Talif',
      password: '',
      confirmPassword: 'Talif123!',
    };

    mockValidate.mockRejectedValue(new ResponseError('failed', 400, 'Invalid input'));

    const response = await request(app).post('/api/v1/auth').send(mockRequestData);

    expect(response.status).toBe(400); // Pastikan statusnya 400
    expect(response.body.status).toBe('failed');
    expect(response.body.errors).toBe('Invalid input');
    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
  });

  it('should return 409 status code when email already exists', async () => {
    const mockRequestData = {
      email: 'abdultalif@gmail.com',
      name: 'Abdul Talif',
      password: 'Talif123!',
      confirmPassword: 'Talif123!',
    };

    mockValidate.mockResolvedValue(mockRequestData);
    mockFindOne.mockResolvedValue({ email: 'abdultalif@gmail.com' });

    const response = await request(app).post('/api/v1/auth').send(mockRequestData);

    expect(response.status).toBe(409);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Email already exist');
  });

  it('should return 500 status code when failed to send email', async () => {
    const mockRequestData = {
      email: 'abdultalif@gmail.com',
      name: 'Abdul Talif',
      password: 'Talif123!',
      confirmPassword: 'Talif123!',
    };
    mockFindOne.mockResolvedValue(null);
    mockSendMail.mockResolvedValue(null);

    const response = await request(app).post('/api/v1/auth').send(mockRequestData);

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Failed to send email');
  });
});

describe('GET /api/v1/auth/set-active/{email}/{memberId} - Set Active', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 status code and the correct data', async () => {
    mockFindOne.mockResolvedValue({ email: 'abdultalif@gmail.com', _id: 'mockedMemberId' });
    mockUpdateOne.mockResolvedValue({ isActive: true });

    const response = await request(app).get('/api/v1/auth/set-active/abdultalif@gmail.com/mockedMemberId');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Member activated successfully');
  });

  it('should return 404 status code when member not found', async () => {
    mockFindOne.mockResolvedValue(null);

    const response = await request(app).get('/api/v1/auth/set-active/abdultalif@gmail.com/mockedMemberId');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Member not found');
  });

  it('should return 500 status code when failed to connect to database', async () => {
    mockFindOne.mockResolvedValue({ email: 'abdultalif@gmail.com', _id: 'mockedMemberId' });
    mockUpdateOne.mockRejectedValue(new ResponseError('Failed', 500, 'Database connection failed'));

    const response = await request(app).get('/api/v1/auth/set-active/abdultalif@gmail.com/mockedMemberId');
    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Database connection failed');
  });
});

describe('POST /api/v1/auth/login - Login API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 status code when login is successful', async () => {
    const mockRequestData = {
      email: 'abdultalif@gmail.com',
      password: 'ValidPassword123!',
    };

    mockValidate.mockResolvedValue(mockRequestData);

    mockFindOne.mockResolvedValue({
      email: 'abdultalif@gmail.com',
    });

    mockBcryptCompare.mockResolvedValue(true);

    mockJWTSign.mockReturnValueOnce('accessToken');
    mockJWTSign.mockReturnValueOnce('refreshToken');

    const response = await request(app).post('/api/v1/auth/login').send(mockRequestData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Login successfuly');
    expect(response.body.data.token).toBe('accessToken');
    expect(response.body.data.refreshToken).toBe('refreshToken');
  });

  it('should return 400 status code when email is not provided', async () => {
    const mockRequestData = {
      email: '',
      password: 'ValidPassword123!',
    };

    mockValidate.mockImplementation(() => {
      throw new ResponseError('Failed', 400, {
        email: ['Email is required.'],
      });
    });

    const response = await request(app).post('/api/v1/auth/login').send(mockRequestData);

    expect(response.status).toBe(400);

    expect(response.body.status).toBe('Failed');
    expect(response.body.statusCode).toBe(400);

    expect(response.body.errors.email).toEqual(['Email is required.']);
  });

  it('should return 401 status code when password is incorrect', async () => {
    const mockRequestData = {
      email: 'abdultalif@gmail.com',
      password: 'WrongPassword123!',
    };

    mockValidate.mockResolvedValue(mockRequestData);

    mockFindOne.mockResolvedValue({
      email: 'abdultalif@gmail.com',
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await request(app).post('/api/v1/auth/login').send(mockRequestData).expect(401);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Email or Password is wrong');
  });

  it('should return 500 status code when an unexpected error occurs', async () => {
    const mockRequestData = {
      email: 'abdultalif@gmail.com',
      password: 'ValidPassword123!',
    };

    mockValidate.mockResolvedValue(mockRequestData);

    mockFindOne.mockRejectedValue(new ResponseError('Failed', 500, 'Internal Server Error'));

    const response = await request(app).post('/api/v1/auth/login').send(mockRequestData);

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Internal Server Error');
  });

  it('should return 401 status code when user does not exist', async () => {
    const mockRequestData = {
      email: 'abdultalif@gmail.com',
      password: 'ValidPassword123!',
    };

    mockValidate.mockResolvedValue(mockRequestData);

    mockFindOne.mockResolvedValue(null);

    const response = await request(app).post('/api/v1/auth/login').send(mockRequestData);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Email or Password is wrong');
  });
});

describe('POST /api/v1/auth/refresh-token', () => {
  const mockFindOne = MemberModel.findOne as jest.Mock;
  const mockValidate = validation.validate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return 200 status code when refresh token successful', async () => {
    const mockRequestData = { refreshToken: 'jwt-token-unique' };

    mockValidate.mockResolvedValue(mockRequestData);
    mockJWTVerify.mockResolvedValue({ email: 'abdultalif@gmail.com' });
    mockFindOne.mockResolvedValue({ email: 'abdultalif@gmail.com' });

    mockJWTSign.mockReturnValueOnce('newAccessToken');
    mockJWTSign.mockReturnValueOnce('newRefreshToken');

    const response = await request(app).post('/api/v1/auth/refresh-token').send(mockRequestData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Token refreshed successfully');
    expect(response.body.data.token).toBe('newAccessToken');
    expect(response.body.data.refreshToken).toBe('newRefreshToken');
    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
    expect(mockJWTVerify).toHaveBeenCalledWith('jwt-token-unique', expect.anything());
    expect(mockJWTSign).toHaveBeenCalledTimes(2);
  });

  it('should return 400 status code when refresh token is not string', async () => {
    const mockRequestData = { refreshToken: 123 };

    mockValidate.mockImplementation(() => {
      throw new ResponseError('Failed', 400, {
        refreshToken: ['Refresh token must be a string.'],
      });
    });

    const response = await request(app).post('/api/v1/auth/refresh-token').send(mockRequestData);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toEqual({ refreshToken: ['Refresh token must be a string.'] });
    expect(mockValidate).toHaveBeenCalledWith(expect.anything(), mockRequestData);
  });

  it('should return 401 status code when refresh token invalid', async () => {
    const mockRequestData = { refreshToken: 'token-jwt-unique' };
    mockValidate.mockResolvedValue(mockRequestData);
    mockJWTVerify.mockReturnValueOnce(mockRequestData);
    mockFindOne.mockResolvedValue(null);

    const response = await request(app).post('/api/v1/auth/refresh-token').send(mockRequestData);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Invalid refresh token');
  });

  it('should return 500 status code when invalid signature jwt token', async () => {
    const mockRequestData = { refreshToken: 'token-jwt-unique' };
    mockValidate.mockResolvedValue(mockRequestData);
    mockJWTVerify.mockReturnValueOnce(mockRequestData);
    mockFindOne.mockResolvedValue({ email: 'abdultalif@gmail.com' });

    mockJWTSign.mockImplementation(() => {
      throw new ResponseError('Failed', 500, 'Internal Server Error');
    });

    const response = await request(app).post('/api/v1/auth/refresh-token').send(mockRequestData);

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Failed');
    expect(response.body.errors).toBe('Internal Server Error');
  });
});
