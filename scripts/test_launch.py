import subprocess
import time
import os

exe_path = r"B:\himanshu uncle\exe\AryanNewsAgency.exe"
print("Launching:", exe_path)

p = subprocess.Popen([exe_path], cwd=r"B:\himanshu uncle\exe")
print("Process PID:", p.pid)

time.sleep(3)
poll = p.poll()
print("Process status after 3s:", "Running" if poll is None else f"Terminated with code {poll}")
