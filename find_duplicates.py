import re
from collections import defaultdict

with open("src/lib/categoryHierarchy.ts", "r", encoding="utf-8") as f:
    text = f.read()

locations = defaultdict(list)

# Split by subcategory blocks
# A subcategory block starts with { name: "..." and ends with }
subcats = re.finditer(r'\{[^{}]*name:\s*"([^"]+)"[^{}]*detailCategories:\s*\[(.*?)\][^{}]*\}', text, re.DOTALL)
for match in subcats:
    sub = match.group(1)
    items = re.findall(r'"([^"]+)"', match.group(2))
    for item in items:
        locations[item].append(sub)

# What about main categories? The user might want to know the whole path.
# Let's do a better parsing.
import ast
import json

# Instead of parsing TS, let's just use regex more carefully, or since the file is simple:
lines = text.split('\n')
current_main = ""
current_sub = ""
locations_main = defaultdict(list)

in_subcat = False
in_detail = False
detail_accum = ""

for line in lines:
    main_match = re.search(r'"([^"]+)":\s*\{', line)
    if main_match and 'label' not in line and 'value' not in line:
        current_main = main_match.group(1)
        
    sub_match = re.search(r'name:\s*"([^"]+)"', line)
    if sub_match:
        current_sub = sub_match.group(1)
        
    if "detailCategories: [" in line:
        in_detail = True
        detail_accum = line.split("detailCategories: [")[1]
    elif in_detail:
        detail_accum += line
        
    if "]" in line and in_detail:
        in_detail = False
        items = re.findall(r'"([^"]+)"', detail_accum)
        for item in items:
            locations_main[item].append(f"{current_main} -> {current_sub}")
        detail_accum = ""

print("Dubbletter i detaljkategorier (överallt):")
found=False
for item, paths in locations_main.items():
    if len(paths) > 1:
        found=True
        print(f"- **{item}**: {', '.join(paths)}")
if not found:
    print("Inga.")
