import ctypes
import os

ocx_path = r"B:\himanshu uncle\exe\vsflex8.ocx"
print("Registering OCX via direct DllRegisterServer API call:", ocx_path)

try:
    dll = ctypes.windll.LoadLibrary(ocx_path)
    res = dll.DllRegisterServer()
    print(f"DllRegisterServer returned: {res} (0 means S_OK / SUCCESS!)")
except Exception as e:
    print("Error calling DllRegisterServer:", e)
