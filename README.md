# Kaldıraçlı Trading Platformu

Modern ve kullanıcı dostu bir kaldıraçlı trading platformu. Next.js, TypeScript, Tailwind CSS, Shadcn UI ve PostgreSQL kullanılarak geliştirilmiştir.

## Özellikler

- Kullanıcı kaydı ve girişi
- Farklı kripto para birimlerinde işlem yapma
- 20x'e kadar kaldıraç desteği
- LONG ve SHORT pozisyonlar açma
- Gerçek zamanlı fiyat takibi
- Açık pozisyonları görüntüleme ve kapatma
- Kullanıcı bakiyesi yönetimi

## Teknolojiler

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Veritabanı**: PostgreSQL
- **ORM**: Prisma
- **Kimlik Doğrulama**: NextAuth.js
- **Grafikler**: Lightweight Charts

## Kurulum

### Gereksinimler

- Node.js 18.0 veya üzeri
- PostgreSQL veritabanı

### Adımlar

1. Repoyu klonlayın:

   ```bash
   git clone https://github.com/yourusername/trading-platform.git
   cd trading-platform
   ```

2. Bağımlılıkları yükleyin:

   ```bash
   yarn install
   ```

3. `.env` dosyasını düzenleyin:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/trading_platform?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Veritabanını oluşturun:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Uygulamayı başlatın:

   ```bash
   yarn dev
   ```

6. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## Kullanım

1. Kayıt olun veya giriş yapın
2. Ana sayfada işlem yapmak istediğiniz kripto para birimini seçin
3. İşlem miktarını ve kaldıraç oranını belirleyin
4. LONG veya SHORT pozisyon açın
5. Açık pozisyonlarınızı alt kısımda görüntüleyin
6. İstediğiniz zaman pozisyonlarınızı kapatın

## Lisans

MIT
