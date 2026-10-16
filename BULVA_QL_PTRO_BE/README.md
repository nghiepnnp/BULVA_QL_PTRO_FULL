# YouTube Clone Backend

Backend cho dự án YouTube Clone, xây dựng bằng NestJS 12, TypeScript, TypeORM và PostgreSQL.

## Công nghệ chính

- Node.js ESM
- NestJS 12
- TypeScript 6 với `NodeNext`
- TypeORM
- PostgreSQL
- Vitest
- pnpm

## Yêu cầu môi trường

- Node.js 24.15 trở lên trong nhánh Node 24
- pnpm 11
- PostgreSQL hoặc một dịch vụ tương thích như Supabase

Kiểm tra phiên bản đang sử dụng:

```bash
node --version
pnpm --version
```

## Cài đặt

```bash
pnpm install
```

Tạo file `.env` tại thư mục gốc của backend:

```dotenv
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=postgres
```

Không commit `.env` hoặc thông tin đăng nhập database vào Git.

## Chạy dự án

Chạy development một lần:

```bash
pnpm start
```

Chạy development và tự compile lại khi source thay đổi:

```bash
pnpm start:dev
```

Build production:

```bash
pnpm build
```

Chạy output đã build:

```bash
pnpm start:prod
```

Ứng dụng mặc định chạy tại `http://localhost:3000`. Các API được đặt dưới prefix:

```text
/api/v1
```

## Swagger / OpenAPI

Sau khi chạy dự án, mở Swagger UI tại:

```text
http://localhost:3000/docs
```

OpenAPI JSON được cung cấp tại:

```text
http://localhost:3000/docs-json
```

Để gọi endpoint được bảo vệ ngay trên Swagger UI:

1. Gọi `POST /api/v1/auth/login` để lấy `access_token`.
2. Nhấn **Authorize**.
3. Dán giá trị token vào ô Bearer authentication.
4. Gọi endpoint cần xác thực. Swagger tự thêm header `Authorization: Bearer <token>`.

Schema DTO được sinh từ type TypeScript và các decorator `class-validator` thông qua Swagger CLI plugin trong `nest-cli.json`.

## Cấu trúc thư mục chính

```text
src/
├── common/                  # Filter, pipe và utility dùng chung
├── config/                  # Cấu hình ứng dụng
├── database/
│   ├── data-source.ts       # DataSource dành cho TypeORM CLI
│   ├── database.module.ts   # Kết nối database trong NestJS
│   └── migrations/          # Các migration đã được version hóa
├── modules/
│   ├── auth/
│   └── users/
├── app.module.ts
└── main.ts
```

## Quy tắc import và ESM

Dự án chạy native Node.js ESM với cấu hình:

```json
{
  "type": "module"
}
```

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext"
  }
}
```

### Relative import phải có `.js`

Dù file source có đuôi `.ts`, relative import phải tham chiếu tới file `.js` sẽ được tạo trong `dist`:

```ts
// Đúng
import { User } from './user.entity.js';

// Sai trong Node ESM
import { User } from './user.entity';
```

### Native alias `#/common/*`

Code dùng native package imports của Node.js thay cho alias `@/*`:

```ts
import { hashPassword } from '#/common/utils/hash.utils';
```

Alias được khai báo trong `package.json`:

```json
{
  "imports": {
    "#/common/*": {
      "types": "./src/common/*.ts",
      "default": "./dist/common/*.js"
    }
  }
}
```

- TypeScript dùng nhánh `types` để đọc source `.ts`.
- Node.js dùng nhánh `default` để chạy output `.js` trong `dist`.
- Không cần transformer, runtime resolver hoặc alias package tự viết.

Khi thêm alias native mới, alias phải bắt đầu bằng `#` và cần khai báo cả đường dẫn source lẫn output, ví dụ:

```json
{
  "imports": {
    "#modules/*": {
      "types": "./src/modules/*.ts",
      "default": "./dist/modules/*.js"
    }
  }
}
```

## Database và migration

Ứng dụng và TypeORM CLI đều dùng PostgreSQL. Schema synchronization đã được tắt:

