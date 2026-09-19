import winreg

def set_val(hive, path, name, val):
    try:
        k = winreg.CreateKey(hive, path)
        winreg.SetValueEx(k, name, 0, winreg.REG_SZ, val)
        winreg.CloseKey(k)
        print(f"Created: {path} = '{val}'")
    except Exception as e:
        print(f"Error {path}: {e}")

# Target CLSID for VSFlexGrid
clsid = "{BEEECC20-4D5F-4F8B-BFDC-5D9B6FBDE09D}"
typelib = "{C945E31A-102E-4a0d-8854-D599D7AED5FA}"
ocx_path = r"B:\himanshu uncle\exe\vsflex8.ocx"

# 1. Map VSFlex8LCtl.VSFlexGrid to the installed CLSID
for root in [winreg.HKEY_CURRENT_USER]:
    # ProgIDs
    set_val(root, r"Software\Classes\VSFlex8LCtl.VSFlexGrid", "", "ComponentOne VSFlexGrid 8.0 (Light)")
    set_val(root, r"Software\Classes\VSFlex8LCtl.VSFlexGrid\CLSID", "", clsid)
    set_val(root, r"Software\Classes\VSFlex8LCtl.VSFlexGrid.1", "", "ComponentOne VSFlexGrid 8.0 (Light)")
    set_val(root, r"Software\Classes\VSFlex8LCtl.VSFlexGrid.1\CLSID", "", clsid)

    set_val(root, r"Software\Classes\VSFlex8Ctl.VSFlexGrid", "", "ComponentOne VSFlexGrid 8.0 (OLEDB)")
    set_val(root, r"Software\Classes\VSFlex8Ctl.VSFlexGrid\CLSID", "", clsid)
    set_val(root, r"Software\Classes\VSFlex8Ctl.VSFlexGrid.1", "", "ComponentOne VSFlexGrid 8.0 (OLEDB)")
    set_val(root, r"Software\Classes\VSFlex8Ctl.VSFlexGrid.1\CLSID", "", clsid)

    # CLSID InprocServer32
    set_val(root, rf"Software\Classes\CLSID\{clsid}", "", "ComponentOne VSFlexGrid 8.0")
    set_val(root, rf"Software\Classes\CLSID\{clsid}\InprocServer32", "", ocx_path)
    set_val(root, rf"Software\Classes\CLSID\{clsid}\InprocServer32", "ThreadingModel", "Apartment")
    set_val(root, rf"Software\Classes\CLSID\{clsid}\ProgID", "", "VSFlex8LCtl.VSFlexGrid.1")
    set_val(root, rf"Software\Classes\CLSID\{clsid}\VersionIndependentProgID", "", "VSFlex8LCtl.VSFlexGrid")
    set_val(root, rf"Software\Classes\CLSID\{clsid}\TypeLib", "", typelib)
    set_val(root, rf"Software\Classes\CLSID\{clsid}\Control", "", "")

    # TypeLib
    set_val(root, rf"Software\Classes\TypeLib\{typelib}\1.0", "", "ComponentOne VSFlexGrid 8.0 (Light)")
    set_val(root, rf"Software\Classes\TypeLib\{typelib}\1.0\0\win32", "", ocx_path)
    set_val(root, rf"Software\Classes\TypeLib\{typelib}\1.0\FLAGS", "", "0")

print("COM Aliasing for VSFlex8LCtl completed successfully!")
