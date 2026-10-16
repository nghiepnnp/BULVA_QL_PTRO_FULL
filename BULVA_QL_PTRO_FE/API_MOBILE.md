# Đặc tả API cho RentalOS Mobile

Đối chiếu source ngày 16/10/2026. Tài liệu phân biệt endpoint đã có code gọi và endpoint đề xuất để thay dữ liệu local. Đây không phải danh sách endpoint backend đang chạy.

## 1. Trạng thái hiện tại

- `.env` hiện dùng demo. Email login/me/logout trả dữ liệu mock, không gửi HTTP.
- Bật API thật bằng `EXPO_PUBLIC_DEMO_MODE=false` và `EXPO_PUBLIC_API_URL` đúng máy chủ.
- Google/Apple đã có adapter native nhưng chưa có OAuth/backend; `EXPO_PUBLIC_SOCIAL_AUTH_ENABLED=false` mặc định. Sau khi cấu hình, đặt `true`. Google: iOS/Android; Apple: iOS. Web chỉ xem trước các nút.
- Bất động sản, phòng, người thuê, nhận/trả phòng, tiện ích, lịch sử, tùy chọn vẫn dùng Zustand/AsyncStorage. Bật API auth KHÔNG tự chuyển các dữ liệu này lên server.
- Có **7 endpoint auth** được luồng mobile sử dụng khi bật chế độ thật. `GET /tasks` có trong adapter chung nhưng không được màn mobile nào gọi.

## 2. Quy ước cần khớp code hiện có

- Base URL: `EXPO_PUBLIC_API_URL`; ví dụ `https://api.your-domain.vn/v1`. Các path bên dưới nối vào base URL.
- JSON, camelCase. Trả object trực tiếp, **không bọc `{ data: ... }`**: adapter hiện parse trực tiếp `response.data`.
- Các request cần phiên dùng `Authorization: Bearer <accessToken>`; login, refresh, Google, Apple và Apple challenge không cần bearer.
- Access token giữ trong RAM; refresh token native nằm trong SecureStore. Không nhầm Google/Apple ID token với token riêng của RentalOS.
- Khi request có phiên nhận `401`, app gọi refresh và thử lại request một lần. Login/refresh không tự retry. Google/Apple dùng client riêng, không gắn phiên cũ và không tự refresh/retry.
- Khởi động lại app: access token trong RAM mất; `/auth/me` có thể được gọi chưa có bearer, trả `401` sẽ kích hoạt refresh bằng refresh token đã lưu.
- Response 2xx đúng schema mới được chấp nhận. Logout không đọc body, nên dùng `204`.
- API auth thông thường và social timeout 15 giây; refresh hiện dùng axios trực tiếp chưa đặt timeout riêng.

### Kiểu dữ liệu dùng chung

```ts
type Tokens = {
  accessToken: string;  // không rỗng
  refreshToken: string; // không rỗng
};
type User = {
  id: string | number; // mobile chuyển thành string
  email: string;       // email hợp lệ; chấp nhận email relay Apple
  name: string;
};
type SocialSession = Tokens & { user: User };
```

## 3. API auth đã có code gọi

| Method | Path mặc định | Body | Response thành công | Khi gọi |
|---|---|---|---|---|
| POST | `/auth/login` | `{email, password}` | `Tokens` | Đăng nhập email; sau đó gọi `/auth/me` |
| GET | `/auth/me` | Không | `User` | Lấy hồ sơ sau login hoặc khôi phục phiên |
| POST | `/auth/refresh` | `{refreshToken}` | `Tokens` | Request có phiên trả 401 |
| POST | `/auth/logout` | `{refreshToken}` | `204` | Đăng xuất; app vẫn xóa phiên local khi API lỗi |
| POST | `/auth/google` | `{idToken}` | `SocialSession` | Sau Google native SDK thành công |
| POST | `/auth/apple/challenge` | Không | `{challengeId, nonce}` | Trước khi mở đăng nhập Apple |
| POST | `/auth/apple` | `{idToken, authorizationCode, challengeId, fullName?}` | `SocialSession` | Sau Apple SDK thành công và app kiểm tra state |

### POST /auth/login

