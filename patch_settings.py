import re

with open("app/settings/page.tsx", "r") as f:
    content = f.read()

# Add import if missing
if "CalendarIntegration" not in content:
    content = content.replace('import { Card } from "@/components/ui/Card";', 
        'import { Card } from "@/components/ui/Card";\nimport CalendarIntegration from "@/components/CalendarIntegration";')

# Define the target block to replace for the Integrations tab
target_start = '          {activeTab === "integrations" && ('
target_end = '          {activeTab === "notifications" && ('

new_integrations_tab = """          {activeTab === "integrations" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Active Integrations</h2>
                <CalendarIntegration />
              </Card>

              <div className="pt-4 border-t border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Coming Soon <Badge variant="default" className="bg-gray-100 text-gray-500 border-gray-200 text-[10px]">Disabled</Badge>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60 pointer-events-none">
                  {[
                    { name: "WhatsApp Business", desc: "Automated messaging and templates.", icon: "💬" },
                    { name: "Razorpay", desc: "Payment gateway integration.", icon: "₹" },
                    { name: "Cashfree", desc: "Alternative payment processing.", icon: "💳" },
                    { name: "Email SMTP", desc: "Custom email server settings.", icon: "✉️" },
                    { name: "Meta Ads", desc: "Lead syncing and conversion tracking.", icon: "🎯" },
                    { name: "Zoom", desc: "Automated meeting links.", icon: "📹" },
                    { name: "Google Sheets", desc: "Export and sync data.", icon: "📊" },
                    { name: "SMS Gateway", desc: "Text message alerts.", icon: "📱" },
                  ].map((int, i) => (
                    <div key={i} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between bg-gray-50 filter grayscale">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{int.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{int.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{int.desc}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>Coming Soon</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

"""

# Regex replacement
pattern = re.compile(re.escape(target_start) + r".*?" + re.escape(target_end), re.DOTALL)
if pattern.search(content):
    content = pattern.sub(new_integrations_tab + target_end, content)
    print("Replaced integrations tab successfully.")
else:
    print("Could not find the integrations tab target.")

with open("app/settings/page.tsx", "w") as f:
    f.write(content)
