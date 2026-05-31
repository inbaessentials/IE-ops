"use client";
// trigger vercel redeploy

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Filter, ImagePlus, X, Package, Layers, AlertTriangle, AlertCircle, TrendingDown, Coins, UploadCloud, Sliders, Trash2, Loader2, CheckCircle2, List, LayoutGrid, ShoppingBag, Award } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/Modal";
import { usePlatform } from "@/lib/PlatformContext";

export default function InventoryPage() {
  const { platform, config } = usePlatform();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["Herbal", "Cosmetic", "Grocery", "Wellness"]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };

  const getHelperText = (key: string, fallback: string) => {
    return config.helperText.find(h => h.key === key)?.text || fallback;
  };
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

  // Tabular Bulk Product Editor states
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEditProducts, setBulkEditProducts] = useState<any[]>([]);
  const [bulkEditSearch, setBulkEditSearch] = useState("");
  const [bulkEditCategory, setBulkEditCategory] = useState("All");
  const [bulkEditLoading, setBulkEditLoading] = useState(false);

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

  // Tabular Bulk Product Editor Open Handler
  const handleOpenBulkEdit = () => {
    // Clone products deep so modifications stay in draft state
    const cloned = products.map(p => ({
      ...p,
      purchase_price: p.purchase_price !== null && p.purchase_price !== undefined ? p.purchase_price.toString() : "0",
      price: p.price !== null && p.price !== undefined ? p.price.toString() : "0",
      stock: p.stock !== null && p.stock !== undefined ? p.stock.toString() : "0",
      uploadStatus: "idle" // Idle state for uploads
    }));
    setBulkEditProducts(cloned);
    setBulkEditSearch("");
    setBulkEditCategory("All");
    setIsBulkEditOpen(true);
  };

  const handleBulkEditChange = (id: string, field: string, value: any) => {
    setBulkEditProducts(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Compression & upload single bulk product image inside the editor
  const processBulkEditImageUpload = async (productId: string, file: File) => {
    try {
      setBulkEditProducts(prev => prev.map(item => item.id === productId ? { ...item, uploadStatus: "compressing" } : item));
      
      const compressedFile = await compressImage(file);
      
      setBulkEditProducts(prev => prev.map(item => item.id === productId ? { ...item, uploadStatus: "uploading" } : item));
      
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile);

      if (uploadError) {
        console.error(uploadError);
        setBulkEditProducts(prev => prev.map(item => item.id === productId ? { ...item, uploadStatus: "error" } : item));
        toast("Image upload failed", "error");
      } else {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        setBulkEditProducts(prev => prev.map(item => item.id === productId ? { ...item, image_url: data.publicUrl, uploadStatus: "ready" } : item));
        toast("Image uploaded!", "success");
      }
    } catch (err) {
      console.error(err);
      setBulkEditProducts(prev => prev.map(item => item.id === productId ? { ...item, uploadStatus: "error" } : item));
      toast("Failed to compress image", "error");
    }
  };

  // Direct Product Deletion inside Bulk Editor
  const handleBulkEditDelete = async (product: any) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (!error) {
        toast(`Successfully deleted ${product.name}`, "error");
        setBulkEditProducts(prev => prev.filter(p => p.id !== product.id));
        fetchProducts();
      } else {
        throw error;
      }
    } catch (err: any) {
      console.error(err);
      toast("Failed to delete product.", "error");
    }
  };

  // Helper check to determine if a product row is modified
  const isProductModified = (draft: any) => {
    const original = products.find(p => p.id === draft.id);
    if (!original) return false;
    
    return (
      draft.name !== original.name ||
      draft.sku !== original.sku ||
      draft.category !== original.category ||
      Number(draft.purchase_price) !== Number(original.purchase_price || 0) ||
      Number(draft.price) !== Number(original.price || 0) ||
      Number(draft.stock) !== Number(original.stock || 0) ||
      draft.status !== original.status ||
      draft.image_url !== original.image_url
    );
  };

  // Save changes of modified products
  const handleSaveBulkEdit = async () => {
    const modifiedProducts = bulkEditProducts.filter(isProductModified);

    if (modifiedProducts.length === 0) {
      toast("No changes detected.", "info");
      return;
    }

    const hasEmptyName = modifiedProducts.some(p => !p.name.trim());
    if (hasEmptyName) {
      toast("All product names must be filled out.", "error");
      return;
    }

    const hasNegativePrice = modifiedProducts.some(p => Number(p.purchase_price) < 0 || Number(p.price) < 0);
    if (hasNegativePrice) {
      toast("Prices cannot be negative.", "error");
      return;
    }

    const hasNegativeStock = modifiedProducts.some(p => Number(p.stock) < 0);
    if (hasNegativeStock) {
      toast("Stock level cannot be negative.", "error");
      return;
    }

    setBulkEditLoading(true);
    toast("Saving your modifications...", "info");

    try {
      const updatePromises = modifiedProducts.map(async (draft) => {
        const original = products.find(p => p.id === draft.id);
        const originalStock = original ? (original.stock || 0) : 0;
        const newStock = Number(draft.stock || 0);
        const diff = newStock - originalStock;

        // Auto-recalculate status transitions based on new stock level
        let newStatus = draft.status;
        if (newStock === 0 && (newStatus === "Active" || newStatus === "Low Stock")) {
          newStatus = "Out of Stock";
        } else if (newStock > 0 && newStock <= 15 && newStatus === "Active") {
          newStatus = "Low Stock";
        } else if (newStock > 15 && (newStatus === "Out of Stock" || newStatus === "Low Stock")) {
          newStatus = "Active";
        }

        const { error } = await supabase
          .from("products")
          .update({
            name: draft.name.trim(),
            sku: draft.sku.trim(),
            category: draft.category,
            purchase_price: Number(draft.purchase_price || 0),
            price: Number(draft.price || 0),
            stock: newStock,
            status: newStatus,
            image_url: draft.image_url
          })
          .eq("id", draft.id);

        if (error) throw error;

        // Save log to stock ledger timeline
        if (diff !== 0) {
          const adjustmentKey = `inba_stock_adjustments_${draft.id}`;
          const existing = localStorage.getItem(adjustmentKey);
          const list = existing ? JSON.parse(existing) : [];
          list.push({
            date: new Date().toISOString(),
            qty: diff,
            reason: `Bulk Product Editor Adjustment (${diff > 0 ? "Added" : "Removed"} ${Math.abs(diff)} units)`
          });
          localStorage.setItem(adjustmentKey, JSON.stringify(list));
        }
      });

      await Promise.all(updatePromises);
      toast(`Successfully saved changes for ${modifiedProducts.length} products!`, "success");
      setIsBulkEditOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error("Failed to save bulk edit products:", err);
      toast(err.message || "Failed to save product modifications.", "error");
    } finally {
      setBulkEditLoading(false);
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

  const getDropdownItems = (product: any) => {
    if (platform === "online-course") {
      return [
        { label: "Edit Details", onClick: () => handleOpenEdit(product) },
        { 
          label: product.status === "Inactive" ? "Restore Course" : "Archive Course", 
          onClick: async () => {
            const newStatus = product.status === "Inactive" ? "Active" : "Inactive";
            const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', product.id);
            if (!error) {
              toast(product.status === "Inactive" ? "Course Restored!" : "Course Archived!", "success");
              fetchProducts();
            } else {
              toast("Failed to update course status", "error");
            }
          }
        },
        { 
          label: "Delete Course", 
          onClick: async () => {
            const confirmDel = window.confirm(`Are you sure you want to delete "${product.name}"?`);
            if (!confirmDel) return;
            const { error } = await supabase.from('products').delete().eq('id', product.id);
            if (!error) {
              toast(`Deleted ${product.name}`, "error");
              fetchProducts();
            }
          }, 
          destructive: true 
        },
      ];
    }

    return [
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
  };

  // Dynamic filtering of products list based on search term and category filter!
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Dynamic metrics calculation for Inventory widgets based on currently filtered products subset
  const totalProductsCount = filteredProducts.length;
  const totalStockCount = filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  const outOfStockCount = filteredProducts.filter(p => (p.stock || 0) === 0).length;
  const lowStockCount = filteredProducts.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
  
  const totalInventoryValue = filteredProducts.reduce((sum, p) => {
    return sum + ((p.stock || 0) * (p.price || 0));
  }, 0);

  // ==========================================
  // GYM SERVICES PLATFORM PLANS SUITE (PRD 1.0)
  // ==========================================
  if (platform === "gym-services") {
    return <GymMembershipsView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getModuleProp('Inventory', 'displayName')} Management</h1>
          <p className="text-sm text-gray-500 mt-1">{getModuleProp('Inventory', 'description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="gap-2 border border-gray-200 font-semibold" onClick={() => setIsBulkUploadOpen(true)}>
            <UploadCloud className="w-4 h-4" />
            Bulk Upload
          </Button>
          <Button variant="ghost" className="gap-2 border border-gray-200 text-[#2E8C13] hover:text-[#257310] hover:bg-green-50 font-semibold" onClick={handleOpenBulkEdit}>
            <Sliders className="w-4 h-4" />
            Bulk Edit {getModuleProp('Inventory', 'displayName')}
          </Button>
          <Button className="gap-2 font-semibold" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" />
            Add {getModuleProp('Inventory', 'singularDisplayName')}
          </Button>
        </div>
      </div>

      {/* Dynamic Inventory Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total {getModuleProp('Inventory', 'displayName')}</p>
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{totalProductsCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total {platform === 'online-course' ? 'Enrollment Slots' : 'Stock'}</p>
            <h3 className="text-2xl font-semibold tracking-tight text-green-600">{totalStockCount} <span className="text-xs font-normal text-gray-400">{platform === 'online-course' ? 'slots' : 'units'}</span></h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{platform === 'online-course' ? 'Inactive Courses' : 'Out of Stock'}</p>
            <h3 className="text-2xl font-semibold tracking-tight text-rose-600">{outOfStockCount} <span className="text-xs font-normal text-gray-400">items</span></h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{platform === 'online-course' ? 'Low Engagement' : 'Low Stock'}</p>
            <h3 className="text-2xl font-semibold tracking-tight text-amber-600">{lowStockCount} <span className="text-xs font-normal text-gray-400">items</span></h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{platform === 'online-course' ? 'Academy' : 'Inventory'} Value</p>
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
                placeholder={getHelperText("searchProducts", "Search catalog...")} 
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

          <div className="flex items-center gap-3">
            {/* View Mode Toggle (Table / Grid) for Course platform */}
            {platform === "online-course" && (
              <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 shrink-0 mr-2">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "cards"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Course Summary Cards"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}

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
        </div>

        {platform === "online-course" && viewMode === "cards" ? (
          /* Course Summary Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50/30">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-150 flex flex-col justify-between bg-white">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-14 h-14 bg-green-50 rounded-xl border border-green-100 flex items-center justify-center overflow-hidden shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <Badge 
                        variant={
                          product.status === 'Active' ? 'success' : 
                          product.status === 'Low Stock' ? 'warning' :
                          product.status === 'Inactive' ? 'default' : 'error'
                        }
                      >
                        {product.status === 'Inactive' ? 'Archived' : product.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 hover:text-green-700 hover:underline cursor-pointer transition-all" onClick={() => handleOpenEdit(product)}>
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 font-semibold">SKU: {product.sku}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">₹{product.price.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Students</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{product.stock} enrolled</p>
                      </div>
                    </div>
                    <div className="bg-[#2E8C13]/5 border border-[#2E8C13]/10 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs font-bold text-[#2E8C13] uppercase tracking-wider">Total Revenue</span>
                      <span className="text-sm font-extrabold text-gray-950">₹{(product.stock * product.price).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => handleOpenEdit(product)}>
                      Edit Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700" 
                      onClick={async () => {
                        const newStatus = product.status === "Inactive" ? "Active" : "Inactive";
                        const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', product.id);
                        if (!error) {
                          toast(product.status === "Inactive" ? "Course Restored!" : "Course Archived!", "success");
                          fetchProducts();
                        } else {
                          toast("Failed to update course status", "error");
                        }
                      }}
                    >
                      {product.status === "Inactive" ? "Restore" : "Archive Course"}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-gray-400 font-medium bg-white rounded-xl border border-dashed border-gray-200">
                No courses match the active search and filters.
              </div>
            )}
          </div>
        ) : (
          /* Table View Mode (Courses / standard Inba Products list) */
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {platform === "online-course" ? "Course Name" : "Product Info"}
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {platform === "online-course" ? "Students Enrolled" : "Stock"}
                  </th>
                  {platform === "online-course" && (
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue Generated</th>
                  )}
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
                        {product.stock} {platform === "online-course" ? "students" : "units"}
                      </span>
                    </td>
                    {platform === "online-course" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        ₹{(product.stock * product.price).toLocaleString("en-IN")}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          product.status === 'Active' ? 'success' : 
                          product.status === 'Low Stock' ? 'warning' :
                          product.status === 'Inactive' ? 'default' : 'error'
                        }
                      >
                        {product.status === 'Inactive' && platform === 'online-course' ? 'Archived' : product.status}
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
        )}
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

      {/* Tabular Bulk Product Edit Modal */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#2E8C13]" />
                  Bulk Product Editor
                  {bulkEditProducts.length > 0 && (
                    <span className="text-xs bg-[#2E8C13]/10 text-[#2E8C13] px-2.5 py-1 rounded-full font-bold">
                      {bulkEditProducts.length} Products
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Modify details, adjust stock using steppers, upload photos, or delete products directly in the list. Changes are saved as drafts and logged to manual timelines.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsBulkEditOpen(false);
                  setBulkEditProducts([]);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Filters Toolbar inside modal */}
            <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 flex-1">
                {/* Modal Search Bar */}
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search inside editor by name or SKU..." 
                    value={bulkEditSearch}
                    onChange={(e) => setBulkEditSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] transition-all text-gray-900 font-semibold"
                  />
                </div>

                {/* Modal Category Selector */}
                <div className="w-[180px]">
                  <Select 
                    options={["All", ...categories]}
                    value={bulkEditCategory}
                    onChange={setBulkEditCategory}
                    placeholder="All Categories"
                  />
                </div>
              </div>

              {/* Dynamic Modified Indicators */}
              <div className="text-xs font-bold text-gray-500 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span>
                  Modified: <span className="text-green-700">{bulkEditProducts.filter(isProductModified).length}</span>
                </span>
              </div>
            </div>

            {/* Content Table Body */}
            <div className="flex-1 overflow-hidden p-6 bg-gray-50/30 flex flex-col justify-start">
              {bulkEditProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-gray-900">No Products Available</h3>
                  <p className="text-xs text-gray-400 mt-1">There are no products in the inventory to edit.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col max-h-[52vh]">
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 border-b border-gray-200 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Photo</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info (Name & SKU)</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Category</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-48 text-center">Cost / Sell (₹)</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-48 text-center">Stock & Quick Stepper</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-36">Status</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right w-16">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bulkEditProducts
                          .filter(product => {
                            const matchesSearch = 
                              product.name.toLowerCase().includes(bulkEditSearch.toLowerCase()) ||
                              (product.sku && product.sku.toLowerCase().includes(bulkEditSearch.toLowerCase()));
                            const matchesCategory = bulkEditCategory === "All" || product.category === bulkEditCategory;
                            return matchesSearch && matchesCategory;
                          })
                          .map((item) => {
                            const modified = isProductModified(item);
                            return (
                              <tr 
                                key={item.id} 
                                className={`transition-all ${
                                  modified ? "bg-green-50/20 hover:bg-green-50/40" : "hover:bg-gray-50/50"
                                }`}
                              >
                                {/* Photo column with background uploading */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden group cursor-pointer shadow-sm hover:scale-105 transition-transform">
                                    {item.image_url ? (
                                      <img src={item.image_url} alt="Product preview" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                                    ) : (
                                      <div className="text-gray-400 text-[10px] text-center font-medium">No Img</div>
                                    )}
                                    
                                    {/* Edit Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <ImagePlus className="w-4 h-4 text-white animate-pulse" />
                                    </div>

                                    {/* Inline hidden input */}
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          processBulkEditImageUpload(item.id, e.target.files[0]);
                                        }
                                      }}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />

                                    {/* Loader overlay */}
                                    {(item.uploadStatus === 'compressing' || item.uploadStatus === 'uploading') && (
                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Name & SKU inputs */}
                                <td className="px-4 py-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="text" 
                                        required
                                        value={item.name}
                                        onChange={(e) => handleBulkEditChange(item.id, "name", e.target.value)}
                                        className="w-full px-2.5 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none font-bold text-gray-900 bg-transparent hover:bg-gray-50 focus:bg-white transition-all"
                                        placeholder="Name"
                                      />
                                      {modified && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 border border-green-200 text-green-700 uppercase tracking-wide shrink-0">
                                          Modified
                                        </span>
                                      )}
                                    </div>
                                    <input 
                                      type="text" 
                                      required
                                      value={item.sku}
                                      onChange={(e) => handleBulkEditChange(item.id, "sku", e.target.value)}
                                      className="w-1/2 px-2.5 py-0.5 border border-transparent rounded-lg text-xs focus:border-gray-200 outline-none font-mono font-bold text-gray-500 bg-transparent hover:bg-gray-50 focus:bg-white transition-all"
                                      placeholder="SKU"
                                    />
                                  </div>
                                </td>

                                {/* Category Dropdown */}
                                <td className="px-4 py-3">
                                  <Select 
                                    options={categories}
                                    value={item.category}
                                    onChange={(val) => handleBulkEditChange(item.id, "category", val)}
                                    allowCustom={true}
                                    placeholder="Category"
                                  />
                                </td>

                                {/* Pricing inline inputs */}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5 justify-center">
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-1 focus-within:ring-2 focus-within:ring-[#2E8C13]/20 focus-within:ring-offset-0 focus-within:border-[#2E8C13] transition-all w-1/2">
                                      <span className="text-gray-400 text-xs font-semibold select-none mr-0.5">₹</span>
                                      <input 
                                        type="number" 
                                        required
                                        value={item.purchase_price}
                                        onChange={(e) => handleBulkEditChange(item.id, "purchase_price", e.target.value)}
                                        className="w-full bg-transparent text-xs font-medium text-gray-600 outline-none text-center"
                                        placeholder="Cost"
                                        min="0"
                                      />
                                    </div>
                                    <div className="flex items-center bg-[#2E8C13]/5 border border-gray-200 rounded-lg px-1.5 py-1 focus-within:ring-2 focus-within:ring-[#2E8C13]/20 focus-within:ring-offset-0 focus-within:border-[#2E8C13] transition-all w-1/2">
                                      <span className="text-[#2E8C13] text-xs font-bold select-none mr-0.5">₹</span>
                                      <input 
                                        type="number" 
                                        required
                                        value={item.price}
                                        onChange={(e) => handleBulkEditChange(item.id, "price", e.target.value)}
                                        className="w-full bg-transparent text-xs font-bold text-[#2E8C13] outline-none text-center"
                                        placeholder="Sell"
                                        min="0"
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* Stock input & physical steppers */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentStock = Number(item.stock || 0);
                                        handleBulkEditChange(item.id, "stock", Math.max(0, currentStock - 1).toString());
                                      }}
                                      className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm shrink-0 shadow-sm"
                                    >
                                      -
                                    </button>
                                    <input 
                                      type="number" 
                                      required
                                      value={item.stock}
                                      onChange={(e) => handleBulkEditChange(item.id, "stock", e.target.value)}
                                      className={`w-16 px-1.5 py-1 border border-gray-200 rounded-lg text-sm text-center font-extrabold outline-none focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] ${
                                        Number(item.stock) === 0 ? "text-red-600 bg-red-50/20" : Number(item.stock) <= 15 ? "text-orange-600 bg-orange-50/20" : "text-gray-900"
                                      }`}
                                      placeholder="Qty"
                                      min="0"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentStock = Number(item.stock || 0);
                                        handleBulkEditChange(item.id, "stock", (currentStock + 1).toString());
                                      }}
                                      className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm shrink-0 shadow-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>

                                {/* Status Select Dropdown */}
                                <td className="px-4 py-3">
                                  <select
                                    value={item.status}
                                    onChange={(e) => handleBulkEditChange(item.id, "status", e.target.value)}
                                    className={`w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none font-bold ${
                                      item.status === 'Active' ? 'text-green-700 bg-green-50/30' :
                                      item.status === 'Low Stock' ? 'text-orange-700 bg-orange-50/30' :
                                      item.status === 'Inactive' ? 'text-gray-600 bg-gray-50' : 'text-red-700 bg-red-50/30'
                                    }`}
                                  >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                  </select>
                                </td>

                                {/* Delete Action Trash Icon */}
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  <button 
                                    type="button"
                                    onClick={() => handleBulkEditDelete(item)}
                                    className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all border border-transparent hover:border-rose-100 shadow-sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-white">
              <div className="text-xs text-gray-500 font-medium">
                {bulkEditProducts.filter(isProductModified).length > 0 && (
                  <span className="flex items-center gap-1.5 text-[#2E8C13] font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Ready to save changes for {bulkEditProducts.filter(isProductModified).length} products!
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setIsBulkEditOpen(false);
                    setBulkEditProducts([]);
                  }}
                  disabled={bulkEditLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={handleSaveBulkEdit}
                  disabled={
                    bulkEditLoading || 
                    bulkEditProducts.filter(isProductModified).length === 0 || 
                    bulkEditProducts.some(q => q.uploadStatus === 'compressing' || q.uploadStatus === 'uploading')
                  }
                  className="gap-2 font-bold transition-all px-6 py-2 bg-[#2E8C13] hover:bg-[#257310]"
                >
                  {bulkEditLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      Save {bulkEditProducts.filter(isProductModified).length} Modifications
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function GymMembershipsView() {
  const [plans, setPlans] = useState<any[]>([]);
  
  // Drawer visibility states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  // Filtering & search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form fields: Plans
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("1 Month");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("18");
  const [freezeAllowed, setFreezeAllowed] = useState(true);
  const [status, setStatus] = useState("Active");

  const loadData = () => {
    if (typeof window === "undefined") return;
    const savedPlans = localStorage.getItem("inba_gym_memberships");
    if (savedPlans) setPlans(JSON.parse(savedPlans));
  };

  useEffect(() => {
    loadData();
  }, []);

  const savePlans = (updated: any[]) => {
    localStorage.setItem("inba_gym_memberships", JSON.stringify(updated));
    setPlans(updated);
  };

  // Plans Handlers
  const handleOpenAdd = () => {
    setEditingPlan(null);
    setName("");
    setDuration("1 Month");
    setPrice("");
    setGst("18");
    setFreezeAllowed(true);
    setStatus("Active");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDuration(plan.duration);
    setPrice(plan.price.toString());
    setGst(plan.gst.toString());
    setFreezeAllowed(plan.freezeAllowed);
    setStatus(plan.status);
    setIsAddOpen(true);
  };

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const planPrice = Number(price);
    const planGst = Number(gst);

    if (editingPlan) {
      const updated = plans.map(p => p.id === editingPlan.id ? {
        ...p, name, duration, price: planPrice, gst: planGst, freezeAllowed, status
      } : p);
      savePlans(updated);
      alert("Plan specifications modified successfully!");
    } else {
      const newId = `GYM-PLN-${100 + plans.length + 1}`;
      const newPlan = {
        id: newId, name, duration, price: planPrice, gst: planGst, freezeAllowed, status
      };
      savePlans([...plans, newPlan]);
      alert("Membership Plan published successfully!");
    }
    setIsAddOpen(false);
  };

  const handleDeletePlan = (planId: string, planName: string) => {
    const confirm = window.confirm(`Are you sure you want to delete the plan "${planName}"?`);
    if (!confirm) return;
    savePlans(plans.filter(p => p.id !== planId));
  };

  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [plans, search, statusFilter]);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Membership Plans Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Configure fitness studio subscription packages, rates, and validity policies.</p>
        </div>
        
        <Button className="gap-2 font-semibold bg-[#2E8C13] hover:bg-[#257310] text-white" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          Add Membership Plan
        </Button>
      </div>

      {/* Dynamic Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all bg-white">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Plans</p>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">{plans.filter(p => p.status === "Active").length}</h3>
          </div>
          <div className="p-3 bg-green-50 text-[#2E8C13] rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all bg-white">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Packages</p>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">{plans.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all bg-white">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Conversion Rate</p>
            <h3 className="text-2xl font-bold tracking-tight text-purple-600">88.4%</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all bg-white">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tax Standard</p>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">18% <span className="text-xs text-gray-400 font-semibold">GST</span></h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs bg-white">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search plans by name or catalog ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none cursor-pointer focus:border-[#2E8C13]"
          >
            <option value="All">All Plans</option>
            <option value="Active">Active only</option>
            <option value="Inactive">Inactive only</option>
          </select>
        </div>
      </Card>

      {/* Membership Plans Table View */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm animate-in fade-in duration-250 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/60 border-y border-gray-200/60">
                <th className="p-3 pl-6 text-[11px] font-bold text-gray-500 tracking-wider uppercase">Plan ID</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase">Plan Name</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase">Duration</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase">Base Price</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase">Tax Details</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase">Freeze Policy</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase">Status</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 tracking-wider uppercase text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan: any) => (
                  <tr key={plan.id} className="hover:bg-gray-50/40 transition-colors group">
                    <td className="p-3 pl-6 font-mono text-xs font-semibold text-gray-400">{plan.id}</td>
                    <td className="p-3 text-sm font-semibold text-gray-800">{plan.name}</td>
                    <td className="p-3 text-xs text-gray-600 font-semibold">{plan.duration}</td>
                    <td className="p-3 text-sm font-bold text-[#2E8C13]">₹{plan.price.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-xs text-gray-500 font-medium">{plan.gst}% GST included</td>
                    <td className="p-3 text-xs font-semibold">
                      <span className={plan.freezeAllowed ? "text-green-600" : "text-gray-400 font-normal"}>
                        {plan.freezeAllowed ? "Freeze Allowed" : "Not Allowed"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        plan.status === "Active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-3 whitespace-nowrap">
                      <button 
                        onClick={() => handleOpenEdit(plan)}
                        className="text-xs font-bold text-[#2E8C13] hover:underline cursor-pointer"
                      >
                        Edit Specs
                      </button>
                      <button 
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-gray-400 font-semibold uppercase">
                    No membership plans configured matching this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Plan Drawer form */}
      <Drawer isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={editingPlan ? "Modify Plan Specifications" : "Publish New Plan Offer"}>
        <form className="space-y-4 font-sans" onSubmit={handleSubmitPlan}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Plan / Package Name</label>
              <input 
                required 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Quarterly Plan"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Validity Duration</label>
                <select 
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg outline-none text-gray-900 font-semibold text-sm"
                >
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">GST Tax Rate (%)</label>
                <select 
                  value={gst}
                  onChange={e => setGst(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg outline-none text-gray-900 font-semibold text-sm"
                >
                  <option value="18">18% GST (Standard)</option>
                  <option value="12">12% GST</option>
                  <option value="0">0% Exempt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price (INR)</label>
                <input 
                  required 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 7999"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Offering Status</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg outline-none text-gray-900 font-semibold text-sm"
                >
                  <option value="Active">Active (Publish)</option>
                  <option value="Inactive">Inactive (Draft)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={freezeAllowed}
                  onChange={e => setFreezeAllowed(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary/20"
                />
                Allow Members to Freeze this Plan validity
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">
              {editingPlan ? "Update Plan" : "Publish Offer"}
            </Button>
          </div>
        </form>
      </Drawer>

    </div>
  );
}
