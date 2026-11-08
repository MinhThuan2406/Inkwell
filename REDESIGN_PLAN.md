# Kế hoạch & Kiến trúc Redesign Toàn diện Inkwell (Master Plan)

> **Tôn chỉ cốt lõi**: Giữ trọn sự tĩnh lặng, ma mị và riêng tư của trải nghiệm thư viết tay 3D; loại bỏ triệt để tư duy "SaaS hóa"; giải quyết bài toán kỹ thuật 3D từ gốc rễ; bảo đảm 100% tính tương thích ngược cho dữ liệu cũ; xử lý triệt để 4 bẫy kỹ thuật ngầm về Canvas Texture, Web Font, Touch Mobile và iOS Safari Viewport.

---

## I. Ma trận Giải pháp 6 Vấn đề Kiến trúc Cốt lõi

| Hạng mục | Vấn đề ban đầu | Giải pháp kỹ thuật thực thi | Trạng thái |
| :--- | :--- | :--- | :---: |
| **1. Kỹ thuật 3D** | Thay thế bề mặt cục bộ, kẹt trong bundle minified | Intercept Canvas Textures (Module 97871 & 21100), patch chuỗi tem thư, tiêm monogram sáp | ⏳ Chưa bắt đầu |
| **2. Bố cục Trang chủ** | Web SaaS cuộn nhiều block (Hero, Feature, Pricing) làm mất tính ma mị | Immersive Stage + Spatial Desk Scrollytelling (bàn viết tĩnh lặng làm trung tâm) | ⏳ Chưa bắt đầu |
| **3. Trải nghiệm Studio** | Wizard 6 bước tuyến tính (ép Next/Back ngắt mạch viết) | Atelier Desk tự do: Tờ giấy & nét bút luôn ở trung tâm, khay dụng cụ mở ở cạnh | ⏳ Chưa bắt đầu |
| **4. Monogram con dấu 3D** | Nét mảnh & giọt mực rời dễ vỡ hình, răng cưa mobile | The Intaglio Serif "I": Khắc chìm trong gờ tròn dập nổi, bắt specular shadow sắc nét | ⏳ Chưa bắt đầu |
| **5. Lộ trình thực hiện** | 10–12 ngày (quá lạc quan) | 3–4 tuần thực tế với các mốc kiểm thử WebGL/Safari iOS rõ ràng | ⏳ Chưa bắt đầu |
| **6. Dữ liệu tương thích** | Đổi tên thẳng tay gây vỡ font thư cũ và mất phiên | Font Alias layer cho `dear-*` và Dual-Read Cookie (`inkwell_owner ?? dear_owner`) | ⏳ Chưa bắt đầu |

---

## II. Quy chuẩn Xử lý 4 Bẫy Kỹ thuật Ngầm (Technical Execution Protocols)

### 1. Cơ chế can thiệp Module 97871 & Bundle (Hybrid Patch & Proxy)
- **Chuỗi tĩnh**: Thực hiện patch trực tiếp trong `src/lib/ddear-bundle.js` đổi `"DEAR · POST"` $\rightarrow$ `"INKWELL · ATELIER"` trên tem thư 3D.
- **Hàm vẽ con dấu**: Intercept và inject thuật toán vẽ **The Intaglio Serif "I"** (vector path dập nổi/khắc chìm) thông qua `src/lib/ddear-runtime.ts` trước khi Three.js khởi tạo texture.

### 2. Giao thức Khắc phục Race Condition: Web Font vs Canvas 2D Texture
- **Vấn đề**: Canvas 2D vẽ bằng `ctx.fillText()`. Nếu texture nướng (bake) lên GPU trước khi file font nạp xong, Three.js sẽ vẽ font fallback (Arial/Times) và lưu vĩnh viễn trên GPU cache.
- **Giải pháp**:
  - Tạo `src/lib/font-guard.ts` với hàm `ensureFontsReady()`.
  - Chờ `await document.fonts.ready` trước khi bake CanvasTexture lần đầu.
  - Tự động gọi `texture.needsUpdate = true` khi `document.fonts.onloadingdone` kích hoạt.

### 3. Phân giải Xung đột Touch Gesture trên Mobile (Scrollytelling vs OrbitControls)
- **Vấn đề**: Vuốt ngón tay gây xung đột giữa cuộn trang Scrollytelling và xoay phong bì 3D.
- **Giải pháp**:
  - Gán `touch-action: pan-y` trên khung trang cho cử chỉ cuộn dọc tự nhiên.
  - Khóa xoay tự do theo trục dọc ở chế độ cuộn trang; chỉ cho phép xoay nhẹ trục ngang ($\pm 15^\circ$) hoặc khi người dùng kích hoạt nút *"Chạm để ngắm phong bì"*.

