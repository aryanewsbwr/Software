@echo off
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pjonathanss -e "SHOW DATABASES; USE test; SHOW TABLES; SELECT count(*) AS Customers FROM customer; SELECT * FROM login; SELECT * FROM year;"
