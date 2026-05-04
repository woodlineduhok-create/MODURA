import { useState, ChangeEvent } from 'react';
import { Product } from '../types';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Omit<Product, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(product?.image || '');

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const bucketName = (import.meta.env.VITE_SUPABASE_BUCKET || 'products')
        .trim()
        .replace(/^\/+|\/+$/g, '');
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      // EXTREME Path Safety: No subfolders, no leading slashes, no spaces
      const filePath = fileName; 

      console.log('Final Upload Params:', { bucketName, filePath });

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Supabase Storage Error:', uploadError);
        let msg = uploadError.message;
        if (msg === 'Invalid path' || msg.includes('Invalid path')) {
          msg = `Invalid Path (Bucket: "${bucketName}"). This error usually means the bucket name is wrong OR the bucket DOES NOT EXIST in Supabase. Check your Bucket name in Supabase Storage.`;
        }
        throw new Error(msg);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('Upload successful. URL:', publicUrl);
      setPreviewImage(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Make sure your bucket "products" exists and is public.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-8 border border-gray-100 shadow-2xl max-w-2xl w-full">
      <h3 className="text-2xl font-light italic mb-8">{product ? 'Edit Object' : 'New Object'}</h3>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit({
            name: formData.get('name') as string,
            price: Number(formData.get('price')),
            category: formData.get('category') as string,
            description: formData.get('description') as string,
            image: previewImage,
            id: product?.id
          });
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Name</label>
            <input 
              name="name" 
              defaultValue={product?.name} 
              required 
              className="w-full h-12 bg-gray-50 border-b border-transparent focus:border-black transition-all px-4 text-sm outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Price ($)</label>
            <input 
              name="price" 
              type="number" 
              defaultValue={product?.price} 
              required 
              className="w-full h-12 bg-gray-50 border-b border-transparent focus:border-black transition-all px-4 text-sm outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Category</label>
          <input 
            name="category" 
            defaultValue={product?.category} 
            required 
            placeholder="Furniture, Lighting, Decor..."
            className="w-full h-12 bg-gray-50 border-b border-transparent focus:border-black transition-all px-4 text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Product Image</label>
          <div className="flex gap-4 items-start">
            <div className="relative w-32 h-32 bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden group">
              {previewImage ? (
                <img src={previewImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Upload className="w-6 h-6 text-gray-300" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden" 
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                className="inline-block px-6 h-10 border border-gray-200 text-[10px] font-bold tracking-widest uppercase hover:border-black transition-all cursor-pointer leading-10 text-center"
              >
                Choose File
              </label>
              <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">
                Wait for upload to finish after selection. URL will be updated automatically.
              </p>
              <input 
                name="image"
                value={previewImage}
                onChange={(e) => setPreviewImage(e.target.value)}
                placeholder="Or paste URL directly"
                className="w-full h-10 bg-gray-50 border-b border-transparent focus:border-black transition-all px-4 text-[10px] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Description</label>
          <textarea 
            name="description" 
            defaultValue={product?.description} 
            className="w-full h-32 bg-gray-50 border-b border-transparent focus:border-black transition-all p-4 text-sm outline-none resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit"
            disabled={isUploading}
            className="flex-1 h-12 bg-black text-white text-[10px] font-bold tracking-widest uppercase hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-wait"
          >
            {product ? 'Save Changes' : 'Create Product'}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="px-8 h-12 border border-gray-200 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