### 4. Ổn định Viewport trên Safari iOS (Chống Stutter do Thanh Địa chỉ Co giãn)
- **Vấn đề**: URL bar co giãn làm thay đổi `window.innerHeight` liên tục, gây giật ma trận chiếu của Three.js.
- **Giải pháp**:
  - Áp dụng triệt để `100dvh` / `100svh`.
  - Khóa cơ chế tính lại camera: Chỉ cập nhật `projectionMatrix` khi `window.innerWidth` thay đổi đáng kể (>10px), bỏ qua dao động chiều dọc.

---

## III. Thiết kế Nhận diện Thương hiệu & Monogram Con dấu

```
       ╭─────────────────────────────╮
     ╭─╯                             ╰─╮
    │          . - ~ ~ ~ - .            │  ← Viền mép sáp chảy tự nhiên
   │       .-'   ┌─────────┐ ' -.        │
   │     .'    ──┴─────────┴──   '.      │  ← Gờ nổi tròn chắn mép (Bezel ring)
  │     /          │     │         \      │
  │    │           │     │          │     │  ← Chữ I chân Serif đậm (Roman Bold)
  │    │           │     │          │     │     Khắc chìm dứt khoát (-1.2mm depth)
  │     \          │     │         /      │
   │     '.    ──┬─────────┬──   .'       │  ← Mặt phẳng đáy nhám bắt sáng
   │       '-.   └─────────┘ .-'         │
    │          ' - . _ . - '            │
     ╰─╮                             ╭─╯
       ╰─────────────────────────────╯
```

- **Emblem**: Monogram **The Intaglio Serif "I"** khắc chìm trong khối sáp, có gờ nổi tròn bao quanh.
- **Wordmark**: `I N K W E L L` với typography Serif hiện đại, độ tương phản nét thanh - nét đậm cao.
- **Bảng màu Atelier**:
  - `--wall: #f8f6f0` (Washi Parchment - Giấy dó/cotton ấm)
  - `--card: #ffffff` (Pure Cotton Paper)
  - `--well: #f0ede4` (Desk Inset)
  - `--ink: #111317` (Sumi Carbon - Mực Tàu đen sâu)
  - `--mute: #63615a` (Graphite Mute)
  - `--rule: #e4e0d5` (Laid Paper Deckle)
  - `--dot / --accent: #b93226` (Cinnabar Vermilion - Đỏ chu sa truyền thống cho triện sáp)
  - `--indigo: #1d2c44` (Prussian Ultramarine)
  - `--gold: #c5a059` (Gilding Leaf)

---

## IV. Trải nghiệm Người dùng: Bàn Viết Tĩnh Lặng & Atelier Desk

### 1. Trang chủ: The Solitary Writing Desk
- Không dùng bố cục SaaS phẳng với danh thiếp thẻ hay tiếp thị dịch vụ.
- Phong bì 3D nằm đơn độc trên mặt bàn gỗ dưới ánh đèn ấm áp.
- Dẫn dắt bằng chuyển động camera 3D (Spatial Scrollytelling):
  - *Cận cảnh 1*: Chi tiết chất giấy và con dấu sáp đỏ dập nổi chữ I.
  - *Cận cảnh 2*: Mở ngăn kéo bưu thiếp với các mẫu phong bì đặc trưng.
  - *Cận cảnh 3*: Biểu tượng đồng hồ cát / mật mã kín đáo.

### 2. Studio: Atelier Desk phi tuyến tính
- Tờ giấy và ngòi bút luôn ở vị trí trung tâm, cho phép viết ngay lập tức.
- Khay dụng cụ mở (Stationery Drawer/Tabs) ở cạnh bên: Giấy, Bút, Sáp, Kỷ vật/Âm thanh, Bảo mật/Gửi.
- Không có nút Next/Back gượng gạo dạng wizard form.

---

## V. Lộ trình Triển khai Chi tiết (4 Tuần)

