"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Save, Building2, Printer, UploadCloud, Tags, Users, Plus, Trash2, Edit2, MoveRight } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/Select";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  
  // Category State
  const [categories, setCategories] = useState([
    { id: 1, name: "Herbal", count: 24 },
    { id: 2, name: "Cosmetic", count: 12 },
    { id: 3, name: "Grocery", count: 56 },
    { id: 4, name: "Wellness", count: 8 },
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [viewingCategory, setViewingCategory] = useState<any>(null);

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([...categories, { id: Date.now(), name: newCategory, count: 0 }]);
    setNewCategory("");
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
        <Button className="gap-2" onClick={() => alert("Settings Saved!")}>
          <Save className="w-4 h-4" />
          Save Changes
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
                  <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-400">LOGO</span>
                  </div>
                  <div>
                    <Button variant="outline" className="gap-2">
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
                      <input type="text" defaultValue="Inba Essential" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST / Tax ID</label>
                      <input type="text" defaultValue="33ABCDE1234F1Z5" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Official Return Address</label>
                    <textarea rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" defaultValue={"Inba Essentials Pvt Ltd.\n123 Green Valley Tech Park\nChennai, Tamil Nadu 600001"}></textarea>
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
                      <label className="cursor-pointer">
                        <input type="radio" name="paper" className="peer sr-only" defaultChecked />
                        <div className="p-4 border border-gray-200 rounded-xl peer-checked:border-primary peer-checked:bg-primary/5 text-center transition-all">
                          <div className="font-semibold text-gray-900">Standard A4</div>
                          <div className="text-xs text-gray-500 mt-1">Full page laser</div>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name="paper" className="peer sr-only" />
                        <div className="p-4 border border-gray-200 rounded-xl peer-checked:border-primary peer-checked:bg-primary/5 text-center transition-all">
                          <div className="font-semibold text-gray-900">A5 Format</div>
                          <div className="text-xs text-gray-500 mt-1">Half page packing</div>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name="paper" className="peer sr-only" />
                        <div className="p-4 border border-gray-200 rounded-xl peer-checked:border-primary peer-checked:bg-primary/5 text-center transition-all">
                          <div className="font-semibold text-gray-900">Thermal 80mm</div>
                          <div className="text-xs text-gray-500 mt-1">Receipt printers</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded text-primary focus:ring-primary" defaultChecked />
                      <span className="text-sm text-gray-700">Include Company Logo on Slips</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded text-primary focus:ring-primary" defaultChecked />
                      <span className="text-sm text-gray-700">Include Return Address</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded text-primary focus:ring-primary" />
                      <span className="text-sm text-gray-700">Print Prices on Packing Slips (Not Recommended)</span>
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
                      onClick={() => setViewingCategory(cat)}
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
                            setCategories(categories.filter(c => c.id !== cat.id));
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
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {viewingCategory.name}
                  <button className="text-gray-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                </h3>
                <p className="text-sm text-gray-500 mt-1">{viewingCategory.count} active products</p>
              </div>
              <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Category
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h4 className="text-sm font-semibold text-gray-900">Linked Products</h4>
                <div className="text-xs text-gray-500">Showing {Math.min(viewingCategory.count, 3)} of {viewingCategory.count}</div>
              </div>
              
              {viewingCategory.count > 0 ? (
                <div className="divide-y divide-gray-100">
                  {/* Mock Product Items */}
                  {[1, 2, 3].slice(0, viewingCategory.count).map((item) => (
                    <div key={item} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Product Sample {item}</p>
                          <p className="text-xs text-gray-500">SKU: SMPL-{item}00</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select 
                          options={categories.map(c => c.name).filter(n => n !== viewingCategory.name)}
                          value=""
                          onChange={(newCat) => alert(`Moved to ${newCat}`)}
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
            
            {viewingCategory.count > 3 && (
              <Button variant="outline" className="w-full">View all in Inventory</Button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
