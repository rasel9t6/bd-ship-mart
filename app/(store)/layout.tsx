import FooterPage from "./footer/page";
import Navbar from "./products/_components/Navbar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    
    <div>
      <Navbar />
      {children}
      <FooterPage />
    </div>
  );
}
