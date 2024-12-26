import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { ValidatedUser } from 'src/types/auth/validated-user.type';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return a validated user if credentials are correct', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        email: 'testuser@example.com',
        password: await bcrypt.hash('password123', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: true,
        lastLogin: new Date(),
        roles: [{ id: 1, description: 'Admin' }],
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await authService.validateUser('testuser', 'password123');
      const expected: ValidatedUser = {
        id: 1,
        username: 'testuser',
        roles: [{ id: 1, description: 'Admin' }],
      };

      expect(result).toEqual(expected);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(authService.validateUser('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return a login response with token and user details', async () => {
      const mockUser: ValidatedUser = {
        id: 1,
        username: 'testuser',
        roles: [{ id: 1, description: 'Admin' }],
      };

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      const result = await authService.login(mockUser, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', 'test-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      expect(result).toEqual({
        message: 'Login successful',
        access_token: 'test-token',
        user_logged: 'testuser',
      });
    });
  });
});
