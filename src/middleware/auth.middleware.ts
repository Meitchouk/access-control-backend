import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService) { }

    use(req: Request, res: Response, next: NextFunction) {
        // Permitir acceso sin token para rutas específicas
        if (req.path === '/auth/login' && req.method === 'POST') {
            return next();
        }

        const token = req.cookies['access_token'];
        if (!token) {
            throw new UnauthorizedException('No authentication token found');
        }

        try {
            const decoded = this.jwtService.verify(token);
            req.user = decoded;
            next();
        } catch (err) {
            throw new UnauthorizedException('Invalid authentication token');
        }
    }
}
