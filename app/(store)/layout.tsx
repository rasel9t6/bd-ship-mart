import FooterPage from './footer/page';
import Navbar from './_components/Navbar';

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Navbar />
      <div className='flex-1 mt-5'>{children}</div>
      <FooterPage />
    </div>
  );
}
