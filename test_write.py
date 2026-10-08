import subprocess
import json

cmd = ["powershell", "-NoProfile", "-Command", "Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'python' } | Select-Object ProcessId, CommandLine | ConvertTo-Json"]
out = subprocess.check_output(cmd).decode()
data = json.loads(out)
if isinstance(data, dict):
    data = [data]
for item in data:
    print(f"PID {item.get('ProcessId')}: {item.get('CommandLine')}")