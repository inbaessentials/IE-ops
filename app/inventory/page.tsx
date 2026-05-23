"use client";
// trigger vercel redeploy

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Filter, ImagePlus, X, Package, Layers, AlertTriangle, AlertCircle, TrendingDown, Coins, UploadCloud, Sliders, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/Modal";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["Herbal", "Cosmetic", "Grocery", "Wellness"]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const toast = useToast();

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Inventory Timeline states
  const [activeTab, setActiveTab] = useState<"info" | "timeline">("info");
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("Restock");

  // Bulk Upload states
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkQueue, setBulkQueue] = useState<any[]>([]);

  // Bulk Stock Edit states
  const [isBulkStockOpen, setIsBulkStockOpen] = useState(false);
  const [bulkStockCategory, setBulkStockCategory] = useState("");
  const [bulkStockAction, setBulkStockAction] = useState<"set" | "increase" | "decrease">("set");
  const [bulkStockValue, setBulkStockValue] = useState("");

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('display_id', { ascending: true });
    if (data && data.length > 0) {
      setProducts(data);
    } else {
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    const saved = localStorage.getItem("inba_categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const list = parsed.map((c: any) => c.name);
        setCategories(list);
      } catch (e) {}
    }
  }, []);

  // Removed local storage update functions
  

  const fetchTimelineEvents = async (product: any) => {
    if (!product || !product.id) return;
    try {
      const events: any[] = [];

      // 1. Initial Creation
      events.push({
        date: product.created_at || new Date().toISOString(),
        type: "Creation",
        qty: Number(product.stock || 0),
        title: "Product Created",
        desc: `Product registered with initial stock of ${product.stock || 0} units.`
      });

      // 2. Query dynamic database Sales
      const { data: salesData } = await supabase
        .from("order_items")
        .select("qty, created_at, orders:order_id(display_id, customer)")
        .eq("name", product.name);

      if (salesData) {
        salesData.forEach((item: any) => {
          const ord = item.orders;
          events.push({
            date: item.created_at || new Date().toISOString(),
            type: "Sale",
            qty: item.qty || 1,
            title: "Stock Sold",
            desc: `Sold ${item.qty} units to ${ord?.customer || "Customer"} via order ${ord?.display_id || "ORD"}.`
          });
        });
      }

      // 3. Load manual adjustments from LocalStorage
      const savedAdjustments = localStorage.getItem(`inba_stock_adjustments_${product.id}`);
      if (savedAdjustments) {
        try {
          const parsed = JSON.parse(savedAdjustments);
          parsed.forEach((adj: any) => {
            events.push({
              date: adj.date,
              type: adj.qty > 0 ? "Restock" : "Adjustment",
              qty: Math.abs(adj.qty),
              title: adj.qty > 0 ? "Manual Restock" : "Stock Adjustment",
              desc: `${adj.qty > 0 ? "Added" : "Removed"} ${Math.abs(adj.qty)} units. Reason: ${adj.reason || "None"}.`
            });
          });
        } catch (e) {}
      }

      // Sort chronological descending
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTimelineEvents(events);
    } catch (err) {
      console.error("Error loading timeline events:", err);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadedImage(null);
    setActiveTab("info");
    setTimelineEvents([]);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setUploadedImage(product.image_url || null);
    setActiveTab("info");
    fetchTimelineEvents(product);
    setIsDrawerOpen(true);
  };

  const generateSKU = (name: string) => {
    if (!name) return "";
    // Parse sequential numbers from existing product SKUs
    const nums = products.map(p => {
      const match = p.sku?.match(/INBA-(\d+)/i);
      return match ? parseInt(match[1]) : 0;
    });
    const maxNum = Math.max(...nums, 0);
    return `INBA-${String(maxNum + 1).padStart(4, "0")}`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (editingProduct) {
      const currentSKU = editingProduct.sku || "";
      const isAutoGenerated = !currentSKU || currentSKU.startsWith("INBA-") || currentSKU.startsWith("#INBA-");
      if (isAutoGenerated) {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      toast("Compressing image...", "info");

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

  // Generate batch-safe sequential SKU codes to avoid collisions
  const generateBatchSKUs = (count: number, currentQueue: any[]) => {
    const existingSkus = [
      ...products.map(p => p.sku || ""),
      ...currentQueue.map(q => q.sku || "")
    ];
    
    const nums = existingSkus.map(sku => {
      const match = sku.match(/INBA-(\d+)/i);
      return match ? parseInt(match[1]) : 0;
    });
    
    let maxNum = Math.max(...nums, 0);
    const newSkus: string[] = [];
    for (let i = 0; i < count; i++) {
      maxNum += 1;
      newSkus.push(`INBA-${String(maxNum).padStart(4, "0")}`);
    }
    return newSkus;
  };

  // Compress & upload single bulk product image in background
  const processBulkItemUpload = async (tempId: string, file: File) => {
    try {
      setBulkQueue(prev => prev.map(item => item.id === tempId ? { ...item, uploadStatus: "compressing" } : item));
      
      const compressedFile = await compressImage(file);
      
      setBulkQueue(prev => prev.map(item => item.id === tempId ? { ...item, uploadStatus: "uploading" } : item));
      
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile);

      if (uploadError) {
        console.error(uploadError);
        setBulkQueue(prev => prev.map(item => item.id === tempId ? { ...item, uploadStatus: "error" } : item));
        toast("Image upload failed", "error");
      } else {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        setBulkQueue(prev => prev.map(item => item.id === tempId ? { ...item, image_url: data.publicUrl, uploadStatus: "ready" } : item));
      }
    } catch (err) {
      console.error(err);
      setBulkQueue(prev => prev.map(item => item.id === tempId ? { ...item, uploadStatus: "error" } : item));
    }
  };

  // Handle adding bulk images via selection/dropzone
  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      const currentQueueCount = bulkQueue.length;
      const remainingSlots = 20 - currentQueueCount;
      
      if (remainingSlots <= 0) {
        toast("Bulk queue is full! Max 20 items allowed.", "error");
        return;
      }
      
      let filesToProcess = files;
      if (files.length > remainingSlots) {
        toast(`Only adding the first ${remainingSlots} images to respect the 20-image limit.`, "info");
        filesToProcess = files.slice(0, remainingSlots);
      }
      
      const newItems: any[] = [];
      const generatedSkus = generateBatchSKUs(filesToProcess.length, bulkQueue);
      
      filesToProcess.forEach((file, index) => {
        const tempId = Math.random().toString(36).substring(2, 9);
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const cleanName = nameWithoutExt.replace(/[-_]/g, ' ');
        
        const newItem = {
          id: tempId,
          name: cleanName,
          sku: generatedSkus[index],
          category: categories[0] || "Herbal",
          purchase_price: "",
          price: "",
          stock: "0",
          status: "Active",
          image_url: null,
          uploadStatus: "idle",
          fileName: file.name
        };
        
        newItems.push(newItem);
        processBulkItemUpload(tempId, file);
      });
      
      setBulkQueue(prev => [...prev, ...newItems]);
      e.target.value = ""; // reset input
    }
  };

  const handleEditBulkQueueItem = (id: string, fields: any) => {
    setBulkQueue(prev => prev.map(item => item.id === id ? { ...item, ...fields } : item));
  };

  const handleSaveBulkProducts = async () => {
    if (bulkQueue.length === 0) {
      toast("Your upload queue is empty.", "info");
      return;
    }

    const inProgress = bulkQueue.some(item => item.uploadStatus === "compressing" || item.uploadStatus === "uploading");
    if (inProgress) {
      toast("Please wait for all images to finish uploading.", "info");
      return;
    }
    
    const hasEmptyName = bulkQueue.some(item => !item.name.trim());
    if (hasEmptyName) {
      toast("All products must have a name.", "error");
      return;
    }
    
    const productsToInsert = bulkQueue.map(item => {
      const stockVal = Number(item.stock || 0);
      let statusVal = item.status || "Active";
      if (stockVal === 0) {
        statusVal = "Out of Stock";
      } else if (stockVal <= 15) {
        statusVal = "Low Stock";
      }
      
      return {
        display_id: `PRD-${Math.floor(Math.random() * 90000) + 10000}`,
        name: item.name.trim(),
        sku: item.sku.trim(),
        category: item.category,
        purchase_price: Number(item.purchase_price || 0),
        price: Number(item.price || 0),
        stock: stockVal,
        status: statusVal,
        image_url: item.image_url
      };
    });
    
    try {
      toast("Saving all products...", "info");
      const { error } = await supabase.from('products').insert(productsToInsert);
      if (error) throw error;
      
      toast(`Successfully saved ${productsToInsert.length} products!`, "success");
      setIsBulkUploadOpen(false);
      setBulkQueue([]);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to save bulk products", "error");
    }
  };

  // Bulk stock editor by category
  const handleApplyBulkStock = async () => {
    if (!bulkStockCategory) {
      toast("Please select a category.", "error");
      return;
    }
    
    const value = parseInt(bulkStockValue);
    if (isNaN(value) || value < 0 && bulkStockAction === "set") {
      toast("Please enter a valid stock level.", "error");
      return;
    }
    if (isNaN(value) || value <= 0 && (bulkStockAction === "increase" || bulkStockAction === "decrease")) {
      toast("Please enter a valid change quantity (greater than 0).", "error");
      return;
    }
    
    // Fetch products in selected category
    const { data: catProducts, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('category', bulkStockCategory);
      
    if (fetchError || !catProducts) {
      toast("Failed to fetch products for selected category.", "error");
      return;
    }
    
    if (catProducts.length === 0) {
      toast(`No products found in category "${bulkStockCategory}".`, "info");
      return;
    }
    
    try {
      toast("Updating stock levels...", "info");
      
      const updatePromises = catProducts.map(async (p: any) => {
        let newStock = p.stock || 0;
        if (bulkStockAction === "set") {
          newStock = value;
        } else if (bulkStockAction === "increase") {
          newStock += value;
        } else if (bulkStockAction === "decrease") {
          newStock = Math.max(0, newStock - value);
        }
        
        const newStatus = newStock === 0 ? "Out of Stock" : (newStock <= 15 ? "Low Stock" : "Active");
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock, status: newStatus })
          .eq('id', p.id);
          
        if (updateError) throw updateError;
        
        // Log to LocalStorage stock ledger for each product
        const adjustmentKey = `inba_stock_adjustments_${p.id}`;
        const existing = localStorage.getItem(adjustmentKey);
        const list = existing ? JSON.parse(existing) : [];
        const changeQty = bulkStockAction === "set" ? (newStock - (p.stock || 0)) : (bulkStockAction === "increase" ? value : -value);
        list.push({
          date: new Date().toISOString(),
          qty: changeQty,
          reason: `Bulk Edit Category (${bulkStockCategory})`
        });
        localStorage.setItem(adjustmentKey, JSON.stringify(list));
      });
      
      await Promise.all(updatePromises);
      toast(`Updated stock for ${catProducts.length} products!`, "success");
      setIsBulkStockOpen(false);
      setBulkStockValue("");
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      toast("Failed to update bulk stock levels.", "error");
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !adjustQty) return;

    const qtyVal = parseInt(adjustQty);
    if (isNaN(qtyVal) || qtyVal === 0) return;

    try {
      const newStock = Math.max(0, (editingProduct.stock || 0) + qtyVal);

      // Update Supabase stock level
      const { error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", editingProduct.id);

      if (error) throw error;

      // Save adjustment log to LocalStorage
      const adjustmentKey = `inba_stock_adjustments_${editingProduct.id}`;
      const existing = localStorage.getItem(adjustmentKey);
      const list = existing ? JSON.parse(existing) : [];
      list.push({
        date: new Date().toISOString(),
        qty: qtyVal,
        reason: adjustReason
      });
      localStorage.setItem(adjustmentKey, JSON.stringify(list));

      toast("Stock level adjusted successfully!", "success");
      setAdjustQty("");
      
      const updatedProduct = { ...editingProduct, stock: newStock };
      setEditingProduct(updatedProduct);
      fetchTimelineEvents(updatedProduct);
      fetchProducts();
    } catch (err) {
      console.error("Adjustment failed:", err);
      toast("Failed to adjust stock", "error");
    }
  };

  const getDropdownItems = (product: any) => [
    { label: "Edit Details", onClick: () => handleOpenEdit(product) },
    { label: "Stock Log & Timeline", onClick: () => {
      setEditingProduct(product);
      setUploadedImage(product.image_url || null);
      setActiveTab("timeline");
      fetchTimelineEvents(product);
      setIsDrawerOpen(true);
    }},
    { label: "Delete Product", onClick: async () => {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (!error) {
        toast(`Deleted ${product.name}`, "error");
        fetchProducts();
      }
    }, destructive: true },
  ];

  // Dynamic metrics calculation for Inventory widgets
  const totalProductsCount = products.length;
  const totalStockCount = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;
  const lowStockCount = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
  
  const totalInventoryValue = products.reduce((sum, p) => {
    return sum + ((p.stock || 0) * (p.price || 0));
  }, 0);

  // Dynamic filtering of products list based on search term and category filter!
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products, stock levels, and variants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="gap-2 border border-gray-200 font-semibold" onClick={() => setIsBulkUploadOpen(true)}>
            <UploadCloud className="w-4 h-4" />
            Bulk Upload
          </Button>
          <Button variant="ghost" className="gap-2 border border-gray-200 text-amber-600 hover:text-amber-750 hover:bg-amber-50 font-semibold" onClick={() => {
            setIsBulkStockOpen(true);
            if (categories.length > 0) setBulkStockCategory(categories[0]);
          }}>
            <Sliders className="w-4 h-4" />
            Bulk Stock Edit
          </Button>
          <Button className="gap-2 font-semibold" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Dynamic Inventory Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Products</p>
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{totalProductsCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Stock</p>
            <h3 className="text-2xl font-semibold tracking-tight text-green-600">{totalStockCount} <span className="text-xs font-normal text-gray-400">units</span></h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Out of Stock</p>
            <h3 className="text-2xl font-semibold tracking-tight text-rose-600">{outOfStockCount} <span className="text-xs font-normal text-gray-400">items</span></h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Low Stock</p>
            <h3 className="text-2xl font-semibold tracking-tight text-amber-600">{lowStockCount} <span className="text-xs font-normal text-gray-400">items</span></h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Inventory Value</p>
            <h3 className="text-2xl font-semibold tracking-tight text-indigo-600">₹{totalInventoryValue.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products by name or SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium"
              />
            </div>

            {/* Category Filter */}
            <div className="w-[180px]">
              <Select 
                options={["All", ...categories]}
                value={categoryFilter}
                onChange={setCategoryFilter}
                placeholder="All Categories"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || categoryFilter !== "All") && (
            <Button 
              variant="ghost" 
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
              }}
            >
              Clear Filters
            </Button>
          )}
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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => handleOpenEdit(product)}
                        className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
                      >
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-xs">Img</span>
                        )}
                      </button>
                      <div className="text-left">
                        <button 
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="text-sm font-bold text-primary hover:text-[#257310] hover:underline transition-all text-left block"
                        >
                          {product.name}
                        </button>
                        <p className="text-xs text-gray-500 mt-0.5 font-semibold">SKU: {product.sku}</p>
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
        title={editingProduct?.id ? `${editingProduct.name}` : "Add New Product"}
      >
        {editingProduct?.id && (
          <div className="flex gap-2 border-b border-gray-100 pb-3 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "info"
                  ? "bg-[#2E8C13]/10 text-[#2E8C13]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Product Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "timeline"
                  ? "bg-[#2E8C13]/10 text-[#2E8C13]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Stock Log & Timeline
            </button>
          </div>
        )}

        {activeTab === "info" ? (
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
                <input required type="text" value={editingProduct?.name || ""} onChange={handleNameChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium" placeholder="e.g. Herbal Face Wash" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU Code</label>
                <input required type="text" value={editingProduct?.sku || ""} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-mono font-bold" placeholder="e.g. INBA-C-123" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select 
                  options={categories} 
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
        ) : (
          <div className="space-y-6 pb-10">
            {/* Quick adjust Form */}
            <form onSubmit={handleAdjustStock} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-gray-900">Adjust Stock Level</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                  <input 
                    required 
                    type="number" 
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                    placeholder="e.g. +10 or -5" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Reason</label>
                  <Select 
                    options={["Restock", "Damaged", "Missing", "Correction"]}
                    value={adjustReason}
                    onChange={setAdjustReason}
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" className="w-full text-xs font-semibold py-2">
                Apply Stock Adjustment
              </Button>
            </form>

            {/* Vertical Timeline */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Stock Ledger Timeline</h4>
              {timelineEvents.length > 0 ? (
                <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-6 py-2">
                  {timelineEvents.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        evt.type === 'Sale' ? 'bg-orange-500' :
                        evt.type === 'Restock' ? 'bg-[#2E8C13]' : 'bg-blue-500'
                      }`} />
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-gray-900">{evt.title}</span>
                        <span className="text-gray-400 font-semibold">
                          {new Date(evt.date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{evt.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-medium italic text-center py-6">
                  No stock history recorded yet.
                </p>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Bulk Product Upload Modal */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#2E8C13]" />
                  Bulk Product Upload
                  {bulkQueue.length > 0 && (
                    <span className="text-xs bg-[#2E8C13]/10 text-[#2E8C13] px-2.5 py-1 rounded-full font-bold">
                      {bulkQueue.length} / 20 Products
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-500 mt-1">Upload up to 20 images. Products are named after files, sequential SKUs are auto-generated, and images are compressed & uploaded automatically.</p>
              </div>
              <button 
                onClick={() => {
                  setIsBulkUploadOpen(false);
                  setBulkQueue([]);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {bulkQueue.length === 0 ? (
                /* Drag & Drop Area */
                <div className="h-96 border-2 border-dashed border-gray-200 hover:border-[#2E8C13]/50 rounded-2xl flex flex-col items-center justify-center bg-white transition-all p-8 text-center group relative cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleBulkFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="p-4 bg-[#2E8C13]/5 rounded-full text-[#2E8C13] group-hover:scale-110 transition-transform mb-4">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Upload Product Images</h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-4">Drag and drop up to 20 images at once, or click to browse files on your computer.</p>
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">Supports JPG, PNG, WEBP (Max 20 at a time)</span>
                </div>
              ) : (
                /* Edit Queue */
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500 font-semibold">
                      💡 Filenames are cleaned as Names. Edit fields inline. Green border indicates image is uploaded.
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          onChange={handleBulkFileChange}
                          id="bulkAddMore"
                          className="hidden"
                          disabled={bulkQueue.length >= 20}
                        />
                        <label 
                          htmlFor="bulkAddMore" 
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-50 transition-colors ${bulkQueue.length >= 20 ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add More Images
                        </label>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setBulkQueue([])}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Clear Queue
                      </button>
                    </div>
                  </div>

                  {/* Product Grid List */}
                  <div className="grid grid-cols-1 gap-4">
                    {bulkQueue.map((item) => (
                      <div 
                        key={item.id} 
                        className={`bg-white rounded-xl border transition-all shadow-sm flex flex-col md:flex-row p-4 gap-4 items-start md:items-center relative ${
                          item.uploadStatus === 'ready' ? 'border-green-200' :
                          item.uploadStatus === 'error' ? 'border-rose-200' : 'border-gray-100'
                        }`}
                      >
                        {/* Image Preview & Upload Status */}
                        <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt="Uploaded thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-gray-400 text-xs text-center p-2 font-medium">Image Preview</div>
                          )}

                          {/* Upload Status Overlay */}
                          <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white text-center p-1 ${
                            item.uploadStatus === 'compressing' ? 'bg-black/60' :
                            item.uploadStatus === 'uploading' ? 'bg-black/60' :
                            item.uploadStatus === 'ready' ? 'bg-green-600/10' :
                            item.uploadStatus === 'error' ? 'bg-rose-600/80' : 'hidden'
                          }`}>
                            {item.uploadStatus === 'compressing' && (
                              <div className="flex flex-col items-center">
                                <Loader2 className="w-4 h-4 animate-spin mb-0.5 text-white" />
                                <span>Compressing...</span>
                              </div>
                            )}
                            {item.uploadStatus === 'uploading' && (
                              <div className="flex flex-col items-center">
                                <Loader2 className="w-4 h-4 animate-spin mb-0.5 text-white" />
                                <span>Uploading...</span>
                              </div>
                            )}
                            {item.uploadStatus === 'error' && (
                              <div className="flex flex-col items-center">
                                <X className="w-4 h-4 mb-0.5 text-white" />
                                <span>Retry</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Editable Form Fields Grid */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 w-full">
                          {/* Name Input */}
                          <div className="lg:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Product Name</label>
                            <input 
                              type="text" 
                              required
                              value={item.name}
                              onChange={(e) => handleEditBulkQueueItem(item.id, { name: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none font-semibold text-gray-900"
                              placeholder="Name"
                            />
                          </div>

                          {/* SKU Input */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">SKU Code</label>
                            <input 
                              type="text" 
                              required
                              value={item.sku}
                              onChange={(e) => handleEditBulkQueueItem(item.id, { sku: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none font-mono font-bold text-gray-900"
                              placeholder="SKU"
                            />
                          </div>

                          {/* Category Select */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Category</label>
                            <Select 
                              options={categories}
                              value={item.category}
                              onChange={(val) => handleEditBulkQueueItem(item.id, { category: val })}
                              allowCustom={true}
                              placeholder="Category"
                            />
                          </div>

                          {/* Prices Container (Purchase & Sell Price in columns) */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Purchase / Sale (₹)</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                required
                                value={item.purchase_price}
                                onChange={(e) => handleEditBulkQueueItem(item.id, { purchase_price: e.target.value })}
                                className="w-1/2 min-w-0 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-center font-medium"
                                placeholder="Cost"
                              />
                              <input 
                                type="number" 
                                required
                                value={item.price}
                                onChange={(e) => handleEditBulkQueueItem(item.id, { price: e.target.value })}
                                className="w-1/2 min-w-0 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-center font-bold text-[#2E8C13]"
                                placeholder="Sell"
                              />
                            </div>
                          </div>

                          {/* Stock Level Input & Availability */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Stock Level & Availability</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                required
                                value={item.stock}
                                onChange={(e) => handleEditBulkQueueItem(item.id, { stock: e.target.value })}
                                className="w-2/5 min-w-0 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-center font-bold"
                                placeholder="Qty"
                              />
                              <select
                                value={item.status}
                                onChange={(e) => handleEditBulkQueueItem(item.id, { status: e.target.value })}
                                className="w-3/5 min-w-0 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none font-semibold text-gray-700"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Remove Action Button */}
                        <button 
                          type="button"
                          onClick={() => setBulkQueue(prev => prev.filter(q => q.id !== item.id))}
                          className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all self-end md:self-center shrink-0 border border-transparent hover:border-rose-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-white">
              <div className="text-xs text-gray-500 font-medium">
                {bulkQueue.length > 0 && (
                  <span>
                    Ready: {bulkQueue.filter(q => q.uploadStatus === 'ready').length} / {bulkQueue.length}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setIsBulkUploadOpen(false);
                    setBulkQueue([]);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={handleSaveBulkProducts}
                  disabled={bulkQueue.length === 0 || bulkQueue.some(q => q.uploadStatus === 'compressing' || q.uploadStatus === 'uploading')}
                  className="gap-2 font-bold animate-pulse-subtle"
                >
                  {bulkQueue.some(q => q.uploadStatus === 'compressing' || q.uploadStatus === 'uploading') ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading Images...
                    </>
                  ) : (
                    <>
                      Save {bulkQueue.length} Products
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Stock Edit Modal */}
      {isBulkStockOpen && (
        <Modal 
          isOpen={isBulkStockOpen} 
          onClose={() => {
            setIsBulkStockOpen(false);
            setBulkStockValue("");
          }} 
          title="Bulk Edit Stock by Category"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Adjust stock levels for all products matching a selected category simultaneously. This change is permanent and will log manual ledger timeline events for all modified products.
            </p>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Product Category</label>
              <Select 
                options={categories}
                value={bulkStockCategory}
                onChange={setBulkStockCategory}
                placeholder="Select Category..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Adjustment Action</label>
                <select
                  value={bulkStockAction}
                  onChange={(e: any) => setBulkStockAction(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-gray-800"
                >
                  <option value="set">Set stock to...</option>
                  <option value="increase">Increase stock by...</option>
                  <option value="decrease">Decrease stock by...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity / Stock Level</label>
                <input 
                  type="number" 
                  required
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none font-bold text-gray-900"
                  placeholder="e.g. 50"
                  min="0"
                />
              </div>
            </div>

            {/* Affected Products Preview Widget */}
            {bulkStockCategory && (
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">Bulk Action Preview</h4>
                  <p className="text-xs text-amber-700 font-medium">
                    This action will update stock level values for{" "}
                    <span className="font-bold underline text-amber-950">
                      {products.filter(p => p.category === bulkStockCategory).length} products
                    </span>{" "}
                    in the <span className="font-bold">"{bulkStockCategory}"</span> category.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setIsBulkStockOpen(false);
                  setBulkStockValue("");
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleApplyBulkStock}
                className="font-bold"
              >
                Apply Updates
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
