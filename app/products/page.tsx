"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { usePlatform } from "@/lib/PlatformContext";
import { 
  Plus, Search, Package, Coins, Sliders, AlertCircle, ShoppingBag, CheckCircle2, Award
} from "lucide-react";

export default function ProductsPage() {
  const { platform } = usePlatform();
  const [supplements, setSupplements] = useState<any[]>([]);
  
  // Drawer states
  const [isAddSuppOpen, setIsAddSuppOpen] = useState(false);
  const [editingSupp, setEditingSupp] = useState<any>(null);
  
  // Search & Filter
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Form fields
  const [suppName, setSuppName] = useState("");
  const [suppSku, setSuppSku] = useState("");
  const [suppCategory, setSuppCategory] = useState("Supplements");
  const [suppPrice, setSuppPrice] = useState("");
  const [suppStock, setSuppStock] = useState("");
  const [suppUnitsSold, setSuppUnitsSold] = useState("0");

  const loadData = () => {
    if (typeof window === "undefined") return;
    const savedSupps = localStorage.getItem("inba_gym_products");
    if (savedSupps) {
      setSupplements(JSON.parse(savedSupps));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveSupplements = (updated: any[]) => {
    localStorage.setItem("inba_gym_products", JSON.stringify(updated));
    setSupplements(updated);
  };

  // Handlers
  const handleOpenAddSupp = () => {
    setEditingSupp(null);
    setSuppName("");
    setSuppSku("");
    setSuppCategory("Supplements");
    setSuppPrice("");
    setSuppStock("");
    setSuppUnitsSold("0");
    setIsAddSuppOpen(true);
  };

  const handleOpenEditSupp = (supp: any) => {
    setEditingSupp(supp);
    setSuppName(supp.name);
    setSuppSku(supp.sku);
    setSuppCategory(supp.category);
    setSuppPrice(supp.price.toString());
    setSuppStock(supp.stock.toString());
    setSuppUnitsSold(supp.unitsSold.toString());
    setIsAddSuppOpen(true);
  };

  const handleSubmitSupp = (e: React.FormEvent) => {
    e.preventDefault();
    const priceVal = Number(suppPrice);
    const stockVal = Number(suppStock);
    const soldVal = Number(suppUnitsSold);
    const revVal = soldVal * priceVal;

    if (editingSupp) {
      const updated = supplements.map(s => s.id === editingSupp.id ? {
        ...s, name: suppName, sku: suppSku, category: suppCategory, price: priceVal, stock: stockVal, unitsSold: soldVal, revenue: revVal
      } : s);
      saveSupplements(updated);
      alert("Retail Product stock card modified successfully!");
    } else {
      const newId = `GYM-PROD-${100 + supplements.length + 1}`;
      const newSupp = {
        id: newId, name: suppName, sku: suppSku, category: suppCategory, price: priceVal, stock: stockVal, unitsSold: soldVal, revenue: revVal
      };
      saveSupplements([...supplements, newSupp]);
      alert("Retail Product added to Supplements Store successfully!");
    }
    setIsAddSuppOpen(false);
  };

  const handleDeleteSupp = (suppId: string, suppName: string) => {
    const confirm = window.confirm(`Are you sure you want to delete "${suppName}" from shop inventory?`);
    if (!confirm) return;
    saveSupplements(supplements.filter(s => s.id !== suppId));
  };

  // Memos for filtering
  const filteredSupps = useMemo(() => {
    return supplements.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.sku.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === "All" || s.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [supplements, search, categoryFilter]);

  const totalStockCount = useMemo(() => supplements.reduce((sum: number, s: any) => sum + (s.stock || 0), 0), [supplements]);
  const outOfStockCount = useMemo(() => supplements.filter((s: any) => (s.stock || 0) === 0).length, [supplements]);
  const totalStoreSalesVal = useMemo(() => supplements.reduce((sum: number, s: any) => sum + (s.revenue || 0), 0), [supplements]);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Supplements & Products Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Configure retail stock, price tags, and monitor total items sold inside the gym store.</p>
        </div>
        
        <Button className="gap-2 font-semibold bg-[#2E8C13] hover:bg-[#257310] text-white" onClick={handleOpenAddSupp}>
          <Plus className="w-4 h-4" />
          Add Retail Product
        </Button>
      </div>

      {/* Dynamic Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all bg-white">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Stock</p>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">{totalStockCount} <span className="text-xs text-gray-400 font-semibold">units</span></h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all bg-white">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Out of Stock</p>
            <h3 className="text-2xl font-bold tracking-tight text-red-600">{outOfStockCount} <span className="text-xs text-gray-400 font-semibold">items</span></h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all bg-white">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Sales Volume</p>
            <h3 className="text-2xl font-bold tracking-tight text-emerald-600">₹{totalStoreSalesVal.toLocaleString("en-IN")}</h3>
          </div>
          <div className="p-3 bg-green-50 text-[#2E8C13] rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all bg-white">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Distinct Products</p>
            <h3 className="text-2xl font-bold tracking-tight text-purple-600">{supplements.length}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs bg-white">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products by name, SKU or catalog ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none cursor-pointer focus:border-[#2E8C13]"
          >
            <option value="All">All Categories</option>
            <option value="Supplements">Supplements</option>
            <option value="Accessories">Accessories</option>
            <option value="Apparel">Apparel</option>
          </select>
        </div>
      </Card>

      {/* Supplements & Products Table */}
      <Card className="overflow-hidden border border-gray-100 shadow-xs animate-in fade-in duration-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-gray-50/60 border-y border-gray-200/60 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 pl-6">Catalog ID & SKU</th>
                <th className="p-3">Product / Item Name</th>
                <th className="p-3">Store Category</th>
                <th className="p-3">Retail Price</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Units Sold</th>
                <th className="p-3">Store Revenue</th>
                <th className="p-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs font-medium text-gray-600">
              {filteredSupps.length > 0 ? (
                filteredSupps.map((supp: any) => {
                  const isOutOfStock = (supp.stock || 0) === 0;
                  const isLowStock = (supp.stock || 0) <= 10 && (supp.stock || 0) > 0;
                  
                  return (
                    <tr key={supp.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-3 pl-6">
                        <span className="font-semibold text-gray-800 block">{supp.id}</span>
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{supp.sku}</span>
                      </td>
                      <td className="p-3 text-sm font-semibold text-gray-800">{supp.name}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          supp.category === "Supplements" ? "bg-emerald-50 text-emerald-700 border-emerald-150" :
                          supp.category === "Apparel" ? "bg-indigo-50 text-indigo-700 border-indigo-150" :
                          "bg-amber-50 text-amber-700 border-amber-150"
                        }`}>
                          {supp.category}
                        </span>
                      </td>
                      <td className="p-3 text-sm font-semibold text-gray-800">₹{supp.price.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">{supp.stock} units</span>
                          <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                            isOutOfStock ? "bg-rose-50 text-rose-700 border border-rose-150" :
                            isLowStock ? "bg-amber-50 text-amber-700 border border-amber-150 animate-pulse" :
                            "bg-green-50 text-green-700 border border-green-150"
                          }`}>
                            {isOutOfStock ? "Out of stock" : isLowStock ? "Low stock" : "In stock"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-500 font-normal">{supp.unitsSold || 0} sold</td>
                      <td className="p-3 text-sm font-bold text-[#2E8C13]">₹{(supp.revenue || 0).toLocaleString("en-IN")}</td>
                      <td className="p-4 pr-6 text-right space-x-3 whitespace-nowrap">
                        <button 
                          onClick={() => handleOpenEditSupp(supp)}
                          className="text-xs font-bold text-[#2E8C13] hover:underline cursor-pointer"
                        >
                          Edit Item
                        </button>
                        <button 
                          onClick={() => handleDeleteSupp(supp.id, supp.name)}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-sm text-gray-400 font-medium bg-gray-50/20">
                    No retail products registered matching these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Supplements & Retail Product Drawer */}
      <Drawer isOpen={isAddSuppOpen} onClose={() => setIsAddSuppOpen(false)} title={editingSupp ? "Modify Retail Product Specifications" : "Register New Product Stock"}>
        <form className="space-y-4 font-sans" onSubmit={handleSubmitSupp}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
              <input 
                required 
                type="text" 
                value={suppName}
                onChange={(e) => setSuppName(e.target.value)}
                placeholder="e.g. Whey Protein Isolate (2kg)"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product SKU / Code</label>
                <input 
                  required 
                  type="text" 
                  value={suppSku}
                  onChange={(e) => setSuppSku(e.target.value)}
                  placeholder="e.g. GYM-WHEY-01"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select 
                  value={suppCategory}
                  onChange={e => setSuppCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg outline-none text-gray-900 font-semibold text-sm cursor-pointer"
                >
                  <option value="Supplements">Supplements</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Apparel">Apparel</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Retail Price (INR)</label>
                <input 
                  required 
                  type="number" 
                  value={suppPrice}
                  onChange={(e) => setSuppPrice(e.target.value)}
                  placeholder="e.g. 5499"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">In Stock Qty</label>
                <input 
                  required 
                  type="number" 
                  value={suppStock}
                  onChange={(e) => setSuppStock(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Units Sold</label>
                <input 
                  required 
                  type="number" 
                  value={suppUnitsSold}
                  onChange={(e) => setSuppUnitsSold(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddSuppOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">
              {editingSupp ? "Update Product" : "Publish Stock"}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
