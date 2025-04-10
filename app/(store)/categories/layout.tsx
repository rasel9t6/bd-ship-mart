import React from "react";

import RightSidebarPage from "../@rightSidebar/page";
import LeftSidebar from "../_components/LeftSidebar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <LeftSidebar />
      <section className="flex flex-1 flex-col overflow-hidden">
        <div className="relative h-full min-h-screen bg-gray-50">
          {children}
        </div>
      </section>
      <RightSidebarPage />
    </div>
  );
}
