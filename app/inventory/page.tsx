"use client";
// trigger vercel redeploy

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Filter, ImagePlus, X } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const toast = useToast();

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('display_id', { ascending: true });
    if (data && data.length > 0) {
      setProducts(data);
    } else {
      // If DB is empty, fallback to empty array or try to seed
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Removed local storage update functions
  

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadedImage(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setUploadedImage(product.image_url || null);
    setIsDrawerOpen(true);
  };

  const generateSKU = (name: string) => {
    if (!name) return "";
    const words = name.toUpperCase().replace(/[^A-Z0-9 ]/g, '').split(' ');
    const code = words.length > 1 ? `${words[0].substring(0, 2)}${words[1].substring(0, 2)}` : words[0].substring(0, 4);
    return `#INBA-${code}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (editingProduct) {
      // Only auto-generate SKU if it's empty, otherwise keep existing
      if (!editingProduct.sku) {
        setEditingProduct({ ...editingProduct, name, sku: generateSKU(name) });
      } else {
        setEditingProduct({ ...editingProduct, name });
      }
    } else {
      setEditingProduct({ name, sku: generateSKU(name) });
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const productData = {
      display_id: editingProduct?.display_id || `PRD-${Math.floor(Math.random() * 10000)}`,
      name: editingProduct.name,
      sku: editingProduct.sku,
      category: editingProduct.category,
      purchase_price: Number(editingProduct.purchase_price || 0),
      price: Number(editingProduct.price || 0),
      stock: Number(editingProduct.stock || 0),
      status: editingProduct.status || "Active",
      image_url: uploadedImage
    };

    if (editingProduct?.id) {
      const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
      if (!error) {
        toast("Product Updated!", "success");
        fetchProducts();
      } else {
        toast("Failed to update product", "error");
      }
    } else {
      const { error } = await supabase.from('products').insert([productData]);
      if (!error) {
        toast("Product Saved!", "success");
        fetchProducts();
      } else {
        toast("Failed to save product", "error");
      }
    }
    setIsDrawerOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      toast("Compressing image...", "info");

      // Compress image before upload
      const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 800;
              const MAX_HEIGHT = 800;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(new File([blob], file.name, { type: "image/jpeg" }));
                } else {
                  reject(new Error("Compression failed"));
                }
              }, "image/jpeg", 0.7);
            };
          };
        });
      };

      try {
        const compressedFile = await compressImage(file);
        
        // Upload to Supabase Storage
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        toast("Uploading image...", "info");
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedFile);

        if (uploadError) {
          toast("Image upload failed", "error");
          console.error(uploadError);
        } else {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          setUploadedImage(data.publicUrl);
          toast("Image uploaded!", "success");
        }
      } catch (err) {
        toast("Failed to compress image", "error");
      }
    }
  };

  const getDropdownItems = (product: any) => [
    { label: "Edit Product", onClick: () => handleOpenEdit(product) },
    { label: "Adjust Stock", onClick: () => toast(`Adjusting stock for ${product.name}`, "info") },
    { label: "Delete", onClick: async () => {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (!error) {
        toast(`Deleted ${product.name}`, "error");
        fetchProducts();
      }
    }, destructive: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products, stock levels, and variants.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-xs">Img</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₹{product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${product.stock <= 15 && product.stock > 0 ? 'text-orange-600' : product.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={
                        product.status === 'Active' ? 'success' : 
                        product.status === 'Low Stock' ? 'warning' :
                        product.status === 'Inactive' ? 'default' : 'error'
                      }
                    >
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu items={getDropdownItems(product)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product Drawer */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title={editingProduct?.id ? "Edit Product" : "Add New Product"}
      >
        <form className="space-y-4 pb-10" onSubmit={handleSaveProduct}>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Image</h3>
            
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden group">
                {uploadedImage ? (
                  <>
                    <img src={uploadedImage} alt="Product preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setUploadedImage(null)} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-400">
                    <ImagePlus className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-[10px] font-medium">Upload</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Upload a square image (1:1 ratio). Recommended size is 500x500px.</p>
                <input type="file" id="productImage" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <label htmlFor="productImage" className="inline-flex px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
                  Choose File
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Basic Info</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input required type="text" value={editingProduct?.name || ""} onChange={handleNameChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Herbal Face Wash" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select 
                options={["Herbal", "Cosmetic", "Grocery", "Wellness", "Beauty"]} 
                value={editingProduct?.category || ""} 
                onChange={(val) => setEditingProduct({...editingProduct, category: val})}
                allowCustom={true}
                placeholder="Type or select..."
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Pricing & Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (₹)</label>
                <input required type="number" value={editingProduct?.purchase_price || ""} onChange={(e) => setEditingProduct({...editingProduct, purchase_price: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                <input required type="number" value={editingProduct?.price || ""} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Level</label>
                <input required type="number" value={editingProduct?.stock || ""} onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select 
                  options={["Active", "Inactive", "Low Stock", "Out of Stock"]} 
                  value={editingProduct?.status || "Active"} 
                  onChange={(val) => setEditingProduct({...editingProduct, status: val})}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingProduct?.id ? "Update Product" : "Save Product"}</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