### 📌 Tuần 1: Nền tảng Nhận diện, 3D Texture & Lớp Bảo vệ Tương thích
- [x] **1.1. Monogram Vector & Favicon**: Tạo `src/components/brand/InkwellMonogram.tsx` và cập nhật `src/app/icon.svg` với con dấu chữ I intaglio.
- [x] **1.2. Brand Wordmark**: Xây dựng component `src/components/brand/InkwellWordmark.tsx`.
- [x] **1.3. Patch chuỗi 3D tem thư**: Patch `"DEAR · POST"` $\rightarrow$ `"INKWELL · ATELIER"` trong `src/lib/ddear-bundle.js`.
- [x] **1.4. Intercept hàm vẽ con dấu 3D**: Cập nhật `src/lib/ddear-runtime.ts` để nạp hàm vẽ Monogram chữ I intaglio lên CanvasTexture của Three.js.
- [x] **1.5. Font Guard**: Xây dựng `src/lib/font-guard.ts` chống race condition khi nướng texture.
- [x] **1.6. Font Alias Layer**: Bổ sung ánh xạ alias trong `src/app/globals.css` bảo đảm thư cũ lưu `dear-*` không bị lỗi font.
- [x] **1.7. Cookie Migration**: Bổ sung cơ chế Dual-Read `inkwell_owner ?? dear_owner` trong `src/lib/server-security.ts`.
- [x] **1.8. Design Tokens**: Cập nhật hệ biến CSS `--wall`, `--ink`, `--dot`, `--accent` theo bảng màu Washi Parchment & Sumi Carbon.
- [x] **1.9. Kiểm tra**: Chạy `npm run typecheck`, kiểm tra link thư cũ hoạt động hoàn hảo.

### 📌 Tuần 2: Trang chủ Immersive Stage & Spatial Scrollytelling
- [x] **2.1. Refactor Shell Trang chủ**: Tách `src/app/page.tsx` thành Next.js App Router component độc lập.
- [x] **2.2. Header tinh gọn**: Wordmark Inkwell mới, bộ chuyển ngôn ngữ tối giản, nút Hộp thư của tôi.
- [x] **2.3. Sân khấu 3D tĩnh lặng**: Đặt phong bì 3D ở trung tâm mặt bàn gỗ với ánh sáng đèn hắt ấm.
- [x] **2.4. Scrollytelling Camera**: Thiết lập tương tác cuộn chuyển góc camera 3D ngắm chi tiết giấy/sáp/ngăn kéo mẫu.
- [x] **2.5. Touch & Viewport Guard**: Áp dụng `touch-action: pan-y` và khóa resize theo chiều ngang chống giật trên iOS Safari.

### 📌 Tuần 3: Atelier Studio Tự Do (Non-linear Writing Desk)
- [x] **3.1. Tái cấu trúc Bố cục Studio `/create`**: Tách rời layout 3 cột cũ, đưa tờ giấy viết và ngòi bút vào vị trí trung tâm cố định.
- [x] **3.2. Khay dụng cụ dạng ngăn kéo (Stationery Drawer/Tabs)**: Thiết kế các tab công cụ (Giấy, Nét bút, Sáp niêm, Âm thanh, Mật mã) không ép tuần tự, loại bỏ số bước tuần tự gượng gạo.
- [x] **3.3. Tối ưu tương tác chữ viết**: Bổ sung bộ đếm ký tự `tabular-nums`, cải thiện độ tương phản và cảm giác gõ phím.
- [x] **3.4. Responsive Mobile Drawer**: Dựng khay công cụ trượt từ dưới lên trên màn hình điện thoại mượt mà không che khuất trang giấy.

### 📌 Tuần 4: Trình Đọc Thư, Hộp Thư Cá Nhân & Tối Ưu Safari/Mobile 60fps
- [x] **4.1. Trình đọc thư `/l/[id]`**: Nâng cấp nghi thức mở thư (Unsealing ritual), hiệu ứng bẻ sáp chữ I giòn tan, chế độ đọc toàn màn hình chuẩn WCAG AA.
- [x] **4.2. Hộp thư cá nhân `/letters`**: Chuyển đổi sang giao diện Ngăn kéo bưu thiếp lưu trữ bản nháp và thư đã niêm phong.
- [x] **4.3. Audit WebGL 60fps & Safari iOS**: Kiểm tra toàn diện hiệu năng khung hình trên thiết bị di động, loại bỏ mọi rò rỉ bộ nhớ texture và chống giật address bar.
- [x] **4.4. Nghiệm thu 20 nguyên tắc Anti-AI-Slop**: Đảm bảo 100% tuân thủ tiêu chuẩn chất lượng của `AGENTS.md`.
- [x] **4.5. Final Typecheck & Build**: Xác nhận `npm run build` và `npm run typecheck` đạt 0 lỗi, sẵn sàng triển khai.

