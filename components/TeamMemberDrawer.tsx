import React, { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Mail, Phone, Calendar, Clock, Activity, Target, TrendingUp, 
  PhoneCall, FileText, CheckCircle2, AlertCircle, MessageSquare
} from "lucide-react";
import { TeamMember } from "@/app/team/page";

interface TeamMemberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
}

const MOCK_LEADS = [
  { id: 1, name: "Arjun Verma", course: "Full Stack Web Dev", source: "Facebook Ads", stage: "New", date: "Today", status: "Pending" },
  { id: 2, name: "Sneha Nair", course: "UI/UX Design", source: "Organic", stage: "Demo Booked", date: "Yesterday", status: "In Progress" },
  { id: 3, name: "Rahul Singh", course: "Data Science", source: "Referral", stage: "Enrolled", date: "3 Days ago", status: "Converted" },
  { id: 4, name: "Priya Patel", course: "Full Stack Web Dev", source: "Google Ads", stage: "Lost", date: "1 Week ago", status: "Closed" }
];

const MOCK_FOLLOWUPS = [
  { id: 1, date: "Today, 2:30 PM", lead: "Arjun Verma", type: "Call", priority: "High", status: "Pending", notes: "Call to schedule demo" },
  { id: 2, date: "Today, 4:00 PM", lead: "Sneha Nair", type: "WhatsApp", priority: "Medium", status: "Pending", notes: "Send demo link" },
  { id: 3, date: "Yesterday", lead: "Rahul Singh", type: "Email", priority: "Low", status: "Completed", notes: "Sent welcome kit" }
];

const MOCK_TIMELINE = [
  { id: 1, time: "Today, 10:30 AM", type: "Lead Assigned", user: "System", desc: "Arjun Verma was assigned." },
  { id: 2, time: "Yesterday, 4:15 PM", type: "Note Added", user: "Kabir Gupta", desc: "Left a voicemail for Sneha." },
  { id: 3, time: "3 Days ago", type: "Lead Converted", user: "System", desc: "Rahul Singh enrolled in Data Science." }
];

export function TeamMemberDrawer({ isOpen, onClose, member }: TeamMemberDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "leads" | "followups" | "notes" | "timeline">("overview");

  if (!member) return null;

  const conversionRate = member.leadsAssigned > 0 
    ? ((member.leadsConverted / member.leadsAssigned) * 100).toFixed(1) 
    : "0.0";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Team Member Details" size="xl">
      <div className="flex flex-col h-full bg-gray-50/50 -mx-6 -mt-6">
        {/* Header Profile Section */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20">
                {member.name.split(" ").map(w => w.charAt(0)).join("")}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-600">{member.role}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm font-medium text-gray-500">{member.department}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {member.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {member.phone}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={member.status === "Active" ? "success" : member.status === "Inactive" ? "error" : "warning"}>
                {member.status}
              </Badge>
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5" /> Last active: {member.lastActive}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-6 border-b border-gray-100">
            {[
              { id: "overview", label: "Overview" },
              { id: "performance", label: "Performance" },
              { id: "leads", label: "Assigned Leads" },
              { id: "followups", label: "Follow-Ups" },
              { id: "notes", label: "Notes" },
              { id: "timeline", label: "Activity Timeline" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-semibold transition-all relative ${
                  activeTab === tab.id 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Email Address</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{member.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{member.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Employment Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Joined Date</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" /> {member.joinedDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Current Status</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{member.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Target className="w-4 h-4" /></div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads Pipeline</p>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{member.leadsAssigned}</p>
                      <p className="text-xs font-medium text-gray-400 mt-1">Total Assigned</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">{member.leadsConverted}</p>
                      <p className="text-xs font-medium text-gray-400 mt-1">Converted</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity className="w-4 h-4" /></div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversion Rate</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, Number(conversionRate))}%` }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue Influenced</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-gray-900">${member.revenueInfluenced.toLocaleString()}</p>
                    <p className="text-xs font-medium text-gray-400 mt-1">Lifetime value generated</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><PhoneCall className="w-4 h-4" /></div>
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Follow-Up Metrics</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Completed Follow-ups</p>
                      <p className="text-2xl font-bold text-gray-900">{member.followupsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Pending Tasks</p>
                      <p className="text-2xl font-bold text-amber-600">{member.followupsPending}</p>
                    </div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === "leads" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Lead Name</th>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_LEADS.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900">{lead.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{lead.course}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{lead.source}</td>
                      <td className="px-5 py-3">
                        <Badge variant={lead.stage === 'Enrolled' ? 'success' : lead.stage === 'Lost' ? 'error' : 'default'} className="text-[10px]">
                          {lead.stage}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 text-right">{lead.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "followups" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Follow-Up Date</th>
                    <th className="px-5 py-3">Lead</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_FOLLOWUPS.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{f.date}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{f.lead}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{f.type}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold ${f.priority === 'High' ? 'text-rose-600' : f.priority === 'Medium' ? 'text-amber-600' : 'text-gray-500'}`}>
                          {f.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={f.status === 'Completed' ? 'success' : 'warning'} className="text-[10px]">
                          {f.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-900">Internal Notes</h3>
                <Button variant="secondary" size="sm">Add Note</Button>
              </div>
              
              <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl flex gap-3">
                <FileText className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Performance Review Notes</p>
                  <p className="text-xs text-gray-600 mt-1">Doing great with the new curriculum. Needs to focus a bit more on follow-up times for inbound leads.</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-3">Added by Admin • 2 days ago</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
              <div className="space-y-6">
                {MOCK_TIMELINE.map((item, idx) => (
                  <div key={item.id} className="flex gap-4 relative">
                    {idx !== MOCK_TIMELINE.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-100 -mb-6" />
                    )}
                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 z-10 text-gray-500">
                      {item.type.includes("Converted") ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : 
                       item.type.includes("Note") ? <MessageSquare className="w-3 h-3 text-blue-500" /> : 
                       <AlertCircle className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.desc}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-gray-400">{item.time}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">By {item.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </Drawer>
  );
}
