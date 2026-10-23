# Course Space — Quản lý khóa học

Ứng dụng React Native + Expo + TypeScript, giao diện tiếng Việt. Dữ liệu hoạt động lấy hoàn toàn từ MockAPI, không có danh sách giả thay thế khi API lỗi.

## Chạy ứng dụng

1. Cài Node.js LTS, chạy `npm install`.
2. Sao ch?p `.env.example` th?nh `.env` (PowerShell: `Copy-Item .env.example .env`). URL MockAPI c?a b?i ?? ???c ?i?n trong file m?u; c? th? ??i sang project ri?ng.
3. Chạy `npm start`, mở bằng Expo Go phù hợp SDK của project hoặc Android emulator. Máy tính và điện thoại cùng mạng Wi-Fi. Có thể dùng `npm run web` để xem trên trình duyệt.
4. Sau khi đổi `.env`, dừng rồi chạy `npx expo start --clear`.

## Thiết lập MockAPI (bắt buộc)

URL hiện cấu hình: https://6adb0a8a7512f497b3006162.mockapi.io

Lúc kiểm tra, GET `/courses`, `/categories`, `/api/v1/courses`, `/api/v1/categories` đều trả 404. Bạn cần mở dashboard MockAPI, tạo resource hoặc lấy đúng endpoint. Source code không thể tự tạo resource qua REST endpoint dữ liệu.

- `categories`: `id` (Object ID tự sinh), `name` (String), `description` (String).
- `courses`: `id` (Object ID tự sinh), `title`, `description`, `categoryId`, `instructor`, `thumbnail`, `trailerUrl`, `createdAt` (đều String); `price`, `duration` (Number).
- Không tạo courses thành resource con của categories. Hai resource độc lập, liên kết bằng categoryId.
- Xóa dữ liệu Faker tự sinh trong HAI RESOURCE MỚI nếu dashboard tạo sẵn; không xóa dữ liệu bài cũ.
- Hai ứng dụng được dùng chung project. Nếu dùng cùng resource, thao tác sửa/xóa sẽ ảnh hưởng cả hai. Nếu project không cho thêm resource do giới hạn tài khoản, dùng project khác và sửa `.env`.
- Với hai resource trống, chạy `node scripts/seed.mjs` để nạp 3 danh mục và 10 khóa học. Script dừng nếu có sẵn dữ liệu, không tự ghi đè. Nếu mạng lỗi giữa lúc nạp, kiểm tra dữ liệu đã tạo trước khi chạy lại.
- Script dùng ID trả về từ POST categories để liên kết, không giả định ID là 1/2/3. Ảnh và video mẫu dùng URL thật. Video mẫu minh họa khả năng phát, không phải nội dung giảng dạy.

## Chức năng

- Danh sách khóa học: ảnh URL, tên, giảng viên, tên danh mục từ API, học phí VNĐ; tìm theo tên, lọc theo danh mục, kéo để tải lại.
- Chi tiết: GET theo ID, đầy đủ thông tin, phát trailer trong ứng dụng bằng expo-video; sửa và xác nhận xóa.
- Form thêm/sửa: dropdown danh mục API, xem trước ảnh, kiểm tra dữ liệu, POST/PUT, tải lại danh sách sau khi lưu.
- Danh mục: GET/POST/PUT/DELETE, xác nhận xóa. Kiểm tra lại toàn bộ courses từ backend trước khi xóa danh mục để chặn danh mục đang được sử dụng.
- Có loading, lỗi HTTP/timeout, danh sách rỗng, ảnh dự phòng và lỗi phát video.
- MockAPI không có giao dịch/khóa ngoại: việc kiểm tra ở ứng dụng không thể đảm bảo chống thay đổi đồng thời từ ứng dụng khác.

## Cấu trúc

- `App.tsx`: 4 màn hình và component giao diện.
- `src/api.ts`: REST client, timeout 15 giây, xử lý HTTP và ràng buộc xóa danh mục.
- `src/models.ts`: kiểu dữ liệu và kiểm tra form.
- `scripts/seed.mjs`: nạp dữ liệu mẫu lên API thật (chỉ chạy khi resource trống).
- `docs/THUYET_TRINH.md`: kịch bản quay video nộp bài.

## Kiểm tra và đóng gói

`npx tsc --noEmit` kiểm tra TypeScript. `npm test` chạy kiểm tra API và validation. `npx expo export --platform android` kiểm tra đóng gói JavaScript Android; đây không phải file APK. Muốn tạo APK cần Android SDK hoặc EAS Build, tài khoản và cấu hình build tương ứng.

Chưa có video quay thao tác trên thiết bị hoặc APK trong sản phẩm này. Chỉ quay khi endpoint đã hoạt động để minh họa dữ liệu thật.

## Kết quả kiểm tra

- Lint, TypeScript, 2 nhóm test API/validation và export bundle Android/Web đã chạy thành công.
- Chưa kiểm thử tương tác trên thiết bị, CRUD với backend thật hoặc phát trailer thực tế vì endpoint hiện chưa hoạt động.
- `npm audit` báo các cảnh báo mức high trong chuỗi công cụ Expo/Metro và dependency liên quan. Chưa áp dụng `--force` vì gợi ý có thể hạ SDK và phá tương thích. Cần rà soát trước khi phát hành production.
- Project dùng Expo SDK 58 theo template đã tạo. Nếu Expo Go trên điện thoại chưa hỗ trợ SDK 58, dùng bản Expo Go tương thích hoặc development build; không mặc định mọi phiên bản Expo Go đều mở được.
- Điều hướng bằng Expo Router trong `src/app/`, trạng thái dùng chung qua CourseProvider trong `App.tsx`.

## Video demo

[Video thuy?t tr?nh v? thao t?c ?ng d?ng](videos/demo-course-space.mp4) (kho?ng 82 MiB). N?u GitHub kh?ng ph?t tr?c ti?p, ch?n **View raw** ho?c t?i video v? m?y.
