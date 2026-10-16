# RentalOS Phase 1.1 – Cập nhật quản lý tiện ích & phòng

Bản source này giữ **monorepo `apps/mobile` + `apps/web` + `packages/shared`**. `apps/web` chỉ giữ cấu trúc starter, chưa triển khai nghiệp vụ RentalOS.

## Luồng mới: thêm tiện ích ngay trong form phòng

1. Vào **Bất động sản → Chọn tòa nhà → Thêm phòng** (hoặc **Chi tiết phòng → Chỉnh sửa**).
2. Điền các trường mã phòng, giá thuê, diện tích, sức chứa như bình thường.
3. Trong mục **Tiện ích thu phí**, chọn các tiện ích sẵn có. Nếu không tìm thấy, bấm **Thêm tiện ích mới**. Nếu chưa có tiện ích phù hợp tiền tệ, form sẽ tự mở.
4. Form mở **ngay trong màn hình thêm/sửa phòng**, gồm: Tên tiện ích, Tính 1 lần, Đơn vị đầu vào (chỉ khi tắt Tính 1 lần), Đơn giá + mã tiền tệ.
5. Bấm **Tạo và chọn tiện ích**. Danh sách tự cập nhật từ Zustand, tiện ích vừa tạo tự được tích chọn. Form tiện ích đóng lại; toàn bộ thông tin phòng đang nhập được giữ nguyên.
6. Bấm **Tạo phòng** / **Lưu thay đổi** để lưu phòng cùng các tiện ích đã chọn.

Tiện ích được lưu riêng ngay sau khi nhấn **Tạo và chọn tiện ích**. Nếu người dùng hủy form phòng sau đó, tiện ích vẫn nằm trong danh mục **Cài đặt → Tiện ích** để tái sử dụng cho phòng khác. Mức giá là giá tham khảo trên danh mục, chưa tạo hóa đơn ở Phase 1.1.

### Quy tắc quan trọng

- Đơn giá dùng tiền tệ của **bất động sản** ở form phòng; ở Cài đặt sử dụng **tiền tệ mặc định**. Không tự đổi tiền tệ các bản ghi cũ.
- Có thể trùng tên tiện ích ở **các đồng tiền khác nhau** (ví dụ `Điện` VND và `Điện` USD), nhưng không trùng tên trong cùng đồng tiền.
- `Tính 1 lần = true`: số lượng = 1, không hiển thị và không lưu đơn vị đầu vào.
- `Tính 1 lần = false`: bắt buộc nhập đơn vị đầu vào (`kWh`, `khối`, `chiếc`...).
- Giá phải không âm; VND/JPY/KRW không có phần thập phân; các loại tiền còn lại hỗ trợ đến 2 chữ số.
- Thêm tiện ích mới không tự lưu các trường khác của phòng; chỉ khi nhấn **Tạo phòng/Lưu thay đổi** phòng mới thay đổi.
- Sửa giá/đơn vị của tiện ích trong **Cài đặt** ghi lịch sử vào các phòng đang dùng tiện ích đó.

## Các thay đổi khác tích lũy từ yêu cầu trước

- Nhận phòng **nhiều người một lượt** và kiểm tra sức chứa theo batch (không ghi một phần khi có lỗi).
- Lịch sử phòng khi tạo/sửa/lưu trữ, nhận/trả người ở, gán/bỏ tiện ích, thay đổi giá tiện ích.
- **Cài đặt → Tiện ích** có màn hình danh sách, tạo/sửa và ngừng sử dụng.
- Dữ liệu mock Zustand lưu local với AsyncStorage. Migration từ dữ liệu demo cũ vẫn giữ phòng/người thuê, bổ sung catalogue và lịch sử.
- Đã đồng bộ các props màu/UI cũ trong starter và bỏ import chưa khai báo `expo-linear-gradient` ở màn hình Dashboard/Property Card để tránh lỗi bundling thiếu package.
- `apps/mobile/tsconfig.json` không dùng `baseUrl` đã deprecated.

## Cách chạy

```bash
# Từ thư mục gốc của project (thư mục chứa pnpm-workspace.yaml)
pnpm install
pnpm --filter @starter/mobile exec expo start -c
```

Với Expo Web nhấn `w` trong CLI hoặc chạy:

```bash
pnpm --filter @starter/mobile exec expo start --web -c
```

Nếu chỉ muốn cập nhật project đang làm, giải nén file patch zip vào **root project**, giữ cấu trúc `apps/mobile/src/...` và `packages/shared/src/...`. **Nên commit/back up các thay đổi cục bộ trước khi ghi đè.**

## File nổi bật

```text
apps/mobile/src/features/utilities/components/utility-editor.tsx     # Form tái sử dụng
apps/mobile/src/features/utilities/screens/utility-form-screen.tsx  # Cài đặt → Tiện ích
apps/mobile/src/features/units/screens/unit-form-screen.tsx         # Tạo tiện ích inline + auto-select
apps/mobile/src/features/rentals/store/rental.store.ts              # Zustand store, validation, history
packages/shared/src/schemas/rental.schema.ts                        # UtilityDefinition, Unit utilityIds, history DTO
```

## Trạng thái kiểm thử

- Đã kiểm tra cú pháp TS/TSX cho 70 source files bằng TypeScript compiler API (parse/transpile).
- Đã chạy mock-store test (tạo/sửa/ngừng tiện ích, lịch sử phòng, gán tiện ích, nhận phòng nhiều người, migration).
- Chưa chạy build Expo thực tế/simulator do runtime hiện không có node_modules của app. Sau `pnpm install`, hãy chạy `pnpm --filter @starter/mobile typecheck` tại máy của bạn.
