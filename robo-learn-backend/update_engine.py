import os

filepath = r"C:\Users\Aayush Sinha\Desktop\RoboLearn\robo-learn-backend\src\main\java\com\robolearn\submission\service\impl\CodeExecutionEngineImpl.java"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Modify setupWorkspace for SQL
setup_orig = """        } else if ("cpp".equals(lang) || "c++".equals(lang)) {
            Files.writeString(workspace.resolve("main.cpp"), submission.getCode());
        }

        // Setup IO"""
setup_new = """        } else if ("cpp".equals(lang) || "c++".equals(lang)) {
            Files.writeString(workspace.resolve("main.cpp"), submission.getCode());
        } else if ("sql".equals(lang)) {
            String schema = driverCode != null ? driverCode : "";
            Files.writeString(workspace.resolve("schema.sql"), schema);
            Files.writeString(workspace.resolve("query.sql"), submission.getCode());
            
            String pyRunner = 
                "import sqlite3, sys, csv\\n" +
                "try:\\n" +
                "    conn = sqlite3.connect(':memory:')\\n" +
                "    with open('schema.sql', 'r') as f: conn.executescript(f.read())\\n" +
                "    with open('query.sql', 'r') as f: query = f.read()\\n" +
                "    cur = conn.cursor()\\n" +
                "    cur.execute(query)\\n" +
                "    rows = cur.fetchall()\\n" +
                "    if rows:\\n" +
                "        writer = csv.writer(sys.stdout, lineterminator='\\\\n')\\n" +
                "        writer.writerows(rows)\\n" +
                "    conn.close()\\n" +
                "except Exception as e:\\n" +
                "    sys.stderr.write(str(e))\\n" +
                "    sys.exit(1)\\n";
            Files.writeString(workspace.resolve("runner.py"), pyRunner);
        }

        // Setup IO"""
content = content.replace(setup_orig, setup_new)

# 2. Modify runBatch for SQL
run_orig = """        } else if ("cpp".equals(lang) || "c++".equals(lang)) {
            baseCmd = new String[]{isWin ? "main.exe" : "./main"};
        } else {"""
run_new = """        } else if ("cpp".equals(lang) || "c++".equals(lang)) {
            baseCmd = new String[]{isWin ? "main.exe" : "./main"};
        } else if ("sql".equals(lang)) {
            baseCmd = new String[]{isWin ? "python" : "python3", "runner.py"};
        } else {"""
content = content.replace(run_orig, run_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated backend for SQL")
