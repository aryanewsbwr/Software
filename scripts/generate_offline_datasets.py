import csv
import json
import os
import re

CSV_DIR = r"B:\himanshu uncle\Rahul"
OUT_DIR = r"B:\AI_Projects\Software\public\data"
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Publishers
print("Processing Publishers...")
pubs = []
with open(os.path.join(CSV_DIR, "1publisher.csv"), 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for r in reader:
        pubs.append({
            "publish_id": int(r['Publish_id']) if r['Publish_id'] else 0,
            "name": r['name'],
            "address": r.get('address', ''),
            "city": r.get('city', ''),
            "state": r.get('state', ''),
            "pincode": r.get('pincode', ''),
            "phone": r.get('phone', ''),
            "mobile": r.get('mobile', ''),
            "email": r.get('email', ''),
            "category": r.get('Category', 'Newspaper'),
            "type": r.get('Type', 'Publisher')
        })
with open(os.path.join(OUT_DIR, "publishers.json"), 'w', encoding='utf-8') as f:
    json.dump(pubs, f, ensure_ascii=False, indent=2)
print(f"  Saved {len(pubs)} publishers.")

# 2. Publications
print("Processing Publications...")
publications = []
with open(os.path.join(CSV_DIR, "2publication.csv"), 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for r in reader:
        publications.append({
            "publica_id": int(r['Publica_id']),
            "public_name": r['Public_name'],
            "type_p": r.get('TypeP', 'Daily'),
            "publish_id": int(r['Publish_id']) if r.get('Publish_id') and r['Publish_id'].isdigit() else None,
            "abrv": r.get('Abrv', ''),
            "circulation": r.get('Circulation', 'Morning'),
            "pub_hindi": r.get('Pub_Hindi', '')
        })
with open(os.path.join(OUT_DIR, "publications.json"), 'w', encoding='utf-8') as f:
    json.dump(publications, f, ensure_ascii=False, indent=2)
print(f"  Saved {len(publications)} publications.")

# 3. Regions
print("Processing Regions...")
regions = []
with open(os.path.join(CSV_DIR, "3region.csv"), 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for r in reader:
        regions.append({
            "region_id": int(r['Region_id']),
            "region_name": r['Region_name']
        })
with open(os.path.join(OUT_DIR, "regions.json"), 'w', encoding='utf-8') as f:
    json.dump(regions, f, ensure_ascii=False, indent=2)
print(f"  Saved {len(regions)} regions.")

# 4. Hawkers
print("Processing Hawkers...")
hawkers = []
with open(os.path.join(CSV_DIR, "4hawkeer.csv"), 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for r in reader:
        hawkers.append({
            "hawker_id": int(r['Hawker_id']),
            "name": r['name'],
            "address": r.get('address', ''),
            "city": r.get('city', ''),
            "phone": r.get('phone', ''),
            "mobile": r.get('mobile', ''),
            "region_id": int(r['Region_id']) if r.get('Region_id') and r['Region_id'].isdigit() else 1
        })
with open(os.path.join(OUT_DIR, "hawkers.json"), 'w', encoding='utf-8') as f:
    json.dump(hawkers, f, ensure_ascii=False, indent=2)
print(f"  Saved {len(hawkers)} hawkers.")

# 5. Base Rates (6.1 rate.csv)
print("Processing Rates...")
rates = []
with open(os.path.join(CSV_DIR, "6.1 rate.csv"), 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for r in reader:
        rates.append({
            "publica_id": int(r['Publica_id']),
            "rate": float(r['Rate']) if r.get('Rate') else 5.0,
            "dayofweek": int(r['Dayofweek']) if r.get('Dayofweek') else 1
        })
with open(os.path.join(OUT_DIR, "rates.json"), 'w', encoding='utf-8') as f:
    json.dump(rates, f, ensure_ascii=False, indent=2)
print(f"  Saved {len(rates)} rates.")

# 6. Rate Changes (6.2 rate.csv)
print("Processing Rate Changes...")
ratechanges = []
with open(os.path.join(CSV_DIR, "6.2 rate.csv"), 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for r in reader:
        ratechanges.append({
            "publica_id": int(r['Publica_id']),
            "old_rate": float(r['OldRate']) if r.get('OldRate') else None,
            "new_rate": float(r['NewRate']) if r.get('NewRate') else 5.0,
            "dated": r.get('Dated', ''),
            "dayofweek": int(r['Dayofweek']) if r.get('Dayofweek') else 1
        })
with open(os.path.join(OUT_DIR, "ratechanges.json"), 'w', encoding='utf-8') as f:
    json.dump(ratechanges, f, ensure_ascii=False, indent=2)
print(f"  Saved {len(ratechanges)} rate changes.")

# 7. Holidays (7holiday.csv)
print("Processing Holidays...")
holidays = []
with open(os.path.join(CSV_DIR, "7holiday.csv"), 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for i, r in enumerate(reader):
        holidays.append({
            "holiday_id": i + 1,
            "oc_date": r.get('Oc_Date', ''),
            "occasion": r.get('Occasion', ''),
            "publica_id": int(r['Publica_id']) if r.get('Publica_id') and r['Publica_id'].isdigit() else None
        })
with open(os.path.join(OUT_DIR, "holidays.json"), 'w', encoding='utf-8') as f:
    json.dump(holidays, f, ensure_ascii=False, indent=2)
print(f"  Saved {len(holidays)} holidays.")

# 8. Customer Discontinue (10 discontinue.csv)
print("Processing Discontinues...")
discontinues = []
with open(os.path.join(CSV_DIR, "10 discontinue.csv"), 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for r in reader:
        discontinues.append({
            "discontinue_id": int(r['Discontinue_id']),
            "sno": int(r['SNo']) if r.get('SNo') and r['SNo'].isdigit() else 1,
            "entry_date": r.get('EntryDate', ''),
            "customer_id": int(r['Customer_id']) if r.get('Customer_id') and r['Customer_id'].isdigit() else 0,
            "publica_id": int(r['Publica_id']) if r.get('Publica_id') and r['Publica_id'].isdigit() else None,
            "temp_perma": 'Temporary' if r.get('Temp_Perma') in ['T', 'Temporary'] else 'Permanent',
            "temp_from": r.get('Temp_From', ''),
            "temp_to": r.get('Temp_To', '')
        })
with open(os.path.join(OUT_DIR, "discontinues.json"), 'w', encoding='utf-8') as f:
    json.dump(discontinues, f, ensure_ascii=False, indent=2)
print(f"  Saved {len(discontinues)} discontinues.")

# 9. Top 2000 Customers Sample for Instant Local Search
print("Processing Customers sample for local engine...")
customers_sample = []
with open(os.path.join(CSV_DIR, "5.1custinfo.csv"), 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for i, r in enumerate(reader):
        customers_sample.append({
            "customer_id": int(r['Customer_id']),
            "name_eng": r['name_eng'],
            "name_hindi": r.get('name_hindi', ''),
            "add1": r.get('add1', ''),
            "add2": r.get('add2', ''),
            "phone": r.get('phone', ''),
            "priority": int(r['Priority']) if r.get('Priority') and r['Priority'].isdigit() else int(r['Customer_id']),
            "region_id": int(r['Region_id']) if r.get('Region_id') and r['Region_id'].isdigit() else 1,
            "dueamount": float(r['dueamount']) if r.get('dueamount') else 0.0,
            "cbal": float(r['Cbal']) if r.get('Cbal') else 0.0,
            "delivery": float(r['Delivery']) if r.get('Delivery') else 0.0,
            "discount": float(r['Discount']) if r.get('Discount') else 0.0,
            "security_deposit": float(r['Security_Deposit']) if r.get('Security_Deposit') else 0.0,
            "is_self": r.get('Self_Agent') != '0',
            "paid": r.get('Paid', 'P')
        })
        if i >= 4000:
            break

with open(os.path.join(OUT_DIR, "customers_sample.json"), 'w', encoding='utf-8') as f:
    json.dump(customers_sample, f, ensure_ascii=False, indent=2)
print(f"  Saved {len(customers_sample)} customers sample.")

print("\nALL OFFLINE DATASETS GENERATED SUCCESSFULLY!")
