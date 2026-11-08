'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <main className="mine letter-gate">
          <section className="placard letter-unlock" style={{ textAlign: 'center' }}>
            <div className="letter-unlock-head">
              <h1>Đã xảy ra sự cố</h1>
              <p>Ứng dụng gặp sự cố không mong muốn. Vui lòng thử tải lại trang.</p>
            </div>
            <div className="actions" style={{ justifyContent: 'center', marginTop: 22 }}>
              <button type="button" className="btn" onClick={() => reset()}>
                Thử lại
              </button>
              <Link href="/" className="btn ghost">
                Về trang chủ
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}

