import LeftSidebar from "../_components/LeftSidebar";
import RightSidebar from "../_components/RightSidebar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex ">
      <LeftSidebar />
      <section className="flex flex-1 flex-col overflow-hidden">
        <div className="relative h-full min-h-screen bg-background">
          {children}
        </div>
      </section>
      <RightSidebar />
    </div>
  );
}
