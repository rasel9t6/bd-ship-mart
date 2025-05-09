import FooterPage from './footer/page';
import Navbar from './_components/Navbar';

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <main className='flex-1 mt-24 mb-16'>{children}</main>
      <FooterPage />
    </div>
  );
}
