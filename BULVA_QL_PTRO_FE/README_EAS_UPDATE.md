# EAS Update — hướng dẫn OTA cho BULVA mobile

Cập nhật: 17/10/2026. Áp dụng cho `apps/mobile`, package `@bulva_dev/mobile`, Expo SDK 57. Không áp dụng cho Next.js web.

## Đã tích hợp

- `expo-updates` theo phiên bản tương thích Expo; EAS CLI 25.0.0 ghim ở devDependencies của workspace root.
- Corepack/pnpm giữ **12.11.2**, kể cả profile build trên EAS.
- `apps/mobile/eas.json`: `preview` để thử nội bộ, `production` để phát hành. Mỗi profile dùng channel và EAS environment cùng tên.
- `runtimeVersion: { policy: "appVersion" }`: runtime theo `expo.version` trong `apps/mobile/app.json`.
- Kiểm tra update khi khởi động (`ON_LOAD`), không chờ tải xong trước khi mở app (`fallbackToCacheTimeout: 0`). Bản tải được áp dụng vào lần khởi động sau; không ép reload giữa lúc nhập liệu.
- Có script kiểm tra và liên kết Project ID. Chưa liên kết thì OTA bị tắt, nhưng chạy local/Expo Go vẫn được. Build/update qua script sẽ dừng và báo thiếu liên kết.
- Cấu hình Google URL scheme, Apple Sign In và các plugin hiện có được giữ nguyên.

**Hiện chưa có EAS Project ID. Chưa tạo cloud build, ký IPA/APK hoặc phát hành bản OTA nào.** Bundle/export local không đồng nghĩa đã kiểm thử nhận OTA trên thiết bị.

## 1. Chuẩn bị lần đầu

Chạy các lệnh từ **thư mục gốc `BULVA_QL_PTRO_FE`**, trừ những chỗ ghi rõ khác:

```sh
corepack pnpm --version
# Cần hiển thị 12.11.2
corepack pnpm install --frozen-lockfile
corepack pnpm --filter @bulva_dev/mobile exec eas login
corepack pnpm --filter @bulva_dev/mobile exec eas whoami
```

Dùng tài khoản Expo có quyền với dự án. Không đặt mật khẩu, token Expo hoặc khóa ký trong `.env` của mobile hay `EXPO_PUBLIC_*`.

### Tạo/liên kết dự án Expo

Chạy:

```sh
corepack pnpm --filter @bulva_dev/mobile exec eas project:init
```

Chọn đúng tài khoản/organization và tạo hoặc chọn project tương ứng với slug `rentalos-owner`. Source folder/package đã đổi tên nhưng `expo.name`/`slug` đang giữ RentalOS; đây là hai loại tên khác nhau. Nếu muốn đổi thương hiệu/slug, quyết định trước khi tạo project.

Do app dùng `app.config.js`, EAS có thể yêu cầu bạn tự ghi `extra.eas.projectId`. Lấy **Project ID dạng UUID** từ trang Settings của project trên Expo dashboard hoặc từ kết quả lệnh vừa chạy. Sau đó:

```sh
corepack pnpm ota:link PROJECT_UUID_THAT
corepack pnpm ota:check
corepack pnpm --filter @bulva_dev/mobile exec eas project:info
```

Thay `PROJECT_UUID_THAT` bằng UUID thật, không dùng chuỗi mẫu. `ota:link` chỉ ghi cấu hình local; `project:info` xác minh project tồn tại và tài khoản có quyền truy cập.

Script lưu `extra.eas.projectId` và `updates.url` vào `apps/mobile/app.json`. Project ID không phải bí mật, nên commit cấu hình để build và OTA cùng trỏ tới một project. **Không lưu Project ID riêng theo `.env`**, tránh hai môi trường vô tình trỏ sang hai dự án khác nhau. `app.config.js` tự bật OTA sau khi có ID hợp lệ. Không cần chạy `eas update:configure` thêm vì runtime/update URL/channel đã được chuẩn bị ở đây.

Nếu đã liên kết project khác, script sẽ không tự ghi đè. Kiểm tra chủ sở hữu, URL và các bản app đang phát hành trước khi chỉnh `app.json`.

## 2. Cấu hình môi trường trên EAS

Đây là phần riêng với channel:

| Profile build | Channel nhận OTA | EAS environment | Mục đích |
|---|---|---|---|
| `preview` | `preview` | `preview` | Bản release nội bộ; Android APK, iOS internal distribution |
| `production` | `production` | `production` | Bản phân phối store |

Tạo biến ở EAS dashboard → project → Environment variables. Đối chiếu `apps/mobile/.env.example`, cấu hình đủ biến cho **cả preview và production**:

- `EXPO_PUBLIC_API_URL`: URL phù hợp từng môi trường.
- `EXPO_PUBLIC_DEMO_MODE`, `EXPO_PUBLIC_SOCIAL_AUTH_ENABLED`.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
- Các path API Google/Apple.
- Privacy policy, terms, support URL/email và cờ placeholder links.

