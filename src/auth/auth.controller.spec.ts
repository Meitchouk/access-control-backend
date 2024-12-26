import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/dtos/auth/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a login response if credentials are valid', async () => {
      const mockLoginDto: LoginDto = { username: 'testuser', password: 'password123' };
      const mockUser = {
        id: 1,
        username: 'testuser',
        roles: [{ id: 1, description: 'Admin' }],
      };

      const mockResponse = { cookie: jest.fn() } as any;

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue({
        message: 'Login successful',
        access_token: 'test-token',
        user_logged: 'testuser',
      });

      const result = await authController.login(mockLoginDto, mockResponse);

      expect(authService.validateUser).toHaveBeenCalledWith('testuser', 'password123');
      expect(authService.login).toHaveBeenCalledWith(mockUser, mockResponse);
      expect(result).toEqual({
        message: 'Login successful',
        access_token: 'test-token',
        user_logged: 'testuser',
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const mockLoginDto: LoginDto = { username: 'testuser', password: 'wrongpassword' };

      jest.spyOn(authService, 'validateUser').mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(mockLoginDto, {} as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
