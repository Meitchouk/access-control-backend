import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Crear o buscar el rol Admin
    await prisma.role.upsert({
        where: { description: 'Admin' },
        update: {},
        create: {
            description: 'Admin',
            status: true,
        },
    });

    // Crear o buscar el rol User
    await prisma.role.upsert({
        where: { description: 'User' },
        update: {},
        create: {
            description: 'User',
            status: true,
        },
    });

    // Hashear contraseñas
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    // Crear o buscar el usuario Admin
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@example.com',
            password: hashedAdminPassword,
            name: 'Administrator',
            status: true,
            roles: {
                connect: [{ description: 'Admin' }],
            },
        },
    });

    // Crear o buscar el usuario User
    await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            username: 'user',
            email: 'user@example.com',
            password: hashedUserPassword,
            name: 'Regular User',
            status: true,
            roles: {
                connect: [{ description: 'User' }],
            },
        },
    });

    console.log('Seed data created successfully with Admin and User roles!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
