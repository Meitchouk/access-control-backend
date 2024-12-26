import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Hace que PrismaModule sea global
@Module({
    providers: [PrismaService],
    exports: [PrismaService], // Exporta PrismaService
})
export class PrismaModule { }