```json
{"email":"owner@example.com","password":"user-entered-password"}
```

```json
{"accessToken":"application-access-token","refreshToken":"application-refresh-token"}
```

Không bắt buộc trả `user` trong login: code email luôn gọi `/auth/me` tiếp. Schema shared hiện yêu cầu mật khẩu tối thiểu **6** ký tự; demo yêu cầu **8**. Khi chốt chính sách mật khẩu backend cần thống nhất validation mobile (không dùng quy tắc demo làm đặc tả bảo mật).

### GET /auth/me

```json
{"id":"owner-123","email":"owner@example.com","name":"Nguyễn Văn A"}
```

Trả `401` khi access token thiếu/hết hạn/không hợp lệ. Backend phải trả đúng danh tính của phiên, không nhận user ID từ client để tự chọn hồ sơ.

### POST /auth/refresh và /auth/logout

```json
{"refreshToken":"application-refresh-token"}
```

Refresh trả `Tokens` mới. Nên rotation/revoke token và kiểm tra trạng thái tài khoản trên server. Logout phải thu hồi phiên tương ứng; body có thể là `{ "refreshToken": null }` nếu local không còn refresh token, nên xử lý idempotent. App có thể gắn bearer nếu có sẵn.

### POST /auth/google

```json
{"idToken":"google-identity-token"}
```

Server xác minh chữ ký/JWKS hoặc Google SDK, issuer, audience đúng Google Web Client ID và expiration. Lấy `sub` từ token đã xác minh để nhận diện tài khoản; không tin user ID/email tự khai báo. Không tự liên kết tài khoản mật khẩu bằng email trùng mà chưa có xác minh phù hợp.

### POST /auth/apple/challenge

```json
{"challengeId":"opaque-one-time-challenge-id","nonce":"cryptographically-random-nonce-at-least-16-characters"}
```

Server tạo nonce đủ mạnh, lưu challenge có TTL ngắn, chỉ sử dụng một lần. App truyền nonce nguyên văn vào Apple SDK; server đối chiếu claim `nonce` của ID token với challenge. App còn dùng state ngẫu nhiên riêng và kiểm tra phản hồi SDK trước khi trao đổi với API.

### POST /auth/apple

```json
{
  "idToken":"apple-identity-token",
  "authorizationCode":"apple-authorization-code",
  "challengeId":"opaque-one-time-challenge-id",
  "fullName":{"givenName":"Văn A","familyName":"Nguyễn"}
}
```

`fullName` có thể vắng mặt; các phần tên có thể null. Apple thường chỉ cấp tên ở lần đầu. Server giữ hồ sơ để lần sau trả đầy đủ `User`, xử lý email relay, không ép người dùng cung cấp email cá nhân. Tên là dữ liệu hồ sơ, không phải bằng chứng danh tính.

Server xác minh chữ ký, issuer, audience=bundle identifier iOS, expiration, nonce; tiêu thụ challenge một lần và đổi authorization code với Apple phía server. Private key/client secret Apple không đưa vào mobile. Backend lưu dữ liệu cần thiết để thu hồi quyền Apple khi xóa tài khoản thật.

### Response chung Google / Apple

```json
{
  "accessToken":"application-access-token",
  "refreshToken":"application-refresh-token",
  "user":{"id":"owner-123","email":"relay-or-verified@example.com","name":"Nguyễn Văn A"}
}
```

Tên path social đổi được qua `EXPO_PUBLIC_GOOGLE_AUTH_PATH`, `EXPO_PUBLIC_APPLE_AUTH_PATH`, `EXPO_PUBLIC_APPLE_CHALLENGE_PATH`. Hướng dẫn OAuth/build ở [README_SOCIAL_AUTH.md](README_SOCIAL_AUTH.md).

## 4. API có sẵn trong adapter nhưng chưa dùng trên màn mobile

`GET /tasks`, bearer, trả mảng trực tiếp:

```json
[{"id":"task-1","title":"Công việc mẫu","completed":false}]
```

Đây là phần starter. Không cần ưu tiên triển khai để chạy các màn quản lý cho thuê hiện tại.

## 5. API đề xuất để thay phần dữ liệu local — CHƯA có code gọi

