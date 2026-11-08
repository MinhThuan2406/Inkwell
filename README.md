# Inkwell

Ứng dụng viết thư tay 3D (Next.js 15, React 19, Three.js) và chia sẻ bằng một đường link.

## Chạy dự án

```bash
npm ci
npm run dev
npm run typecheck
npm run build && npm start
```

Yêu cầu Node.js 20 trở lên.

## Lưu trữ dữ liệu

- Thư và bản nháp được ghi vào `.data/letters.json`.
- Ảnh và âm thanh tải lên được ghi vào `public/media/`.
- Cả hai thư mục đều nằm trong `.gitignore`.
- Cần ổ đĩa ghi được và bền vững (VPS, Docker volume). Nền tảng serverless có hệ thống file tạm thời sẽ làm mất dữ liệu.
- File trong `public/media/` được thêm sau khi build có thể không được `next start` phục vụ. Kiểm tra trước khi triển khai.

## Biến môi trường

Dự án hiện không dùng biến môi trường nhạy cảm nào và hoạt động mặc định không cần cấu hình. Mẫu cấu hình an toàn được cung cấp tại `.env.example`. Không commit bất kỳ file `.env*` cục bộ nào vào Git.

## Các biện pháp bảo mật trong mã nguồn

- Mật khẩu thư được băm bằng scrypt, so sánh bằng `timingSafeEqual`, không bao giờ trả về qua API.
- Cookie mở khóa thư là chữ ký HMAC gắn với từng thư, không thể tự tạo.
- Giới hạn 5 lần nhập sai mỗi 15 phút theo cặp IP và thư. Bộ đếm nằm trong bộ nhớ tiến trình nên mất khi khởi động lại và không chia sẻ giữa nhiều instance.
- Phân quyền sở hữu bản nháp (Owner Isolation): Chỉ người tạo (cookie `dear_owner`, httpOnly) mới có quyền chỉnh sửa (`PUT`) hoặc xóa (`DELETE`) bản nháp. Chống tình trạng chuyển quyền sở hữu trái phép bản nháp của người khác.
- Danh sách thư và bản nháp chỉ trả về bản ghi thuộc trình duyệt tạo ra chúng; không lộ thông tin báo cáo vi phạm nội bộ (`reports`) ra API công khai.
- Mã thư sinh bằng bộ sinh ngẫu nhiên mật mã học và được kiểm tra định dạng ở mọi route (`isValidId`).
- Upload kiểm tra tên file theo mẫu cố định, giới hạn 8 MB, không ghi đè file có sẵn. Thư mục `/media` trả về `Content-Security-Policy` dạng sandbox.
- Chống open redirect ở `/auth/login`.
- Header bảo mật toàn site: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- CI tự động kiểm tra typecheck, build, quét file nhạy cảm/secrets và chạy `npm audit`. CodeQL và Dependabot chạy theo lịch.

## Thiết lập thủ công trên GitHub

Các mục sau nằm trong Settings của repository, không thể cấu hình bằng mã nguồn:

1. Security > Code security: bật Dependency graph, Dependabot alerts, Secret scanning và Push protection.
2. Branch protection cho `main`: yêu cầu pull request, yêu cầu check `CI` và `CodeQL` đạt, chặn force push và xóa nhánh.
3. Settings > Actions > General: đặt quyền mặc định của `GITHUB_TOKEN` là Read repository contents.
4. CodeQL trên repository private cần GitHub Advanced Security. Repository public dùng miễn phí.
