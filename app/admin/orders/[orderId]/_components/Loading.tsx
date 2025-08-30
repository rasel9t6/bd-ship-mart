import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='text-center'>
        <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto'></div>
        <p className='mt-4'>Loading order details...</p>
      </div>
    </div>
  );
};

export default Loading;
