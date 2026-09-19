import urllib.request
import os

url = "https://prerelease.componentone.com/activex/vsflex8/2008-t1/vsflex8_8.0.20081.248.zip"
out_zip = r"B:\himanshu uncle\exe\vsflex8_setup.zip"

print("Downloading official ComponentOne VSFlexGrid 8 package...")
try:
    urllib.request.urlretrieve(url, out_zip)
    print(f"Downloaded successfully! Size: {os.path.getsize(out_zip)} bytes")
    
    import zipfile
    with zipfile.ZipFile(out_zip, 'r') as z:
        print("Zip contents:", z.namelist())
        z.extractall(r"B:\himanshu uncle\exe\c1_files")
        print("Extracted to B:\\himanshu uncle\\exe\\c1_files")
except Exception as e:
    print("Download error:", e)
