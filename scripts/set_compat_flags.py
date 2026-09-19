import winreg

def set_compat(exe_path):
    try:
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers")
        winreg.SetValueEx(key, exe_path, 0, winreg.REG_SZ, "~ WINXPSP3 RUNASADMIN")
        winreg.CloseKey(key)
        print(f"Set WinXP SP3 + Admin compatibility for: {exe_path}")
    except Exception as e:
        print(f"Error: {e}")

exes = [
    r"B:\himanshu uncle\exe\AryanNewsAgency.exe",
    r"B:\himanshu uncle\exe\AryanNewsAgency_Unlocked.exe",
    r"B:\himanshu uncle\exe\AryanNewsAgency_Original.exe",
    r"B:\himanshu uncle\AryanNewsAgency.exe",
    r"B:\himanshu uncle\AryanNewsAgency_Unlocked.exe"
]

for p in exes:
    set_compat(p)

print("All compatibility flags configured!")
