import LeftSideBar from '@/ui/layout/LeftSideBar';
import TopBar from '@/ui/layout/TopBar';
import React from 'react';

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <main className='flex min-h-screen text-gray-1'>
          <LeftSideBar />
          <div className='flex-1 lg:ml-64 flex flex-col'>
            <TopBar />
            <div className='flex-1'>{children}</div>
          </div>
        </main>
      </body>
    </html>
  );
}
