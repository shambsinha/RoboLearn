import os

filepath = r"C:\Users\Aayush Sinha\Desktop\RoboLearn\robo-learn-frontend\src\pages\student\CodingWorkspace.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Boilerplate
bp_orig = "cpp: `#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    // Write your solution here\\n    cout << \"Hello, RoboLearn!\" << endl;\\n    return 0;\\n}`\n};"
bp_new = "cpp: `#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    // Write your solution here\\n    cout << \"Hello, RoboLearn!\" << endl;\\n    return 0;\\n}`,\n  sql: `-- Write your SQL query here\\nSELECT * FROM table_name;`\n};"
content = content.replace(bp_orig, bp_new)

# 2. getLanguageId
lang_orig = """    switch (lang) {
      case 'java': return 62;
      case 'python': return 71;
      case 'cpp': return 54;
      default: return 62;
    }"""
lang_new = """    switch (lang) {
      case 'java': return 62;
      case 'python': return 71;
      case 'cpp': return 54;
      case 'sql': return 82;
      default: return 62;
    }"""
content = content.replace(lang_orig, lang_new)

# 3. Add to the select dropdown options if there's a hardcoded dropdown
select_orig = """                <select 
                  value={language} 
                  onChange={handleLanguageChange}
                  className="bg-transparent text-sm font-medium text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="java" className="bg-zinc-800">Java</option>
                  <option value="python" className="bg-zinc-800">Python 3</option>
                  <option value="cpp" className="bg-zinc-800">C++</option>
                </select>"""
select_new = """                <select 
                  value={language} 
                  onChange={handleLanguageChange}
                  className="bg-transparent text-sm font-medium text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="java" className="bg-zinc-800">Java</option>
                  <option value="python" className="bg-zinc-800">Python 3</option>
                  <option value="cpp" className="bg-zinc-800">C++</option>
                  <option value="sql" className="bg-zinc-800">SQL (SQLite)</option>
                </select>"""
content = content.replace(select_orig, select_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Frontend updated for SQL")
