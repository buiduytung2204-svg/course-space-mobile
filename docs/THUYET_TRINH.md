# Kịch bản thuyết trình (6–8 phút)

1. Giới thiệu: app quản lý khóa học, React Native/Expo, MockAPI cung cấp REST backend.
2. Mở dashboard MockAPI: chỉ ra 2 resource, kiểu dữ liệu, 3 danh mục và ít nhất 10 khóa học; giải thích quan hệ categoryId → id.
3. Mở src/api.ts: GET courses và categories chạy song song khi tải; fetch gửi HTTP, response.ok kiểm tra mã trạng thái, response.json chuyển JSON thành dữ liệu. ID danh mục dùng để tìm tên từ API, không hardcode.
4. Chạy app trên điện thoại: danh sách ảnh, học phí, tìm tên, lọc danh mục, kéo tải lại. Mở chi tiết để minh họa GET /courses/{id}.
5. Thêm khóa học: nhập thiếu để thấy validation; nhập học phí âm; sau đó điền hợp lệ, chọn danh mục, URL ảnh xem trước và MP4. Giải thích POST body JSON và cập nhật state sau khi gọi API.
6. Sửa khóa học: đổi tên/học phí/danh mục, lưu, mở dashboard để chứng minh PUT đã cập nhật.
7. Phát trailer: video chạy trong app, có điều khiển và toàn màn hình. URL lưu String, không upload file media lên MockAPI.
8. Danh mục: thêm, sửa; thử xóa danh mục có khóa học để thấy bị chặn. Giải thích client GET courses mới nhất trước DELETE. Tạo danh mục trống rồi xóa để minh họa trường hợp hợp lệ.
9. Xóa khóa học thử nghiệm: hủy trước, sau đó xác nhận; kiểm tra backend và danh sách.
10. Tắt mạng/kết nối sai để minh họa lỗi, bật lại và tải lại. Kết thúc với cấu trúc source và hướng dẫn README.

Dùng dữ liệu thử do mình tạo để quay; tránh xóa dữ liệu bài cũ. Video cần được quay thực tế sau khi tạo đúng resource MockAPI.