Các giá trị `EXPO_PUBLIC_*` nằm trong app đã phát hành và không phải bí mật. Để chúng ở visibility plaintext hoặc sensitive phù hợp; biến kiểu secret không đọc được ở máy phát hành OTA. Không đưa Apple private key, Google client secret hay backend secret vào đây.

**Expo SDK 57 yêu cầu `eas update --environment ...` và dùng biến từ EAS environment; `.env` local không thay thế các biến đó.** Script `ota:preview`/`ota:production` đã truyền đúng cờ. Biến chỉ đặt trong `build.<profile>.env` cũng không tự áp dụng cho EAS Update.

Đảm bảo giá trị dùng khi build và update tương ứng, đặc biệt Google iOS Client ID vì nó tạo URL scheme native. Đổi Client ID/scheme cần build mới. Cấu hình production với backend/OAuth thật khi dịch vụ sẵn sàng; nếu vẫn phát hành demo thì phải chủ động giữ cùng chế độ ở build và OTA.

## 3. Tạo bản cài đặt có OTA lần đầu

App đã cài từ trước khi thêm `expo-updates` không thể nhận OTA để tự thêm thư viện này. Phải build và cài bản native mới ít nhất một lần.

### Preview nội bộ

```sh
corepack pnpm build:preview --platform android
corepack pnpm build:preview --platform ios
```

Hoặc `--platform all`. Lệnh này tạo build trên EAS và có thể sử dụng quota build. Android trả APK cài nội bộ. iOS cần Apple Developer/signing và thiết bị được đăng ký cho internal distribution; làm theo lời nhắc EAS về credentials/device registration.

Preview là **release build nội bộ**, không phải Expo Go hoặc development-client. Cài trên điện thoại, mở app khi có mạng, rồi đóng và mở lại để thử nhận update.

### Production

```sh
corepack pnpm build:production --platform all
```

Profile production tăng build number/version code bằng version source remote. Việc này **không tự tăng `expo.version`/runtimeVersion**. Tự tăng `expo.version` khi có thay đổi native.

Trước khi tạo bản store, đổi `com.example.rentalos.owner` thành bundle/package ID bạn sở hữu nếu chưa làm; cập nhật OAuth và Apple App ID tương ứng. Đổi application ID là thay đổi native, cần build mới. Build thành công không tự upload/submit lên App Store hoặc Play Store.

## 4. Phát hành OTA hằng ngày

### Kiểm tra source

```sh
corepack pnpm typecheck
corepack pnpm check:source
corepack pnpm test:mobile-ota
corepack pnpm ota:check
```

Kiểm tra diff/commit hiện tại và chạy các test chức năng tương ứng. EAS Update đóng gói source đang có trên máy, kể cả thay đổi chưa commit; nên commit bản định phát hành để truy vết.

### Phát hành cho preview

```sh
corepack pnpm ota:preview --platform all --message "Sửa hiển thị danh sách phòng"
```

Lệnh này **thực sự upload và phát hành OTA** cho channel preview. Cài đúng preview build có cùng runtime, mở để tải, đóng rồi mở lại. Thử đăng nhập, nhập liệu, dữ liệu đã lưu, offline và cả Việt/Anh/sáng/tối khi thay đổi liên quan.

### Phát hành production

```sh
corepack pnpm ota:production --platform all --message "Sửa hiển thị danh sách phòng"
```

Dùng đúng commit đã kiểm tra. Lệnh build bundle lại với EAS environment production, nên API/biến môi trường có thể khác preview. Không republish nguyên preview sang production nếu preview đã nhúng API hoặc cấu hình thử nghiệm.

Có thể phát hành dần:

```sh
corepack pnpm ota:production --platform all --message "Sửa hiển thị phòng - 10%" --rollout-percentage 10
```

Theo dõi lỗi và quản lý tỷ lệ rollout trong EAS dashboard. Không coi rollout 10% là đã phát hành cho mọi người. Cần thử cả hai nền tảng nếu publish `all`.

Không đặt `--skip-bundler` trong quy trình bình thường vì dễ phát hành nhầm bundle cũ.

## 5. OTA được và không được thay gì?

| Thay đổi | Cách phát hành |
|---|---|
| Text Việt/Anh, style, logic JS/TS, ảnh/assets được bundle | Có thể OTA nếu runtime native không đổi |
| Thêm/nâng Expo SDK, React Native, module native | Tăng `expo.version`, build native mới |
| Plugin, permission, entitlements, URL scheme, cấu hình native OAuth | Tăng `expo.version`, build native mới |
| Bundle identifier/package name, icon/splash native | Build mới; xem lại runtime và cấu hình store |
| Chỉ tăng iOS buildNumber/Android versionCode | Không tự tạo runtime mới theo policy hiện tại |
| Backend API/schema | Deploy backend riêng; giữ tương thích các bản mobile còn sử dụng |
| Next.js web | Deploy web riêng, không dùng EAS Update native |

