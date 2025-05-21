import Categories from "./_components/CategoryList";
import ImageSlider from "./_components/ImageSlider";
import LeftSidebar from "./_components/LeftSidebar";
import ProductList from "./_components/ProductList";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="flex">
        <LeftSidebar />

        <section className="flex flex-1 flex-col overflow-hidden">
          {/* Hero Section with Sliders */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 sm:mt-[120px] mt-[84px]">
            {/* Responsive layout: stacked/grid on mobile/tablet, flex row on large screens */}
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-6 lg:h-[500px]">
              {/* Main slider section */}
              <div className="w-full lg:w-2/3 lg:h-full">
                <div className="relative w-full aspect-[16/9] lg:aspect-auto lg:h-full rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                  <ImageSlider />
                </div>
              </div>
              {/* Secondary sliders section */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:w-1/3 lg:flex lg:flex-col lg:gap-6 lg:h-full">
                <div className="relative w-full aspect-[16/9] lg:aspect-auto lg:h-1/2 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
                  <ImageSlider hideControls={true} />
                </div>
                <div className="relative w-full aspect-[16/9] lg:aspect-auto lg:h-1/2 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
                  <ImageSlider hideControls={true} />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <Categories />
          </div>

          {/* Products Section */}
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <ProductList />
          </div>
        </section>
      </div>
    </div>
  );
}
