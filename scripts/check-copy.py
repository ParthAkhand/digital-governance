"""Check that every Master-pitch line (Appendix A of reference/CITY_PMU_FLOW_BRIEF.md) appears in site/index.html.
Usage: python scripts/check-copy.py   Prints pitch lines NOT found; exit 1 if any. Known, owner-approved gaps are in ALLOWED."""
import re, sys, html, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
brief = (root / "reference" / "CITY_PMU_FLOW_BRIEF.md").read_text(encoding="utf-8")
page = (root / "site" / "index.html").read_text(encoding="utf-8")

# owner-approved differences (26 Nov): quote sentence changed, city names dropped, credentials placeholder, graphic/date lines
ALLOWED = ("The gap costs marks.", "The city runs services through", "What arrives", "The scorecard. Every measure", "The fee is set per household per month, ", "A one-page quote", "as reported for Raipur and Bilaspur", "PRAGATI-50 targets for Raipur", "[Graphic", "Why Human Matrix",
           "Human Matrix has run", "Operator's experience", "Survekshan record", "Its own software", "A working Task Force",
           "More than ten years", "All six cities", "Matrix Track is built", "The field verification model",
           "City PMU: one verified picture of your city's sanitation, every week")  # H1 is split across brand span + copy

def norm(t):
    t = re.sub(r"<script.*?</script>|<!--.*?-->", " ", t, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    t = html.unescape(t).replace("’", "'")
    return re.sub(r"\s+", " ", t).strip().lower()

text = norm(page.replace('<span data-brand></span>', 'City PMU').replace('<span data-company></span>', 'Human Matrix'))
pitch = brief.split("<!-- PITCH START -->")[1].split("<!-- PITCH END -->")[0]
pieces = []
for line in pitch.splitlines():
    line = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", line)          # links -> text
    line = re.sub(r"\*\*|^#+\s*|^\s*(?:-|\d+\.)\s+", "", line.strip())
    if re.fullmatch(r"\|?[-| ]+\|?", line):
        continue
    pieces += [c.strip() for c in line.strip("|").split("|")] if line.startswith("|") else [line]
missing = [p for p in pieces if p and not p.startswith(("# ", "## ")) and norm(p) not in text and not p.startswith(ALLOWED)]
for m in missing: print("MISSING:", m)
print(f"{len(pieces) - len(missing)}/{len(pieces)} pitch pieces found")
sys.exit(1 if missing else 0)
