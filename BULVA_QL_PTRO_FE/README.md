# Next.js + Expo Monorepo — Cấu trúc folder đơn giản

**Mục đích:** Dùng **Next.js (Web)** + **React Native / Expo (iOS & Android)**, kết nối backend NestJS có sẵn. Dùng chung Zod schemas, DTO types, API client functions, TanStack Query hooks, Zustand session. **Không** có Clean Architecture, domain/use-case/repository/interface nhiều tầng.

## Folder chính

```text
apps/
  web/
    src/
      app/                   # Next.js App Router; API route làm BFF/cookie
      features/
        auth/components/     # Form login (chỉ Web)
        tasks/components/    # Danh sách task (chỉ Web)
        home/components/     # Trang chính
      services/              # API client Web
      lib/server/            # Next.js server helper, JWT HttpOnly cookies
      components/            # Providers chung
  mobile/
    src/
      app/                   # Expo Router; file route ngắn gọn
      features/
        auth/screens/        # Giao diện login Mobile
        auth/services/       # Mobile login/restore/logout
        tasks/screens/       # Giao diện dashboard Mobile
      services/              # Mobile Axios + Expo SecureStore
packages/
  shared/
    src/
      api/                   # API client dùng chung, NestJS route paths
      schemas/               # Zod + inferred types
      hooks/                 # TanStack Query hooks
      stores/                # Zustand store dùng chung
      mocks/                 # Demo data
      index.ts               # Exports tập trung
```

### Quy tắc thêm feature mới

Ví dụ thêm `products`:
1. API / type / hook dùng chung: `packages/shared/src/schemas/product.schema.ts`, `api/app-api.ts` (thêm method), `hooks/use-products.ts`; export qua `index.ts`.
2. Web: `apps/web/src/features/products/components/product-list.tsx`.
3. Mobile: `apps/mobile/src/features/products/screens/product-screen.tsx` và khai báo route trong `src/app`.
4. **Không cần tạo domain/application/infrastructure**. Chỉ khi ứng dụng lớn thật sự mới cần thêm tầng.

## Chạy dự án

Yêu cầu: Node.js, pnpm (Corepack có thể dùng tuỳ phiên bản Node), Xcode/Android Studio nếu dùng simulator.

```bash
corepack enable
corepack install --global pnpm@12.11.2
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev:web       # Web: http://localhost:3001
pnpm dev:mobile    # Quét QR bằng Expo/thiết bị tương thích
```

**Demo:** mặc định dùng tài khoản `demo@example.com` / `Password123!`, không cần backend.

## Dùng backend NestJS đã có

Web `apps/web/.env.local`:

```env
DEMO_MODE=false
NEST_API_URL=http://localhost:3000
```

Mobile `apps/mobile/.env`:

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Đổi `192.168.1.100` thành IP LAN của máy chạy NestJS khi test điện thoại thật. Trong production dùng HTTPS.

API mặc định: `/auth/login`, `/auth/refresh`, `/auth/me`, `/auth/logout`, `/tasks`. Schema trong `packages/shared/src/schemas`, endpoints trong `packages/shared/src/api/routes.ts`. Nếu backend thực tế khác, sửa lại API mapping.

- Web gọi `/api/*` Next.js BFF để lưu token trong cookies HttpOnly, không đưa token vào browser JS.
- Mobile gọi NestJS trực tiếp; access token trong RAM và refresh token trong SecureStore.
- Query hooks + Zustand nằm ở `packages/shared`.

## Lưu ý

Đây là starter minh hoạ, chưa phải auth production được kiểm chứng. Các endpoint/token shape phải được điều chỉnh theo backend. Chưa cài dependency và build thực tế trong môi trường tạo file vì không có npm registry. Hãy chạy `pnpm install`, sau đó `pnpm --filter @starter/web typecheck` và `pnpm --filter @starter/mobile typecheck` trên máy. Kiểm thử đăng nhập/refresh/logout và bảo mật cookie, rate limit, CSRF khi tích hợp thật.

## EAS Update (mobile OTA)

Xem [README_EAS_UPDATE.md](README_EAS_UPDATE.md) để tạo/liên kết EAS project, build preview/production, phát hành OTA và rollback. Chưa liên kết Project ID thì OTA tắt; local development vẫn hoạt động.
