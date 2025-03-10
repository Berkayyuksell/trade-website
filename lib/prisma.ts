import { PrismaClient } from '@prisma/client';

// PrismaClient'ı global olarak tanımla
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Geliştirme ortamında birden fazla PrismaClient örneği oluşmasını önle
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Geliştirme ortamında global değişkene ata
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma; 