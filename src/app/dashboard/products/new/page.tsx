import { AddProductForm } from '@/components/dashboard/add-product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Add New SaaS Product</h1>
        <p className="text-sm text-slate-400">
          Create a new product or subscription tier available for orders and SSLCommerz checkout.
        </p>
      </div>
      <AddProductForm />
    </div>
  );
}
