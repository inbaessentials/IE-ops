"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Save, Building2, Printer, UploadCloud, Tags, Users, Plus, Trash2, Edit2, MoveRight } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/Select";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(false);

  // Store/Company Settings States
  const [companyName, setCompanyName] = useState("Inba Essentials");
  const [gstIn, setGstIn] = useState("33ABCDE1234F1Z5");
  const [returnAddress, setReturnAddress] = useState("Inba Essentials Pvt Ltd.\nOpp. to Annamar Petrol Bunk, Housing Unit,\nMoolapalayam, Erode, Tamil Nadu 638002");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Print Settings States
  const [paperFormat, setPaperFormat] = useState("Standard A4");
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeAddress, setIncludeAddress] = useState(true);
  const [printPrices, setPrintPrices] = useState(false);

  // Category State
  const [categories, setCategories] = useState([
    { id: 1, name: "Herbal", count: 24 },
    { id: 2, name: "Cosmetic", count: 12 },
    { id: 3, name: "Grocery", count: 56 },
    { id: 4, name: "Wellness", count: 8 },
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  
  // Category Editing States
  const [isEditingCategoryName, setIsEditingCategoryName] = useState(false);
  const [editCategoryNameValue, setEditCategoryNameValue] = useState("");
  const [activeCategoryProducts, setActiveCategoryProducts] = useState<string[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    
    // First, load from localStorage instantly
    const localDataStr = localStorage.getItem("inba_settings");
    if (localDataStr) {
      try {
        const localData = JSON.parse(localDataStr);
        setCompanyName(localData.company_name || "Inba Essentials");
        setGstIn(localData.gst_in || "33ABCDE1234F1Z5");
        setReturnAddress(localData.return_address || "Inba Essentials Pvt Ltd.\nOpp. to Annamar Petrol Bunk, Housing Unit,\nMoolapalayam, Erode, Tamil Nadu 638002");
        setLogoUrl(localData.logo_url || null);
        setPaperFormat(localData.paper_format || "Standard A4");
        setIncludeLogo(localData.include_logo !== false);
        setIncludeAddress(localData.include_address !== false);
        setPrintPrices(!!localData.print_prices);
      } catch (e) {
        console.error("Failed to parse local settings", e);
      }
    }

    // Then try syncing from Supabase
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "default")
        .single();

      if (data && !error) {
        setCompanyName(data.company_name);
        setGstIn(data.gst_in);
        setReturnAddress(data.return_address);
        setLogoUrl(data.logo_url);
        setPaperFormat(data.paper_format);
        setIncludeLogo(data.include_logo);
        setIncludeAddress(data.include_address);
        setPrintPrices(data.print_prices);
        
        localStorage.setItem("inba_settings", JSON.stringify(data));
      }
    } catch (e) {
      console.error("Supabase settings fetch failed", e);
    }
    
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const settingsObj = {
      company_name: companyName,
      gst_in: gstIn,
      return_address: returnAddress,
      logo_url: logoUrl,
      paper_format: paperFormat,
      include_logo: includeLogo,
      include_address: includeAddress,
      print_prices: printPrices,
      updated_at: new Date().toISOString()
    };

    // Always save to localStorage first
    localStorage.setItem("inba_settings", JSON.stringify(settingsObj));

    // Try saving to Supabase
    const { error } = await supabase
      .from("settings")
      .update(settingsObj)
      .eq("id", "default");

    setLoading(false);
    if (!error) {
      toast("Settings Saved!", "success");
    } else {
      toast("Settings saved locally! (Run Supabase SQL migration to sync cloud)", "success");
      console.warn("Supabase save failed, fallback to local storage active.", error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      toast("Compressing logo...", "info");

      const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 400;
              const MAX_HEIGHT = 150;
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
                  resolve(new File([blob], file.name, { type: "image/png" }));
                } else {
                  reject(new Error("Compression failed"));
                }
              }, "image/png");
            };
          };
        });
      };

      try {
        const compressedFile = await compressImage(file);
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `logo-${Math.random()}.${fileExt}`;
        
        toast("Uploading logo...", "info");
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, compressedFile);

        if (uploadError) {
          toast("Logo upload failed", "error");
          console.error(uploadError);
        } else {
          const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
          setLogoUrl(data.publicUrl);
          toast("Logo uploaded!", "success");
        }
      } catch (err) {
        toast("Failed to compress logo", "error");
      }
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([...categories, { id: Date.now(), name: newCategory, count: 0 }]);
    setNewCategory("");
  };

  const handleRenameCategory = () => {
    if (!editCategoryNameValue.trim() || !viewingCategory) return;
    const newName = editCategoryNameValue.trim();
    
    setCategories(categories.map(c => 
      c.id === viewingCategory.id ? { ...c, name: newName } : c
    ));
    
    setViewingCategory({ ...viewingCategory, name: newName });
    setIsEditingCategoryName(false);
    toast("Category renamed successfully!", "success");
  };

  const handleDeleteCategory = (catId: number, catName: string) => {
    setCategories(categories.filter(c => c.id !== catId));
    setViewingCategory(null);
    toast(`Category "${catName}" deleted`, "error");
  };

  const handleMoveProductCategory = (prodName: string, targetCatName: string) => {
    if (!viewingCategory) return;
    
    setCategories(categories.map(c => {
      if (c.id === viewingCategory.id) {
        return { ...c, count: Math.max(0, c.count - 1) };
      }
      if (c.name === targetCatName) {
        return { ...c, count: c.count + 1 };
      }
      return c;
    }));
    
    setViewingCategory({
      ...viewingCategory,
      count: Math.max(0, viewingCategory.count - 1)
    });
    
    setActiveCategoryProducts(activeCategoryProducts.filter(p => p !== prodName));
    toast(`Successfully moved "${prodName}" to category "${targetCatName}"`, "success");
  };

  const tabs = [
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "print", label: "Print Templates", icon: Printer },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "users", label: "Users & Roles", icon: Users },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your system configurations and master data.</p>
        </div>
        <Button className="gap-2" onClick={handleSaveSettings} disabled={loading}>
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-md" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-gray-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "company" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card>
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Brand Logo</h2>
                  <p className="text-sm text-gray-500 mt-1">This logo will appear on all your invoices and packing slips.</p>
                </div>
                <div className="p-6 flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Store Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-sm font-bold text-gray-400">LOGO</span>
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="w-4 h-4" />
                      Upload New Logo
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">Recommended size: 400x100px (PNG or JPG)</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Official details used for billing and return addresses.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input 
                        type="text" 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST / Tax ID</label>
                      <input 
                        type="text" 
                        value={gstIn} 
                        onChange={(e) => setGstIn(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-medium" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Official Return Address</label>
                    <textarea 
                      rows={3} 
                      value={returnAddress} 
                      onChange={(e) => setReturnAddress(e.target.value)} 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-medium" 
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "print" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Print Slip Templates</h2>
                    <p className="text-sm text-gray-500 mt-1">Configure how your printed documents look.</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Printer className="w-4 h-4" />
                    Preview Slip
                  </Button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Paper Format</label>
                    <div className="grid grid-cols-3 gap-4">
                      {["Standard A4", "A5 Format", "Thermal 80mm"].map((fmt) => (
                        <label key={fmt} className="cursor-pointer" onClick={() => setPaperFormat(fmt)}>
                          <input 
                            type="radio" 
                            name="paper" 
                            className="peer sr-only" 
                            checked={paperFormat === fmt} 
                            onChange={() => {}} 
                          />
                          <div className="p-4 border border-gray-200 rounded-xl peer-checked:border-primary peer-checked:bg-primary/5 text-center transition-all">
                            <div className="font-semibold text-gray-900">{fmt}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {fmt === "Standard A4" ? "Full page laser" : 
                               fmt === "A5 Format" ? "Half page packing" : "Receipt printers"}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeLogo} 
                        onChange={(e) => setIncludeLogo(e.target.checked)} 
                        className="w-5 h-5 rounded text-primary focus:ring-primary" 
                      />
                      <span className="text-sm text-gray-700 font-medium">Include Company Logo on Slips</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeAddress} 
                        onChange={(e) => setIncludeAddress(e.target.checked)} 
                        className="w-5 h-5 rounded text-primary focus:ring-primary" 
                      />
                      <span className="text-sm text-gray-700 font-medium">Include Return Address</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={printPrices} 
                        onChange={(e) => setPrintPrices(e.target.checked)} 
                        className="w-5 h-5 rounded text-primary focus:ring-primary" 
                      />
                      <span className="text-sm text-gray-700 font-medium">Print Prices on Packing Slips (Not Recommended)</span>
                    </label>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card>
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Category Management</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage product categories used across inventory and analytics.</p>
                </div>
                
                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex gap-3">
                  <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category name..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Category
                  </Button>
                </div>

                <div className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <div 
                      key={cat.id} 
                      onClick={() => {
                        setViewingCategory(cat);
                        setIsEditingCategoryName(false);
                        setEditCategoryNameValue(cat.name);
                        
                        const mockProds = [];
                        const limit = Math.min(cat.count, 6);
                        for (let i = 1; i <= limit; i++) {
                          mockProds.push(`Product Sample ${i}`);
                        }
                        setActiveCategoryProducts(mockProds);
                      }}
                      className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Tags className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{cat.name}</p>
                          <p className="text-xs text-gray-500">{cat.count} products linked</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="opacity-0 group-hover:opacity-100 transition-opacity">View Details</Badge>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(cat.id, cat.name);
                          }}
                          className="text-gray-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card>
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Staff & Role Management</h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This feature is currently in development. Soon you will be able to invite staff members and restrict their access based on roles (e.g. Packer, Manager, Admin).
                  </p>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>

      {/* Category Details Drawer */}
      <Drawer isOpen={!!viewingCategory} onClose={() => setViewingCategory(null)} title="Category Details">
        {viewingCategory && (
          <div className="space-y-6 pb-20">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Master Category</p>
                {isEditingCategoryName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="text" 
                      value={editCategoryNameValue} 
                      onChange={(e) => setEditCategoryNameValue(e.target.value)} 
                      className="px-3 py-1 border border-gray-200 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleRenameCategory()}
                    />
                    <Button size="sm" onClick={handleRenameCategory}>Save</Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600" onClick={() => setIsEditingCategoryName(false)}>Cancel</Button>
                  </div>
                ) : (
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {viewingCategory.name}
                    <button 
                      onClick={() => {
                        setIsEditingCategoryName(true);
                        setEditCategoryNameValue(viewingCategory.name);
                      }}
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </h3>
                )}
                <p className="text-sm text-gray-500 mt-1">{viewingCategory.count} active products</p>
              </div>
              <Button 
                variant="outline" 
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={() => handleDeleteCategory(viewingCategory.id, viewingCategory.name)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Category
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h4 className="text-sm font-semibold text-gray-900">Linked Products</h4>
                <div className="text-xs text-gray-500">Showing {Math.min(activeCategoryProducts.length, 3)} of {activeCategoryProducts.length}</div>
              </div>
              
              {activeCategoryProducts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {activeCategoryProducts.slice(0, 3).map((item, index) => (
                    <div key={item} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-bold">PROD</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item}</p>
                          <p className="text-xs text-gray-500">SKU: SMPL-{(index + 1) * 100}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select 
                          options={categories.map(c => c.name).filter(n => n !== viewingCategory.name)}
                          value=""
                          onChange={(newCat) => handleMoveProductCategory(item, newCat)}
                          placeholder="Move to..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500 text-sm">
                  No products linked to this category yet.
                </div>
              )}
            </div>
            
            {activeCategoryProducts.length > 3 && (
              <Button variant="outline" className="w-full">View all in Inventory</Button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
