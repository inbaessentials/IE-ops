import re

with open("app/inventory/page.tsx", "r") as f:
    content = f.read()

# Replace KPI block
kpi_target = """      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard 
          title="Total Courses" 
          value={stats.total} 
          icon={<BookOpen />} 
          iconBgClass="bg-blue-50" 
          iconTextClass="text-blue-600" 
        />
        <KpiCard 
          title="Total Leads" 
          value={stats.leads} 
          icon={<Users />} 
          iconBgClass="bg-purple-50" 
          iconTextClass="text-purple-600" 
        />
        <KpiCard 
          title={`New Enrollments (${stats.currentMonthStr})`}
          value={stats.newEnrollments}
          icon={<CalendarCheck />} 
          iconBgClass="bg-indigo-50" 
          iconTextClass="text-indigo-600"
          subText={
            <span className="text-[10px] font-medium text-emerald-600">
              +{stats.enrollmentGrowth}% vs {stats.lastMonthStr}
            </span>
          }
        />
        <KpiCard 
          title="Pending Payments" 
          value={`₹${stats.pendingPayments.toLocaleString("en-IN")}`} 
          valueClass="text-amber-600"
          icon={<Award />} 
          iconBgClass="bg-amber-50" 
          iconTextClass="text-amber-600" 
        />
        <KpiCard 
          title="Revenue Generated" 
          value={`₹${stats.revenue.toLocaleString("en-IN")}`} 
          icon={<IndianRupee />} 
          iconBgClass="bg-emerald-50" 
          iconTextClass="text-emerald-600" 
        />
        <KpiCard 
          title="Conversion Rate" 
          value={`${stats.conv}%`} 
          valueClass="text-purple-600"
          icon={<TrendingUp />} 
          iconBgClass="bg-purple-50" 
          iconTextClass="text-purple-600" 
        />
      </div>"""

kpi_replacement = """      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard 
          title="Total Courses" 
          value={stats.total} 
          icon={<BookOpen />} 
          iconBgClass="bg-blue-50" 
          iconTextClass="text-blue-600" 
        />
        <KpiCard 
          title="Total Leads" 
          value={stats.leads} 
          icon={<Users />} 
          iconBgClass="bg-purple-50" 
          iconTextClass="text-purple-600" 
        />
        <KpiCard 
          title="Total Enrollments"
          value={stats.students}
          icon={<CalendarCheck />} 
          iconBgClass="bg-indigo-50" 
          iconTextClass="text-indigo-600"
        />
        <KpiCard 
          title="Active Students" 
          value={stats.students}
          icon={<Award />} 
          iconBgClass="bg-amber-50" 
          iconTextClass="text-amber-600" 
        />
        <KpiCard 
          title="Revenue Generated" 
          value={`₹${stats.revenue.toLocaleString("en-IN")}`} 
          icon={<IndianRupee />} 
          iconBgClass="bg-emerald-50" 
          iconTextClass="text-emerald-600" 
        />
        <KpiCard 
          title="Conversion Rate" 
          value={`${stats.conv}%`} 
          valueClass="text-purple-600"
          icon={<TrendingUp />} 
          iconBgClass="bg-purple-50" 
          iconTextClass="text-purple-600" 
        />
      </div>"""

# Replace Common Fields (Remove Duration)
duration_target = """            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                <input 
                  type="text" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-normal text-gray-700 text-sm" 
                  placeholder="e.g. 10 Weeks" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Type</label>
                <select 
                  value={courseType} 
                  onChange={(e) => setCourseType(e.target.value as any)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-normal text-gray-700 text-sm"
                >
                  <option value="Live Cohort">Live Cohort</option>
                  <option value="Recorded Course">Recorded Course</option>
                  <option value="Hybrid Program">Hybrid Program</option>
                  <option value="Coaching Program">Coaching Program</option>
                </select>
              </div>
            </div>"""

duration_replacement = """            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course Type *</label>
              <select 
                value={courseType} 
                onChange={(e) => setCourseType(e.target.value as any)} 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-normal text-gray-700 text-sm"
              >
                <option value="Live Cohort">Live Cohort</option>
                <option value="Recorded Course">Recorded Course</option>
                <option value="Hybrid Program">Hybrid Program</option>
                <option value="Coaching Program">Coaching Program</option>
              </select>
            </div>"""

dynamic_target_start = "{/* DYNAMIC COURSE TYPE FIELDS */}"
dynamic_target_end = "<div>\n              <label className=\"block text-sm font-semibold text-gray-700 mb-2\">Landing Page URL</label>"

with open("/Users/bhuvan/.gemini/antigravity-ide/brain/ff57ec0d-4be2-4366-891c-7658d43eb1b7/scratch.tsx", "r") as f:
    dynamic_replacement = f.read() + "\n            <div>\n              <label className=\"block text-sm font-semibold text-gray-700 mb-2\">Landing Page URL</label>"

# Execution
if kpi_target in content:
    content = content.replace(kpi_target, kpi_replacement)
    print("KPI updated.")
else:
    print("KPI target not found!")

if duration_target in content:
    content = content.replace(duration_target, duration_replacement)
    print("Duration removed from common fields.")
else:
    print("Duration target not found!")

dynamic_pattern = re.compile(re.escape(dynamic_target_start) + r".*?" + re.escape("<div>\n              <label className=\"block text-sm font-semibold text-gray-700 mb-2\">Landing Page URL</label>"), re.DOTALL)
if dynamic_pattern.search(content):
    content = dynamic_pattern.sub(dynamic_replacement, content)
    print("Dynamic fields replaced.")
else:
    print("Dynamic fields target not found!")

with open("app/inventory/page.tsx", "w") as f:
    f.write(content)

print("Done")
