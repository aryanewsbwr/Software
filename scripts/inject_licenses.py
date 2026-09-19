import winreg

def set_key(hive, path, name, val):
    try:
        k = winreg.CreateKey(hive, path)
        winreg.SetValueEx(k, name, 0, winreg.REG_SZ, val)
        winreg.CloseKey(k)
        print(f"Set {path} -> {val}")
    except Exception as e:
        print(f"Error setting {path}: {e}")

# Add VSFlexGrid Licenses
licenses = [
    ("D32CE820-A0E3-11d0-9C8A-006097C3784A", "mshrqfghjjikmjjhghjkhjkhkjlh"),
    ("4250E830-6AC2-11cf-8ADB-00AA00C00905", "kjgmfgjjmgnnmnmninighthkgogggvmkhinjggnvm"),
    ("C945E31A-102E-4a0d-8854-D599D7AED5FA", "mshrqfghjjikmjjhghjkhjkhkjlh"),
    ("BEEECC20-4D5F-4f8b-BFDC-5D9B6FBDE09D", "mshrqfghjjikmjjhghjkhjkhkjlh"),
]

for guid, lic in licenses:
    set_key(winreg.HKEY_CURRENT_USER, rf"Software\Classes\Licenses\{guid}", "", lic)
    set_key(winreg.HKEY_LOCAL_MACHINE, rf"SOFTWARE\Classes\Licenses\{guid}", "", lic)
    set_key(winreg.HKEY_LOCAL_MACHINE, rf"SOFTWARE\WOW6432Node\Classes\Licenses\{guid}", "", lic)

print("Licenses injected successfully!")
