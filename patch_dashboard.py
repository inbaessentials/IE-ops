import re

with open("app/page.tsx", "r") as f:
    content = f.read()

# Add Calendar icon import if not present
if "Calendar as CalendarIcon" not in content:
    content = content.replace('import {\n  IndianRupee,', 'import {\n  Calendar as CalendarIcon,\n  IndianRupee,')

widget_code = """      <DashboardCharts categoryFilter={categoryFilter} />

      {/* Upcoming Events (Calendar Widget) */}
      <div className="mt-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" /> Upcoming Activities
          </h2>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="gap-2">View Full Calendar <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-blue-50/50 p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Today</h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">2 Events</span>
            </div>
            <div className="p-4 space-y-3 flex-1 bg-white">
              <div className="p-3 border border-blue-100 bg-blue-50/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">10:00 AM (2h)</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">Cohort 12 Live Session</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Sarah Staff</p>
              </div>
              
              <div className="p-3 border border-purple-100 bg-purple-50/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-purple-600 uppercase">02:00 PM (1h)</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">1:1 Coaching - Rahul</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Admin User</p>
              </div>
            </div>
          </Card>

          {/* Tomorrow */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-amber-50/50 p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Tomorrow</h3>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">1 Event</span>
            </div>
            <div className="p-4 space-y-3 flex-1 bg-white">
              <div className="p-3 border border-amber-100 bg-amber-50/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">11:30 AM (30m)</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">Follow-up: Priya (Lead)</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Sarah Staff</p>
              </div>
            </div>
          </Card>

          {/* This Week */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-50/50 p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Later This Week</h3>
              <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">2 Events</span>
            </div>
            <div className="p-4 space-y-3 flex-1 bg-white">
              <div className="p-3 border border-emerald-100 bg-emerald-50/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Jun 02, 04:00 PM</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">Membership Renewal Calls</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Admin User</p>
              </div>
              <div className="p-3 border border-gray-200 bg-gray-50/50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase">Jun 03, 09:00 AM</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">Staff Sync Meeting</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Admin User</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
"""

target = "      <DashboardCharts categoryFilter={categoryFilter} />"
content = content.replace(target, widget_code)

with open("app/page.tsx", "w") as f:
    f.write(content)

print("Dashboard patched.")
