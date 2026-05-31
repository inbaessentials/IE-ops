with open("app/page.tsx", "r") as f:
    content = f.read()

# Fix the mess up on line 958
content = content.replace('icon: Calendar as CalendarIcon, IndianRupee,', 'icon: IndianRupee,')

# Now fix the import. First remove all instances of 'Calendar as CalendarIcon,' to clean up
content = content.replace('Calendar as CalendarIcon, ', '')

# Now explicitly add it to the lucide-react import
import_start = 'import { \n  IndianRupee,'
import_replacement = 'import { \n  Calendar as CalendarIcon,\n  IndianRupee,'
# It might not match exactly because of my previous replace. Let's just use re
import re

content = re.sub(r'import {\s*IndianRupee,', 'import {\\n  Calendar as CalendarIcon,\\n  IndianRupee,', content)

with open("app/page.tsx", "w") as f:
    f.write(content)
print("Fixed again.")
