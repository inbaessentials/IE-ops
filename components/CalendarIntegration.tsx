"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Filter, 
  RefreshCw,
  Video,
  User,
  Users,
  Repeat,
  Bell,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type ConnectionState = "disconnected" | "syncing" | "connected";
type CalendarView = "month" | "week" | "day";

const MOCK_EVENTS = [
  { id: 1, title: "Cohort 12 Live Session", type: "course", date: "2026-05-31", time: "10:00 AM", duration: "2h", owner: "Sarah Staff", status: "scheduled", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: 2, title: "1:1 Coaching - Rahul", type: "coaching", date: "2026-05-31", time: "02:00 PM", duration: "1h", owner: "Admin User", status: "scheduled", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: 3, title: "Follow-up: Priya (Lead)", type: "followup", date: "2026-06-01", time: "11:30 AM", duration: "30m", owner: "Sarah Staff", status: "pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: 4, title: "Membership Renewal Calls", type: "renewal", date: "2026-06-02", time: "04:00 PM", duration: "1h", owner: "Admin User", status: "scheduled", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: 5, title: "Staff Sync Meeting", type: "appointment", date: "2026-06-03", time: "09:00 AM", duration: "45m", owner: "Admin User", status: "scheduled", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export default function CalendarIntegration() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [view, setView] = useState<CalendarView>("week");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters State
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  const handleConnect = () => {
    setConnectionState("syncing");
    setTimeout(() => {
      setConnectionState("connected");
    }, 2000);
  };

  const renderDisconnected = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <CalendarIcon className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Google Calendar</h2>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
        Sync your live classes, coaching sessions, appointments, and reminders directly into your business dashboard. Get a full operational picture in one place.
      </p>
      <div className="flex gap-4">
        <Button variant="primary" onClick={handleConnect} className="gap-2 px-6">
          <CalendarIcon className="w-4 h-4" /> Connect Calendar
        </Button>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Video className="w-5 h-5 text-gray-700 mb-2" />
          <h4 className="font-semibold text-gray-900 text-sm">Live Classes</h4>
          <p className="text-xs text-gray-500 mt-1">Automatically schedule and track cohort sessions.</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <User className="w-5 h-5 text-gray-700 mb-2" />
          <h4 className="font-semibold text-gray-900 text-sm">Appointments</h4>
          <p className="text-xs text-gray-500 mt-1">Manage 1:1 coaching and student follow-ups.</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Repeat className="w-5 h-5 text-gray-700 mb-2" />
          <h4 className="font-semibold text-gray-900 text-sm">Renewals</h4>
          <p className="text-xs text-gray-500 mt-1">Stay on top of upcoming expiring memberships.</p>
        </div>
      </div>
    </div>
  );

  const renderSyncing = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-6" />
      <h2 className="text-lg font-bold text-gray-900 mb-2">Syncing your calendar...</h2>
      <p className="text-sm text-gray-500">Securely fetching events, appointments, and schedules.</p>
    </div>
  );

  const renderConnected = () => {
    // Generate dates for current week view dynamically
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Start on Monday
    
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    const isToday = (d: Date) => d.toDateString() === today.toDateString();

    const getEventsForDate = (date: Date) => {
      const dateStr = date.toISOString().split("T")[0];
      return MOCK_EVENTS.filter(e => {
        if (eventTypeFilter !== "all" && e.type !== eventTypeFilter) return false;
        return e.date === dateStr || (dateStr === "2026-05-31" && e.date === "2026-05-31"); // simple mock fallback
      });
    };

    return (
      <div className="animate-in fade-in duration-500">
        {/* Calendar Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Connected to Google
            </div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              May 2026
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setView("day")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === "day" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Day
              </button>
              <button 
                onClick={() => setView("week")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Week
              </button>
              <button 
                onClick={() => setView("month")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Month
              </button>
            </div>
            
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 px-2">Today</span>
              <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Button variant="outline" className="gap-2 bg-white" onClick={() => setFiltersOpen(!filtersOpen)}>
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Calendar View Area */}
          <div className="flex-1">
            {view === "week" && (
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                {/* Week Header */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                  {weekDays.map((d, i) => (
                    <div key={i} className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${isToday(d) ? 'bg-blue-50/50' : ''}`}>
                      <div className="text-xs font-medium text-gray-500 uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className={`text-lg font-bold mt-1 ${isToday(d) ? 'text-blue-600' : 'text-gray-900'}`}>
                        {d.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Week Grid (Simplified mock view) */}
                <div className="grid grid-cols-7 h-[500px] overflow-y-auto bg-gray-50/30">
                  {weekDays.map((d, i) => {
                    const dayEvents = getEventsForDate(d);
                    return (
                      <div key={i} className={`border-r border-gray-200 last:border-r-0 p-2 min-h-[120px] ${isToday(d) ? 'bg-blue-50/10' : ''}`}>
                        <div className="space-y-2">
                          {dayEvents.map((evt, idx) => (
                            <div key={idx} className={`p-2 rounded-lg border text-left cursor-pointer hover:opacity-90 transition-opacity shadow-sm ${evt.color}`}>
                              <p className="text-[10px] font-bold opacity-80 mb-0.5">{evt.time}</p>
                              <h4 className="text-xs font-semibold leading-tight line-clamp-2">{evt.title}</h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {view === "month" && (
              <div className="flex items-center justify-center h-[500px] border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 font-medium">Month view rendered here.</p>
              </div>
            )}
            
            {view === "day" && (
              <div className="flex items-center justify-center h-[500px] border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 font-medium">Day view rendered here.</p>
              </div>
            )}
          </div>

          {/* Filters Sidebar */}
          {filtersOpen && (
            <div className="w-64 shrink-0 bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter Events
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Event Type</label>
                  <select 
                    value={eventTypeFilter} 
                    onChange={e => setEventTypeFilter(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="all">All Events</option>
                    <option value="course">Live Classes</option>
                    <option value="coaching">Coaching Sessions</option>
                    <option value="appointment">Appointments</option>
                    <option value="followup">Follow-ups</option>
                    <option value="renewal">Renewals</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Owner / Trainer</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="all">Everyone</option>
                    <option value="sarah">Sarah Staff</option>
                    <option value="admin">Admin User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Course / Batch</label>
                  <select className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="all">All Batches</option>
                    <option value="cohort12">Cohort 12</option>
                    <option value="cohort13">Cohort 13</option>
                  </select>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full text-xs" onClick={() => setEventTypeFilter("all")}>Reset Filters</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {connectionState === "disconnected" && renderDisconnected()}
      {connectionState === "syncing" && renderSyncing()}
      {connectionState === "connected" && renderConnected()}
    </div>
  );
}