```ts
synchronize: false;
```

Không bật lại `synchronize` khi dự án đang quản lý schema bằng migration.

TypeORM CLI đọc kết nối từ `src/database/data-source.ts`. Cấu hình UUID sử dụng `pgcrypto` và PostgreSQL `gen_random_uuid()`.

### Quy trình cập nhật database

1. Thay đổi entity trong `src/modules`.
2. Generate migration bằng cách so sánh entity với schema database hiện tại.
3. Đọc và kiểm tra SQL trong migration vừa tạo.
4. Chạy migration.
5. Commit entity và migration cùng nhau.

TypeORM so sánh entity trực tiếp với database được cấu hình trong `.env`; nó không dùng model snapshot giống EF Core.

### Generate migration tự động

```bash
pnpm migration:generate src/database/migrations/AddSomething
```

Ví dụ:

```bash
pnpm migration:generate src/database/migrations/AddUserAvatar
```

Nếu không có khác biệt giữa entity và database, TypeORM sẽ không tạo migration và có thể trả về exit code `1`.

### Tạo migration rỗng

Dùng khi cần tự viết SQL hoặc xử lý data migration:

```bash
pnpm migration:create src/database/migrations/BackfillUserPasswords
```

### Xem trạng thái migration

```bash
pnpm migration:show
```

### Chạy các migration đang pending

```bash
pnpm migration:run
```

### Hoàn tác migration cuối cùng

```bash
pnpm migration:revert
```

### Lưu ý an toàn

- Luôn đọc nội dung migration được generate trước khi chạy.
- Backup database trước khi chạy migration trên production.
- Migration thêm cột `NOT NULL` vào bảng đã có dữ liệu cần backfill dữ liệu trước khi đặt `NOT NULL`.
- Không chỉnh sửa migration đã chạy trên môi trường dùng chung; hãy tạo migration mới.
- Không chạy `migration:generate` đồng thời từ nhiều nhánh code trên cùng một database.

## Logging và xử lý exception

Nest ghi log đồng thời ra console và các file JSON Lines:

```text
logs/backend.log  # toàn bộ log
logs/error.log    # error và fatal
```

Thư mục `logs` được tạo tự động khi ứng dụng khởi động và đã được loại khỏi Git. `GlobalExceptionFilter` bắt exception trong HTTP request, ghi log và trả response lỗi chuẩn mà không làm dừng server. Các query parameter nhạy cảm như `password`, `token`, `secret`, `code`, `otp` và `hash` được che khỏi log.

Theo dõi log trong lúc phát triển:

```bash
tail -f logs/backend.log
tail -f logs/error.log
```

Lỗi nghiêm trọng ngoài lifecycle của HTTP request không nên bị bỏ qua để giữ process chạy trong trạng thái không xác định. Khi triển khai production, dùng Docker, systemd hoặc PM2 để tự khởi động lại process nếu xảy ra lỗi process-level.

## Kiểm tra chất lượng code

Lint:

```bash
pnpm lint
```

Format source:

```bash
pnpm format
```

Chạy unit test:

```bash
pnpm test
```

Chạy test ở watch mode:

```bash
pnpm test:watch
```

Chạy test coverage:

```bash
pnpm test:cov
```

Chạy end-to-end test:

```bash
pnpm test:e2e
```

## Production workflow

Quy trình triển khai tối thiểu:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm migration:run
pnpm start:prod
```

Nên chạy migration như một bước riêng trong deployment pipeline trước khi khởi động phiên bản ứng dụng mới.

## Tài liệu tham khảo

- [NestJS documentation](https://docs.nestjs.com/)
- [NestJS ESM migration guide](https://docs.nestjs.com/migration-guide#switching-your-project-to-esm)
- [TypeORM migrations](https://typeorm.io/docs/migrations/setup/)
- [Node.js package imports](https://nodejs.org/api/packages.html#subpath-imports)
- [TypeScript NodeNext module resolution](https://www.typescriptlang.org/docs/handbook/modules/reference#node16-nodenext)