Các route dưới đây là thiết kế đề xuất dựa trên thao tác thực tế của source. Backend làm xong vẫn cần thay `rental.store.ts` bằng API/query adapter; mobile hiện chưa gọi bất kỳ route nào trong mục này.

### Tài khoản và cài đặt

| Method | Route đề xuất | Dữ liệu/chức năng |
|---|---|---|
| POST | `/auth/register` | `{name,email,password}` → `SocialSession`; đăng ký hiện chỉ là demo local |
| PATCH | `/auth/me` | `{name}` → `User` |
| POST | `/auth/change-password` | `{currentPassword,newPassword}` → 204; chỉ áp dụng tài khoản có mật khẩu |
| GET | `/auth/account-deletion` | Xem dữ liệu bị xóa/giữ lại, trạng thái, lý do giữ, thời gian xử lý |
| POST | `/auth/account-deletion` | Yêu cầu xóa thực, yêu cầu xác thực lại; response `{id,status,requestedAt,estimatedCompletionAt}` |
| GET | `/me/preferences` | Lấy tùy chọn đồng bộ |
| PATCH | `/me/preferences` | `{language,appearance,defaultCurrency,notifications}`; cập nhật một phần |

`language`: `vi | en`; `appearance`: `light | dark | system`. `notifications`: `{rent,invoices,contracts,maintenance,marketing}` là boolean. Marketing mặc định false. Appearance/ngôn ngữ có thể chỉ giữ local nếu không cần đồng bộ; trạng thái quyền OS không được server giả lập.

Cơ chế xác thực lại cho đổi mật khẩu/xóa tài khoản cần thiết kế theo nhà cung cấp đăng nhập. Không dùng việc gõ email làm xác thực danh tính. Route push-device-token, gửi thông báo, IAP, khôi phục mua hàng chưa có client/luồng thực trong source, chưa chốt contract.

### Quản lý cho thuê

| Method | Route đề xuất | Request / response |
|---|---|---|
| GET | `/organization` | → `Organization` của phiên |
| GET | `/properties` | `?q=&status=` → danh sách `Property` |
| POST | `/properties` | `PropertyDraft` → `Property` |
| GET | `/properties/:id` | → `Property` |
| PATCH | `/properties/:id` | Các trường thay đổi của `PropertyDraft` → `Property` |
| POST | `/properties/:id/archive` | Không body → `Property` có status ARCHIVED |
| GET | `/units` | `?propertyId=&q=&status=` → danh sách `Unit` |
| POST | `/units` | `UnitDraft` → `Unit` |
| GET | `/units/:id` | → `Unit` |
| PATCH | `/units/:id` | Các trường thay đổi của `UnitDraft` → `Unit` |
| POST | `/units/:id/archive` | Không body → `Unit` có status ARCHIVED |
| GET | `/units/:id/history` | → danh sách `UnitHistoryEntry` |
| GET | `/residents` | `?q=` → danh sách `Resident` |
| POST | `/residents` | `ResidentDraft` → `Resident` |
| GET | `/residents/:id` | → `Resident` |
| PATCH | `/residents/:id` | Các trường thay đổi của `ResidentDraft` → `Resident` |
| GET | `/occupancies` | `?unitId=&residentId=&active=` → danh sách `Occupancy` |
| POST | `/occupancies/move-in` | `{unitId,residentIds,moveInOn}` → `Occupancy[]`, atomic |
| POST | `/occupancies/:id/move-out` | `{moveOutOn}` → `Occupancy` |
| GET | `/utilities` | `?active=&currencyCode=` → danh sách `UtilityDefinition` |
| POST | `/utilities` | `UtilityDraft` → `UtilityDefinition` |
| PATCH | `/utilities/:id` | Các trường thay đổi của `UtilityDraft` → `UtilityDefinition` |
| POST | `/utilities/:id/archive` | Không body → `UtilityDefinition` có active=false |

Tổng quan hiện tự tính từ các danh sách (bất động sản, phòng, occupancy); chưa cần `/dashboard` riêng. Có thể thêm endpoint tổng hợp khi dữ liệu lớn.

