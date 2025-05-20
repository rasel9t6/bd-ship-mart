import Categories from "./_components/CategoryList";
import ImageSlider from "./_components/ImageSlider";
import LeftSidebar from "./_components/LeftSidebar";
import ProductList from "./_components/ProductList";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="flex">
        <LeftSidebar />

        <section className="flex flex-1 flex-col overflow-hidden">
          {/* Hero Section with Sliders */}
          <div className="container mx-auto px-4 sm:px-5 pt-16 sm:pt-20 lg:pt-24">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:h-[500px]">
              {/* Main large slider */}
              <div className="w-full lg:w-[68%] lg:h-full">
                <div className="relative w-full h-full">
                  <ImageSlider />
                </div>
              </div>

              {/* Right column with two smaller sliders */}
              <div className="hidden md:flex w-full flex-col justify-between gap-4 lg:w-[30%] lg:h-full">
                <div className="relative w-full h-[48%]">
                  <ImageSlider hideControls={true} />
                </div>
                <div className="relative w-full h-[48%]">
                  <ImageSlider hideControls={true} />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mt-8 sm:mt-12">
            <Categories />
          </div>

          {/* Products Section */}
          <div className="mt-4 sm:mt-8">
            <ProductList />
          </div>
        </section>
      </div>
    </main>
  );
}
