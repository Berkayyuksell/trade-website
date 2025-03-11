
<img width="1470" alt="Ekran Resmi 2025-03-11 16 27 08" src="https://github.com/user-attachments/assets/333d77c6-3b0f-4b47-8684-170a86930bc8" />

<img width="1470" alt="Ekran Resmi 2025-03-11 16 28 10" src="https://github.com/user-attachments/assets/1467a4ec-0e09-4069-911e-8174061dc337" />


<img width="1470" alt="Ekran Resmi 2025-03-11 16 28 25" src="https://github.com/user-attachments/assets/fe12b745-5ba9-4270-bfd5-dcaadf4d955d" />

<img width="1470" alt="Ekran Resmi 2025-03-11 16 28 42" src="https://github.com/user-attachments/assets/d6a6bd13-4c2f-4e0d-aa69-1376caaa23c9" />


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