Với API danh sách mới, đề xuất `{items: T[], nextCursor: string | null}` và query `cursor,limit`; đây là contract mới cần adapter mobile tương ứng. Nếu muốn nối MVP đơn giản hơn, có thể thống nhất mảng trực tiếp trước. Không áp dụng envelope này cho 7 API auth hiện có.

### DTO nguồn cho phần quản lý cho thuê

Copy/type-map từ `packages/shared/src/schemas/rental.schema.ts`. Các field server cấp: `id`, `organizationId`, `createdAt`. Không lấy quyền tổ chức từ `organizationId` do client tự gửi. Client hiển thị ID dạng string.

```ts
/** Simple shared DTOs for Phase 1.1; backend contracts can later replace the mock adapter. */
export type PropertyType = "ROOMING_HOUSE" | "APARTMENT_BUILDING" | "HOUSE" | "OTHER";
export type UnitType = "ROOM" | "APARTMENT" | "HOUSE" | "OTHER";
export type OperationalStatus = "ACTIVE" | "UNAVAILABLE" | "ARCHIVED";

export interface Organization {
  id: string;
  name: string;
  countryCode: string;
  defaultCurrency: string;
  timezone: string;
}
export interface Property {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  countryCode: string;
  currencyCode: string;
  timezone: string;
  description: string;
  accent: string;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
}
export interface Unit {
  id: string;
  organizationId: string;
  propertyId: string;
  code: string;
  name: string;
  type: UnitType;
  floor: string;
  areaM2: number;
  capacity: number;
  monthlyRent: number;
  amenities?: string[]; // physical features (air conditioner, balcony, etc.)
  utilityIds?: string[]; // selected billable utility definitions; prices live in UtilityDefinition
  status: OperationalStatus;
  description: string;
}
export interface Resident {
  id: string;
  organizationId: string;
  fullName: string;
  phone: string;
  email: string;
  emergencyContact: string;
  notes: string;
  createdAt: string;
}
export interface Occupancy {
  id: string;
  organizationId: string;
  unitId: string;
  residentId: string;
  moveInOn: string; // local business date YYYY-MM-DD
  moveOutOn: string | null;
  isPrimary: boolean;
}
export type PropertyDraft = Omit<Property, "id" | "organizationId" | "createdAt">;
export type UnitDraft = Omit<Unit, "id" | "organizationId">;
export type ResidentDraft = Omit<Resident, "id" | "organizationId" | "createdAt">;

/** Local, per-unit activity history for MVP. NOT a server-side immutable audit log. */
export type UnitHistoryKind = "UNIT_CREATED" | "UNIT_UPDATED" | "UNIT_ARCHIVED" | "MOVE_IN" | "MOVE_OUT" | "UTILITY_UPDATED" | "UTILITY_REMOVED";
export interface UnitHistoryChange {
  field: string;
  before: string;
  after: string;
}
export interface UnitHistoryEntry {
  id: string;
  organizationId: string;
  unitId: string;
  kind: UnitHistoryKind;
  occurredAt: string; // UTC ISO 8601
  summary: string;
  changes: UnitHistoryChange[];
  residentIds: string[];
}

/** Configurable charge definition in Settings; chargeOnce means quantity is always 1. */
export interface UtilityDefinition {
  id: string;
  organizationId: string;
  name: string;
  chargeOnce: boolean;
  inputUnit: string | null; // null if chargeOnce
  unitPrice: number;
  currencyCode: string; // snapshot when created or explicitly edited
  active: boolean;
  createdAt: string;
}
export type UtilityDraft = Pick<UtilityDefinition, "name" | "chargeOnce" | "inputUnit" | "unitPrice" | "currencyCode">;

```

### Quy tắc nghiệp vụ source đang áp dụng

