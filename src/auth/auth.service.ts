import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';
import { LoginResponse } from 'src/types/auth/login-response.type';
import { ValidatedUser } from 'src/types/auth/validated-user.type';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    /**
     * Validate the user's credentials.
     * @param username The username provided by the user.
     * @param password The password provided by the user.
     * @returns The user object if validation is successful.
     * @throws UnauthorizedException if validation fails.
     */
    async validateUser(username: string, password: string): Promise<ValidatedUser> {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: { roles: true }, // Incluir los roles asociados al usuario
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            return {
                id: user.id,
                username: user.username,
                roles: user.roles.map((role) => ({
                    id: role.id,
                    description: role.description,
                })),
            };
        }

        throw new UnauthorizedException('Invalid credentials');
    }

    /**
     * Generate a JWT and set it as a cookie in the response.
     * @param user The validated user object.
     * @param response The HTTP response object.
     * @returns A message indicating a successful login.
     */
    async login(user: ValidatedUser, response: Response): Promise<LoginResponse> {
        const payload = { username: user.username, sub: user.id };
        const token = this.jwtService.sign(payload);

        // Configurar cookie
        response.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 día
        });

        return {
            message: 'Login successful',
            access_token: token,
            user_logged: user.username,
        };
    }
}
