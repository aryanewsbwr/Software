import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        port=3306,
        user="root",
        password="jonathanss",
        database="test"
    )
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = [t[0] for t in cursor.fetchall()]
    print(f"Connected to MySQL 'test'! Found {len(tables)} tables.")
    print("Tables list:", tables[:25])
    
    if 'login' in tables:
        cursor.execute("SELECT * FROM login")
        print("Login users:", cursor.fetchall())
    else:
        print("Table 'login' does not exist in 'test' database!")

    if 'year' in tables:
        cursor.execute("SELECT * FROM year")
        print("Years in DB:", cursor.fetchall())

    if 'company' in tables:
        cursor.execute("SELECT * FROM company")
        print("Company info:", cursor.fetchall())

except Exception as e:
    print("MySQL Error:", e)
