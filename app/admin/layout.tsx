

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
        <main className='flex text-gray-1 max-lg:flex-col'>
          <LeftSideBar />
          <TopBar />

          <div className='flex-1 px-8 py-10'>{children}</div>
        </main>
      </body>
    </html>
  );
}
