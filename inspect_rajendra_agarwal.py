import csv

print("Searching for Rajendra Agarwal in 5.1custinfo.csv:")
with open(r"B:\himanshu uncle\Rahul\5.1custinfo.csv", 'r', encoding='utf-8', errors='ignore') as f:
    for row in csv.DictReader(f):
        if 'rajendra' in row.get('name_eng', '').lower() and 'agarwal' in row.get('name_eng', '').lower():
            print("Cust Info:", row)
            cid = row['Customer_id']
            
            print(f"\nSubscriptions for Cust #{cid} (5.2cust info.csv):")
            with open(r"B:\himanshu uncle\Rahul\5.2cust info.csv", 'r', encoding='utf-8', errors='ignore') as sf:
                for srow in csv.DictReader(sf):
                    if srow.get('Customer_id') == cid:
                        print("  ", srow)
            
            print(f"\nDiscontinue records for Cust #{cid} (10 discontinue.csv):")
            with open(r"B:\himanshu uncle\Rahul\10 discontinue.csv", 'r', encoding='utf-8', errors='ignore') as df:
                for drow in csv.DictReader(df):
                    if drow.get('Customer_id') == cid:
                        print("  ", drow)
            print("-" * 60)
