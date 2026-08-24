import os

img_dir = r"B:\AI_Projects\Software\public\legacy_images"
files = sorted(os.listdir(img_dir))
print("All legacy screenshot files found:")
for f in files:
    size = os.path.getsize(os.path.join(img_dir, f))
    print(f"  {f} ({size} bytes)")
