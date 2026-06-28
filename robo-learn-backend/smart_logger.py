import os
import re

SRC_DIR = r"C:\Users\Aayush Sinha\Desktop\RoboLearn\robo-learn-backend\src\main\java\com\robolearn"

api_annotations = ["@GetMapping", "@PostMapping", "@PutMapping", "@DeleteMapping", "@PatchMapping"]

for root, _, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith("Controller.java"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Add @Slf4j if not present
            if "@Slf4j" not in content and "@RestController" in content:
                content = content.replace("public class", "@lombok.extern.slf4j.Slf4j\npublic class", 1)
            
            lines = content.split('\n')
            new_lines = []
            
            i = 0
            while i < len(lines):
                line = lines[i]
                new_lines.append(line)
                
                is_api_method = any(ann in line for ann in api_annotations)
                if is_api_method:
                    # Skip annotations
                    j = i + 1
                    while j < len(lines) and (lines[j].strip().startswith("@") or lines[j].strip() == ""):
                        new_lines.append(lines[j])
                        j += 1
                    
                    method_line = lines[j]
                    
                    # Accumulate full method signature across lines if broken
                    while "{" not in method_line and j + 1 < len(lines):
                        new_lines.append(lines[j])
                        j += 1
                        method_line += " " + lines[j].strip()
                        
                    new_lines.append(lines[j]) # add the line with "{"
                    
                    # Extract method name and parameters
                    # e.g., public ResponseEntity<Void> markItemComplete(@PathVariable String courseId, @RequestParam String type) {
                    match = re.search(r'public\s+(?:[\w<>\[\]?,\s]+\s+)+(\w+)\s*\((.*?)\)\s*\{', method_line)
                    if match:
                        method_name = match.group(1)
                        params_str = match.group(2)
                        
                        param_names = []
                        if params_str.strip():
                            # naive split by comma
                            params_list = params_str.split(',')
                            for p in params_list:
                                p = p.strip()
                                # get the last word which is the variable name
                                parts = p.split()
                                if len(parts) >= 2:
                                    p_name = parts[-1]
                                    if p_name != "request" and p_name != "file" and p_name != "principal" and p_name != "authentication":
                                        param_names.append(p_name)
                        
                        log_msg = f"Executing {method_name}"
                        if param_names:
                            log_msg += " with " + ", ".join([f"{p}={{}}" for p in param_names])
                            args_str = ", ".join(param_names)
                            log_statement = f'        log.info("{log_msg}", {args_str});'
                        else:
                            log_statement = f'        log.info("{log_msg}");'
                        
                        # Only insert if there isn't already a log.info right there
                        if j + 1 < len(lines) and "log.info(" not in lines[j+1]:
                            new_lines.append(log_statement)
                        
                    i = j
                i += 1
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
            print(f"Updated {file}")
