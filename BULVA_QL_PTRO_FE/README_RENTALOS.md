# RentalOS Owner – Mobile Phase 1.1

Bản mobile Expo/React Native **đã gắn vào monorepo Next.js + Expo mà bạn gửi**.

- Giữ cấu trúc `apps/mobile/src/app` (Expo Router), `features/*`, `services/*`, `packages/shared`.
- Giữ nguyên phần `apps/web` của starter (không chuyển Web thành RentalOS).
- Chưa có NestJS cho các chức năng RentalOS; dữ liệu là **mock, lưu trên thiết bị**.
- Auth mock là **giả lập**, không có xác thực người dùng hay phân quyền thật.

## 1. Chạy mobile

Tại thư mục gốc:

```bash
corepack enable
corepack install --global pnpm@12.11.2
pnpm install
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev:mobile
```

Mặc định `.env.example` có `EXPO_PUBLIC_DEMO_MODE=true` (không cần backend). Dùng iOS Simulator, Android Emulator hoặc Expo Go phiên bản tương thích với SDK trong dự án. Expo CLI sẽ hiển thị hướng dẫn mở ứng dụng trên thiết bị.

**Tài khoản mẫu:** `demo@example.com` / `Password123!`

Mock login cũng chấp nhận email hợp lệ và mật khẩu dài từ 8 ký tự, **chỉ để thử UI**. Form đăng ký cũng là local mock, không tạo account thực trên server.

Để làm sạch cache Metro khi thay đổi route:

```bash
pnpm --filter @starter/mobile exec expo start -c
```

### Kiểm tra TypeScript khi cài đủ dependencies

```bash
pnpm --filter @starter/mobile typecheck
pnpm --filter @package/shared typecheck
```

## 2. Những chức năng đã code

| Feature | Màn hình và thao tác | Trạng thái |
|---|---|---|
| M01 – Auth | Login, register mock, restore mock session, logout | Có |
| M02 – Dashboard | Tổng property/unit, phòng có người ở, trống, tạm ngừng, occupancy rate | Có |
| M03 – Properties | List/search, detail, create, edit, archive có validation | Có |
| M04 – Units | List theo property, detail, create/edit, status ACTIVE/UNAVAILABLE, archive | Có |
| M05 – Residents | List/search, detail, create/edit, xem lịch sử cư trú | Có |
| Occupancy | Ghi nhận nhận phòng, trả phòng; kiểm tra sức chứa và xung đột cư trú cơ bản | Có |
| Settings | Locale preference, tiền tệ mặc định, reset data, logout | Có |
| Persist | Tạo/sửa mock lưu cục bộ qua AsyncStorage | Có |

**Lưu ý:** `occupancy` phản ánh người ở thực tế, không phải hợp đồng. Tỷ lệ occupancy trên Dashboard là **physical occupancy**, không phải lease occupancy. Chưa có giá hợp đồng, hóa đơn, doanh thu, tính tiền điện nước.

## 3. Cấu trúc mới

```text
packages/shared/src/
  schemas/rental.schema.ts          # Types Entity/DTO Phase 1.1
  mocks/rentals.ts                 # 3 bất động sản, 12 units, 8 residents, 8 occupancies

apps/mobile/src/
  app/
    (auth)/login.tsx
    (auth)/register.tsx
    (app)/(tabs)/                 # Dashboard, Properties, Residents, Settings
    (app)/property/[id].tsx
    (app)/property/form.tsx
    (app)/unit/[id].tsx
    (app)/unit/form.tsx
    (app)/resident/[id].tsx
    (app)/resident/form.tsx
    (app)/occupancy/form.tsx
  components/ui/
    components.tsx                 # UI kit cơ bản
    theme.ts
  features/
    auth/screens/                 # Login/Register
    auth/services/session.ts      # Mock Auth session / Real Auth adapter giữ lại
    dashboard/screens/
    properties/screens/
    units/screens/
    residents/screens/
    occupancies/screens/
    settings/screens/
    rentals/components/
    rentals/store/rental.store.ts # Zustand + AsyncStorage + validation
  services/
    api.ts                        # Auth API adapter từ starter
    token-storage.ts
```

## 4. Luồng thử nhanh

1. Đăng nhập demo → Dashboard hiển thị 3 bất động sản, 12 phòng, 8 hồ sơ người thuê.
2. Tab **Bất động sản** → thêm "Test Building" → chi tiết → thêm phòng "P101".
3. Tab **Người thuê** → thêm "Người thuê mới".
4. Mở hồ sơ người thuê → **Nhận phòng** → chọn phòng vừa thêm → xác nhận.
5. Quay Dashboard: số phòng có người ở và tỷ lệ thay đổi.
6. Mở chi tiết người thuê → **Trả phòng** → Dashboard cập nhật lại.
7. Tab **Cài đặt** → **Khôi phục dữ liệu mẫu** để làm lại.
8. Đóng và mở app: thay đổi cục bộ được giữ lại (nếu không reset/xóa app data).

## 5. Business rules đã mock

- Mã bất động sản là duy nhất trong bộ dữ liệu demo.
- Mã phòng là duy nhất trong cùng bất động sản.
- Không được lưu trữ phòng đang có người ở; không lưu trữ bất động sản khi còn phòng đang hoạt động.
- Không được giảm sức chứa nhỏ hơn số người đang ở.
- Không cho cư trú cùng lúc ở hai phòng bằng cùng một resident (trong mock).
- Số người ở không được vượt sức chứa.
- Ngày nhận/trả phòng định dạng `YYYY-MM-DD` và không nằm trong tương lai.
- Đổi currency của bất động sản đang có phòng bị chặn để tránh giải nghĩa sai giá.
- Form quản lý tiền thuê niêm yết, **chưa có giá hợp đồng**.

## 6. Những việc chưa làm

- Backend NestJS, PostgreSQL, auth thật, RBAC, isolation và file storage thật.
- React Query integration cho các dữ liệu cho thuê (đang dùng Zustand mock).
- Hoàn chỉnh i18n (Setting language mới lưu preference, UI hiện tiếng Việt).
- App ký hợp đồng, hóa đơn, thanh toán, đặt cọc, bảo trì (Phase 1.2 / 1.3).
- Upload hình ảnh, định vị, biểu mẫu địa chỉ và tiền tệ toàn cầu (country picker hiện demo 5 nước).
- Unit/integration/E2E test trên thiết bị thực. Cần `pnpm install` và build thực tế tại môi trường có package registry.

## 7. Khi chuyển mock sang API

Giữ `screens/` và `packages/shared/src/schemas/rental.schema.ts` làm nền; thay `useRentalStore` bằng các query/mutation hooks sử dụng `@tanstack/react-query` và NestJS adapters. Khi đó cần có `organization_id` từ session thật và ủy quyền trên mọi API. `AsyncStorage` mock **không** phải database production.

Nếu cần thêm API, làm theo kiến trúc đơn giản của starter, không tạo Clean Architecture nhiều tầng.