Ví dụ: app runtime `1.0.0` nhận update runtime `1.0.0` cùng nền tảng và channel. Khi thêm native SDK, đổi `expo.version` thành `1.1.0`, build mới và phát hành OTA tiếp theo cho runtime đó. Người chưa cài binary `1.1.0` không nhận OTA `1.1.0`.

Policy `appVersion` không tự phân tích dependency native. Người phát hành có trách nhiệm tăng version. Nếu sau này chuyển sang `fingerprint`, coi đó là thay đổi chiến lược runtime, tạo build mới và cập nhật quy trình.

## 6. Xem lịch sử và quay về bản ổn định

Xem các nhóm update:

```sh
corepack pnpm --filter @bulva_dev/mobile exec eas update:list --branch production
corepack pnpm --filter @bulva_dev/mobile exec eas update:view UPDATE_GROUP_ID
```

Mặc định lần publish đầu tạo/chọn branch theo channel. Nếu bạn đã đổi ánh xạ channel → branch, xem `eas channel:view production` rồi dùng đúng branch trong `update:list`.

### Đưa lại một OTA đã biết là ổn định

```sh
corepack pnpm --filter @bulva_dev/mobile exec eas update:republish --group GOOD_UPDATE_GROUP_ID --destination-channel production --message "Quay về bản ổn định"
```

Chọn group đúng runtime/nền tảng và môi trường production. Lệnh tạo update mới từ bundle cũ, không sửa code local. Nếu đang có rollout, xem trạng thái trước; CLI có thể yêu cầu kết thúc rollout đang chạy. Không thêm `--force-end-active-rollout` khi chưa xác định update bị ảnh hưởng.

### Quay về bundle đóng trong bản cài đặt

```sh
corepack pnpm --filter @bulva_dev/mobile exec eas update:roll-back-to-embedded --channel production --runtime-version 1.0.0 --platform all --message "Quay về bản đóng trong ứng dụng"
```

Thay `1.0.0` bằng runtime cần xử lý. Đây là chỉ thị rollback cho các bản hỗ trợ nó; cần mạng để nhận. Không đảm bảo mọi máy thay đổi ngay lập tức, đặc biệt máy offline/chưa khởi động lại. Không xóa update để thay cho rollback.

Rollback JS không khôi phục dữ liệu đã bị thay đổi hoặc đảo migration database. Migration dữ liệu local/server phải tương thích cả phiên bản mới lẫn phiên bản có thể rollback.

## 7. Khi app không nhận OTA

1. App có phải binary mới đã tích hợp `expo-updates` không? Expo Go không dùng luồng OTA production này.
2. `pnpm ota:check` có đúng Project ID và update URL không?
3. Bản build thuộc channel preview hay production? Update được publish tới channel/branch nào?
4. Runtime version và nền tảng có trùng không? Tăng app version mà chưa cài binary mới sẽ không nhận update đó.
5. Đã cấu hình đúng EAS environment chưa? `.env` local không được dùng thay cho environment khi publish SDK 57.
6. Có mạng không? Đã mở app để tải, sau đó đóng/mở lại chưa? Cấu hình hiện tại không ép reload ngay.
7. Xem update/build detail và lỗi trên EAS dashboard. Nếu bundle lỗi khi khởi động, cơ chế phục hồi có thể quay về bản trước; cần sửa hoặc rollback bản lỗi.

Có thể dùng `Updates.isEnabled`, `Updates.channel`, `Updates.runtimeVersion`, `Updates.updateId` từ `expo-updates` khi chẩn đoán trên native release build. Chưa thêm nút cập nhật thủ công hoặc cơ chế ép update vào Settings.

## 8. File và kiểm thử

- `apps/mobile/app.json`: app version, runtime policy, hành vi tải update và Project ID sau khi liên kết.
- `apps/mobile/app.config.js`: ghép cấu hình Google/Apple và OTA.
- `apps/mobile/config/eas-update.cjs`: kiểm tra ID/URL, bật/tắt OTA khi liên kết.
- `apps/mobile/eas.json`: profile/channel/environment, Corepack/pnpm.
- `apps/mobile/scripts/eas-project.cjs`: liên kết local và kiểm tra cấu hình.
- `tests/mobile-ota.test.cjs`: trạng thái chưa liên kết, URL/ID sai, cấu hình runtime và tách kênh.

`pnpm-workspace.yaml` từ chối riêng script cài đặt `dtrace-provider` (instrumentation tùy chọn) và `protobufjs` (thông báo version); không bật chạy mọi dependency script. EAS CLI ở root để dùng TypeScript phù hợp CLI, tách khỏi TypeScript mobile.

## Tài liệu chính thức

- Khởi tạo: https://docs.expo.dev/eas-update/getting-started/
- Runtime: https://docs.expo.dev/eas-update/runtime-versions/
- Environment: https://docs.expo.dev/eas/environment-variables/usage/
- Rollback: https://docs.expo.dev/eas-update/rollbacks/
- Lệnh CLI: https://docs.expo.dev/eas/cli/
