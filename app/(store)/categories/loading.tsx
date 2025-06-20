export default function CategoriesLoading() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header Skeleton */}
      <div className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center'>
            <div className='h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse mb-4'></div>
            <div className='h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse'></div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Filters and Sort Skeleton */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <div className='flex gap-4'>
            <div className='h-10 bg-gray-200 rounded w-48 animate-pulse'></div>
            <div className='h-10 bg-gray-200 rounded w-32 animate-pulse'></div>
          </div>
          <div className='h-10 bg-gray-200 rounded w-40 animate-pulse'></div>
        </div>

        {/* Categories Grid Skeleton */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className='bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse'
            >
              {/* Image Skeleton */}
              <div className='aspect-[4/3] bg-gray-200 relative'>
                <div className='absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
              </div>

              {/* Content Skeleton */}
              <div className='p-4 space-y-3'>
                {/* Title */}
                <div className='h-4 bg-gray-200 rounded w-3/4'>
                  <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
                </div>

                {/* Description */}
                <div className='space-y-2'>
                  <div className='h-3 bg-gray-200 rounded w-full'>
                    <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
                  </div>
                  <div className='h-3 bg-gray-200 rounded w-2/3'>
                    <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
                  </div>
                </div>

                {/* Category Name */}
                <div className='h-3 bg-gray-200 rounded w-1/2'>
                  <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
                </div>

                {/* Button */}
                <div className='h-6 bg-gray-200 rounded w-24'>
                  <div className='h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