1. Mỗi query/mutation giới hạn theo tổ chức của phiên đăng nhập. Xác thực quyền với mọi ID được tham chiếu.
2. Mã bất động sản không trùng (bỏ khoảng trắng đầu/cuối, không phân biệt hoa thường) trong các bất động sản chưa lưu trữ. Mã phòng không trùng trong cùng bất động sản chưa lưu trữ.
3. Không đổi tiền tệ bất động sản khi còn phòng chưa lưu trữ. Không lưu trữ bất động sản khi còn phòng chưa lưu trữ.
4. Diện tích/giá thuê không âm; sức chứa nguyên >=1. Không giảm sức chứa dưới số người đang ở. Không chuyển phòng sang bất động sản khác bằng update hiện tại.
5. Không tạm ngừng/lưu trữ phòng đang có người ở. Ghi nhận trả phòng trước.
6. Nhận phòng nhiều người phải trong một transaction, khóa/kiểm tra sức chứa để tránh hai request đồng thời vượt capacity. Tất cả thành công hoặc tất cả thất bại. Một người chỉ có một occupancy active.
7. Ngày nhận/trả hợp lệ `YYYY-MM-DD`, không ở tương lai; trả không trước ngày nhận. Backend nên dùng múi giờ tổ chức thay đồng hồ thiết bị. Nếu người đại diện trả phòng, chọn người active còn lại làm đại diện.
8. Tiện ích gán vào phòng phải active, thuộc tổ chức và cùng tiền tệ với bất động sản. `chargeOnce=true` thì `inputUnit=null`; ngược lại cần đơn vị tính.
9. Giá tiện ích không âm; VND/JPY/KRW không có phần lẻ, các tiền tệ khác theo store hiện tại tối đa hai chữ số thập phân. Không dùng số thực thiếu chính xác để tính tổng tiền ở backend.
10. Lưu trữ tiện ích gỡ ID khỏi các phòng và ghi lịch sử thay đổi. Cập nhật giá/tiện ích/phòng và nhận/trả phòng phải ghi lịch sử server trong cùng transaction.
11. Lịch sử local hiện chứa summary/field label dạng text. Khi làm backend nên lưu event code và dữ liệu có cấu trúc để Việt/Anh dịch ở client; nếu giữ DTO hiện tại cần thống nhất migration/adapter, tránh lưu số tiền chỉ còn chuỗi đã định dạng.
12. Amenities là đặc tính vật lý (`string[]`); utilities là danh mục khoản thu (`utilityIds`). Hai loại này khác nhau.

## 6. Lỗi và thứ tự triển khai

Hiện client chưa có schema lỗi chung. Social chỉ hiện lỗi an toàn, không hiển thị nguyên response/SDK error; email login có thể hiện message của axios. Đề xuất backend dùng:

```json
{"code":"UNIT_CAPACITY_EXCEEDED","message":"Phòng không đủ chỗ","fieldErrors":{},"requestId":"trace-id"}
```

400 validation; 401 phiên/credential không hợp lệ; 403 không có quyền; 404 không tìm thấy; 409 xung đột nghiệp vụ; 429 giới hạn tần suất; 5xx lỗi máy chủ. Để hiển thị lỗi nghiệp vụ Việt/Anh theo `code`, cần thêm mapping ở client khi nối API mới.

Ưu tiên: (1) bốn API phiên cơ bản, (2) ba API Google/Apple, (3) organization/properties/units/residents/utilities/occupancies/history, (4) hồ sơ, đổi mật khẩu, xóa tài khoản, preferences. Hóa đơn, hợp đồng, thanh toán, push, subscription là giai đoạn sau; source chưa có client API cho các phần đó.

## 7. File nguồn để đối chiếu

- `packages/shared/src/api/routes.ts`: route phiên cơ bản và tasks.
- `packages/shared/src/api/app-api.ts`, `schemas/auth.schema.ts`: request/response adapter.
- `apps/mobile/src/services/api.ts`: bearer, refresh và demo switch.
- `apps/mobile/src/features/auth/services/session.ts`: email, restore, logout, đăng ký demo.
- `apps/mobile/src/features/auth/services/social-config.ts`, `social-api.ts`, `social-native.ts`, `social-session.ts`: Google/Apple.
- `apps/mobile/src/features/rentals/store/rental.store.ts`: toàn bộ CRUD/nghiệp vụ local.
- `apps/mobile/src/features/settings/services/account-service.ts`: tài khoản/xóa dữ liệu demo.
- `apps/mobile/src/features/settings/store/preferences.store.ts`: tùy chọn local.
- Privacy/terms/support là URL `.env` mở bằng trình duyệt/email, không phải JSON API.
