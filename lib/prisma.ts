import { PrismaClient } from '@prisma/client';

// PrismaClient'ı global olarak tanımla
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Geliştirme ortamında birden fazla PrismaClient örneği oluşmasını önle
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// globalThis kullanarak PrismaClient'ı global olarak tanımla
const prisma = globalThis.prisma ?? prismaClientSingleton();

// Geliştirme ortamında global değişkene ata
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma; 