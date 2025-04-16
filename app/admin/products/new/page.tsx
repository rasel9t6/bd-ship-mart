import ProductForm from '../_components/ProductForm';

export default function NewProductPage() {
  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-8 text-3xl font-bold'>Create New Product</h1>
      <ProductForm />
    </div>
  );
}
