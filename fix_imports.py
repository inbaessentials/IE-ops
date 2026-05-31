with open("app/page.tsx", "r") as f:
    content = f.read()

# Replace any manual imports or just add Calendar as CalendarIcon to lucide-react imports
if "Calendar as CalendarIcon" not in content:
    content = content.replace('IndianRupee,', 'Calendar as CalendarIcon, IndianRupee,')

with open("app/page.tsx", "w") as f:
    f.write(content)

print("Imports fixed.")
