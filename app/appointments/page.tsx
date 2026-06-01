"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { usePlatform } from "@/lib/PlatformContext";
import { useToast } from "@/components/ui/Toast";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  UserPlus,
  BellRing,
  MoreHorizontal
} from "lucide-react";

export default function AppointmentsPage() {
  const { platform } = usePlatform();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"calendar" | "queue">("queue");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [formPatientName, setFormPatientName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formDoctor, setFormDoctor] = useState("Dr. Sharma (General)");
  const [formPurpose, setFormPurpose] = useState("General Checkup");

  const loadData = () => {
    const saved = localStorage.getItem("inba_clinic_appointments");
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveAppointments = (updated: any[]) => {
    localStorage.setItem("inba_clinic_appointments", JSON.stringify(updated));
    setAppointments(updated);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientName.trim() || !formDate || !formTime) {
      toast("Please fill all required fields.", "error");
      return;
    }

    const newApp = {
      id: `APT-${Date.now()}`,
      patientId: `PAT-${Date.now()}`, // mock
      patientName: formPatientName.trim(),
      patientMobile: "+91 0000000000",
      date: formDate,
      time: formTime,
      doctor: formDoctor,
      purpose: formPurpose,
      status: "Booked"
    };

    saveAppointments([newApp, ...appointments]);
    setFormPatientName("");
    setFormDate("");
    setFormTime("");
    setIsAddDrawerOpen(false);
    toast("Appointment successfully booked!", "success");
  };

  const updateStatus = (id: string, newStatus: string) => {
    const updated = appointments.map(a => a.id === id ? { ...a, status: newStatus } : a);
    saveAppointments(updated);
    toast(`Appointment marked as ${newStatus}`, "success");
  };

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const filteredApps = useMemo(() => {
    return appointments.filter(a => {
      const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      // In queue view, only show today's appointments
      const matchesDate = activeTab === "queue" ? a.date === todayStr : true;
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, searchTerm, statusFilter, activeTab, todayStr]);

  if (platform !== "clinic") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-gray-50/50 p-8 rounded-2xl border border-dashed border-gray-200">
        <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Access Locked</h2>
        <p className="text-sm text-gray-500 max-w-sm text-center mt-2 leading-relaxed">
          The **Appointments** module is specialized for the Clinic Services platform.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            Appointments & Queue
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage schedules, live patient queue, and follow-ups.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2 font-semibold" onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2 mb-4">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 outline-none ${
            activeTab === "queue"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Clock className="w-4 h-4" /> Today's Queue
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 outline-none ${
            activeTab === "calendar"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <CalendarIcon className="w-4 h-4" /> All Appointments
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-sm text-gray-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Booked">Booked</option>
            <option value="Checked In">Checked In</option>
            <option value="Waiting">Waiting</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>
        </div>
      </Card>

      {/* Primary View */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {filteredApps.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="p-4 pl-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Doctor & Purpose</th>
                  {activeTab === "calendar" && (
                    <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  )}
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 pl-6 text-sm font-bold text-gray-900">{app.time}</td>
                    <td className="p-4">
                      <p className="text-[14px] font-semibold text-primary">{app.patientName}</p>
                      <span className="text-[11px] font-medium text-gray-500">{app.patientMobile}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-[13px] font-semibold text-gray-800">{app.doctor}</p>
                      <span className="text-[11px] font-medium text-gray-500">{app.purpose}</span>
                    </td>
                    {activeTab === "calendar" && (
                      <td className="p-4 text-sm text-gray-600 font-medium">{app.date}</td>
                    )}
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={e => updateStatus(app.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer outline-none ${
                          app.status === "Completed" ? "bg-green-50 text-green-700 border-green-100" :
                          app.status === "Waiting" || app.status === "Checked In" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          app.status === "Cancelled" || app.status === "No Show" ? "bg-red-50 text-red-700 border-red-100" :
                          "bg-blue-50 text-blue-700 border-blue-100"
                        }`}
                      >
                        <option value="Booked">Booked</option>
                        <option value="Checked In">Checked In</option>
                        <option value="Waiting">Waiting</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                      </select>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            toast(`Reminder sent to ${app.patientName}`, "success");
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Send Reminder"
                        >
                          <BellRing className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, "Completed")}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Mark Completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 min-h-[300px]">
              <CalendarIcon className="w-8 h-8 stroke-[1.5] text-gray-300 mb-2" />
              <p className="text-sm font-medium">No appointments found.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Book Appointment Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Book New Appointment">
        <form className="space-y-4" onSubmit={handleCreateAppointment}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Patient Name</label>
              <input 
                required 
                type="text" 
                value={formPatientName}
                onChange={e => setFormPatientName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Date</label>
                <input 
                  required 
                  type="date" 
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Time</label>
                <input 
                  required 
                  type="time" 
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Consulting Doctor</label>
                <select
                  value={formDoctor}
                  onChange={e => setFormDoctor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  <option value="Dr. Sharma (General)">Dr. Sharma (General)</option>
                  <option value="Dr. Patel (Pediatrics)">Dr. Patel (Pediatrics)</option>
                  <option value="Dr. Reddy (Ortho)">Dr. Reddy (Ortho)</option>
                  <option value="Dr. Verma (Derma)">Dr. Verma (Derma)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Purpose</label>
                <input 
                  required 
                  type="text" 
                  value={formPurpose}
                  onChange={e => setFormPurpose(e.target.value)}
                  placeholder="e.g. General Checkup"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                />
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Book Appointment</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
