import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { X, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import ProductForm from './ProductForm';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function AdminPanel({ products, onAdd, onEdit, onDelete, onClose }: AdminPanelProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [bucketStatus, setBucketStatus] = useState<'checking' | 'active' | 'error'>('checking');
  const [tableStatus, setTableStatus] = useState<'checking' | 'active' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Login State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (loginCode === '134679') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid security code');
      setLoginCode('');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const checkSetup = async () => {
      // Check Bucket
      const bucket = (import.meta.env.VITE_SUPABASE_BUCKET || 'products').trim();
      const { error: bucketError } = await supabase.storage.getBucket(bucket);
      
      if (bucketError) {
        setBucketStatus('error');
        setErrorMessage(bucketError.message);
      } else {
        setBucketStatus('active');
      }

      // Check Table
      const { error: tableError } = await supabase.from('products').select('id').limit(1);
      if (tableError) {
        setTableStatus('error');
        if (!errorMessage) setErrorMessage(tableError.message);
      } else {
        setTableStatus('active');
      }
    };
    checkSetup();
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-center items-center justify-center p-6 bg-black text-white"
          >
            <div className="w-full max-w-sm space-y-8 text-center">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tighter italic">Manager/Gate</h2>
                <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">Secret access only</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <input 
                  type="password"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder="ENTER ACCESS CODE"
                  autoFocus
                  className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-4 text-white text-center text-2xl tracking-[1em] focus:outline-none focus:border-white transition-all placeholder:text-white/10 placeholder:tracking-normal placeholder:text-xs"
                />
                {loginError && <p className="text-red-500 text-[8px] font-bold uppercase tracking-widest animate-shake">{loginError}</p>}
                
                <div className="flex flex-col gap-4">
                  <button 
                    type="submit"
                    className="w-full h-16 bg-white text-black text-[10px] font-bold tracking-widest uppercase hover:bg-gray-200 transition-all"
                  >
                    Authorize Session
                  </button>
                  <button 
                    type="button"
                    onClick={onClose}
                    className="text-[10px] text-gray-500 font-bold tracking-widest uppercase hover:text-white transition-all"
                  >
                    Abort Access
                  </button>
                </div>
              </form>
              
              <div className="pt-12 flex justify-center gap-1">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`w-1 h-1 rounded-full ${loginCode.length >= i ? 'bg-white' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <header className="h-24 border-b border-gray-100 flex items-center justify-between px-12">
        <div className="flex items-center gap-8">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:opacity-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
          <h2 className="text-xl font-bold tracking-tighter italic">Manager/Systems</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
              <div className={`w-1.5 h-1.5 rounded-full ${
                bucketStatus === 'active' ? 'bg-green-500' : 
                bucketStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-[8px] font-bold tracking-widest uppercase text-gray-400">
                Storage: {bucketStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
              <div className={`w-1.5 h-1.5 rounded-full ${
                tableStatus === 'active' ? 'bg-green-500' : 
                tableStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-[8px] font-bold tracking-widest uppercase text-gray-400">
                Database: {tableStatus}
              </span>
            </div>
            {(bucketStatus === 'error' || tableStatus === 'error') && (
              <span className="text-[8px] text-red-500 font-bold uppercase tracking-widest animate-bounce">
                Setup incomplete: {errorMessage}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="h-12 px-8 bg-black text-white text-[10px] font-bold tracking-widest uppercase hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-6 px-6 py-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              <div className="col-span-2">Product</div>
              <div>Category</div>
              <div>Price</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {products.map((product) => (
              <div 
                key={product.id}
                className="grid grid-cols-6 items-center px-6 py-6 bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="col-span-2 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white flex items-center justify-center overflow-hidden border border-gray-100">
                    {product.image ? (
                      <img src={product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[8px] text-gray-300">N/A</span>
                    )}
                  </div>
                  <span className="font-medium text-sm">{product.name}</span>
                </div>
                <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{product.category}</div>
                <div className="font-medium text-sm">${product.price}</div>
                <div className="col-span-2 flex justify-end gap-4">
                  <button 
                    onClick={() => setEditingProduct(product)}
                    className="p-3 bg-white border border-gray-200 rounded-full hover:border-black transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(product.id)}
                    className="p-3 bg-white border border-gray-200 rounded-full hover:border-red-500 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {(isAdding || editingProduct) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[210] flex items-center justify-center p-6"
          >
            <ProductForm 
              product={editingProduct || undefined}
              onSubmit={(data) => {
                if (editingProduct) {
                  onEdit({ ...data, id: editingProduct.id } as Product);
                } else {
                  const { id: _, ...rest } = data;
                  onAdd(rest as Omit<Product, 'id'>);
                }
                setIsAdding(false);
                setEditingProduct(null);
              }}
              onCancel={() => {
                setIsAdding(false);
                setEditingProduct(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
