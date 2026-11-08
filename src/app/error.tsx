'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
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
    <main className="mine letter-gate">
      <section className="placard letter-unlock" style={{ textAlign: 'center' }}>
        <div className="letter-unlock-head">
          <h1>Đã xảy ra lỗi</h1>
          <p>Không thể tải trang này. Bạn có thể thử tải lại hoặc quay về trang chủ.</p>
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
  );
}

