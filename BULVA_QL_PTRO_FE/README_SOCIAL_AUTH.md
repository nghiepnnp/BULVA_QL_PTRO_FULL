# Đăng nhập Google / Apple trên mobile

Đã tích hợp Google native trên iOS/Android và Apple native trên iOS. Hai nút có trên màn đăng nhập và đăng ký; Apple dùng nút hệ thống trên iOS khả dụng, tự dịch theo ngôn ngữ thiết bị. Nhãn còn lại theo ngôn ngữ của app. Web chỉ xem trước giao diện, không chạy OAuth; Android không hiển thị Apple. Email demo hiện tại vẫn hoạt động.

## Cấu hình

Trong `apps/mobile/.env` và `.env.example` có các giá trị mẫu:

```dotenv
EXPO_PUBLIC_SOCIAL_AUTH_ENABLED=false
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=replace-me.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=replace-me.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_AUTH_PATH=/auth/google
EXPO_PUBLIC_APPLE_AUTH_PATH=/auth/apple
EXPO_PUBLIC_APPLE_CHALLENGE_PATH=/auth/apple/challenge
```

Giữ `EXPO_PUBLIC_DEMO_MODE=true` và cờ social `false` cho đến khi có OAuth và API thật. Nút vẫn hiển thị để xem bố cục; bấm sẽ báo chưa được bật, không tạo phiên giả. Sau khi cấu hình đầy đủ, đặt `EXPO_PUBLIC_DEMO_MODE=false`, `EXPO_PUBLIC_SOCIAL_AUTH_ENABLED=true`, và `EXPO_PUBLIC_API_URL` là địa chỉ HTTPS của API. Nếu API URL có tiền tố `/api` hoặc `/v1`, các path ở trên nối vào tiền tố đó.

Google:
- Tạo OAuth Client loại Web để máy chủ xác minh ID token; điền vào `GOOGLE_WEB_CLIENT_ID` (không phải Android Client ID).
- Tạo OAuth Client iOS khớp bundle identifier trong `app.json`, điền `GOOGLE_IOS_CLIENT_ID`. `app.config.js` tự đảo Client ID thành iOS URL scheme và bật config plugin khi ID hợp lệ.
- Tạo OAuth Client Android với package name và SHA-1 của chứng chỉ ký development/release. Android không cần Client ID riêng trong JS.
- Nếu đổi package/bundle ID khỏi `com.example.rentalos.owner`, cập nhật đồng thời trong Google/Apple Console.

Apple:
- Bật Sign in with Apple cho App ID trùng `ios.bundleIdentifier` trong Apple Developer, cập nhật provisioning profile.
- `usesAppleSignIn`, plugin `expo-apple-authentication` và khả năng bản địa hóa nút đã được thêm.
- Native iOS dùng bundle identifier, không cần Apple Services ID trong `.env`. Apple Team ID, Key ID, private key và client secret chỉ nằm trên máy chủ.

Không đưa bất kỳ client secret/private key nào vào `EXPO_PUBLIC_*`.

## Hợp đồng API cần triển khai ở máy chủ

Repo này chưa có máy chủ phát hành phiên thật cho mobile. Đây là hợp đồng để nối backend, **không phải endpoint đã tồn tại**. App không xác minh JWT bằng cách chỉ decode hoặc tin email do SDK trả về.

### POST `/auth/google`

Request: `{ "idToken": "<Google ID token>" }`.

Máy chủ xác minh chữ ký bằng SDK/JWKS Google, issuer, audience đúng Web Client ID, expiration và các điều kiện xác thực cần thiết. Dùng `(issuer, sub)` để nhận diện tài khoản; không tự liên kết tài khoản mật khẩu chỉ vì email giống nhau. Chỉ sau xác thực mới tạo/tìm tài khoản và phát hành token riêng của ứng dụng.

### POST `/auth/apple/challenge`

Trả `{ "challengeId": "<opaque id>", "nonce": "<random nonce, at least 16 characters>" }`. Máy chủ tạo nonce ngẫu nhiên đủ mạnh, giữ ánh xạ, TTL ngắn và chỉ cho sử dụng một lần. App truyền nonce **nguyên văn** vào Apple SDK, kèm state ngẫu nhiên riêng để kiểm tra kết quả quay lại.

### POST `/auth/apple`

Request:

```json
{
  "idToken": "<Apple identity token>",
  "authorizationCode": "<Apple authorization code>",
  "challengeId": "<id from challenge endpoint>",
  "fullName": { "givenName": "Optional", "familyName": "Optional" }
}
```

`fullName` có thể không có/null ở lần đăng nhập sau; không dùng nó làm căn cứ xác thực. Máy chủ xác minh JWT Apple (chữ ký, issuer, audience=bundle identifier, expiration, nonce đúng challenge), tiêu thụ challenge một lần và đổi authorization code phía máy chủ. Lưu tên khi lần đầu được cấp; lần sau đọc hồ sơ đã lưu. Xử lý email relay/ẩn email, không ép lấy lại email cá nhân. Lưu thông tin cần thiết để thu hồi quyền Apple khi xóa tài khoản thật.

### Response chung khi thành công

```json
{
  "accessToken": "<application access token>",
  "refreshToken": "<application refresh token>",
  "user": { "id": "user-id", "email": "verified-or-relay@example.com", "name": "Display name" }
}
```

App kiểm tra schema response, lưu refresh token bằng SecureStore rồi mới bật phiên. Không lưu Google/Apple identity token vào bộ nhớ lâu dài. API `/auth/me`, `/auth/refresh`, `/auth/logout` cần tương thích với adapter hiện có (`packages/shared/src/api/routes.ts`). Không dùng web localStorage để triển khai đăng nhập thật: web OAuth cần luồng riêng với cookie HttpOnly.

Đổi mật khẩu, xóa tài khoản thật, thu hồi token và đăng ký email phía máy chủ vẫn thuộc phần backend chưa có sẵn. Các guard hiện tại không báo xóa tài khoản server thành công khi chỉ xóa dữ liệu local.

## Build và kiểm tra

Giữ Corepack pnpm **12.11.2**. Khi đã có ID hợp lệ, cần build native lại; cập nhật JS hoặc chạy Expo Go không đủ cho Google:

```sh
corepack pnpm --filter @starter/mobile exec expo run:ios
corepack pnpm --filter @starter/mobile exec expo run:android
```

Chạy các lệnh này ở máy có Xcode/Android SDK và cấu hình ký phù hợp. Có thể dùng EAS development build thay thế. Chưa thử đăng nhập tài khoản Google/Apple thật vì chưa có OAuth, backend và bản native đã ký. Kiểm tra hiện tại: TypeScript, test giả lập SDK/API/storage, Expo dependency check, bundle iOS/Android/web và bố cục web mobile.

```sh
corepack pnpm typecheck
corepack pnpm test:mobile-auth
corepack pnpm test:mobile-i18n
corepack pnpm test:mobile-settings
corepack pnpm check:source
corepack pnpm check:expo
```

Tài liệu chính thức:
- https://docs.expo.dev/guides/google-authentication/
- https://react-native-google-signin.github.io/docs/setting-up/expo
- https://docs.expo.dev/versions/latest/sdk/apple-authentication/
- https://developers.google.com/identity/sign-in/web/backend-auth

Biểu tượng Google: https://developers.google.com/identity/images/g-logo.png (tài sản thương hiệu Google, dùng cho nút đăng nhập).
