# test_db_connection.py
import psycopg2

try:
    conn = psycopg2.connect("postgresql://johndoe:randompassword@localhost:5432/mydb")
    print("Connected!")
    conn.close()
except Exception as e:
    print("Connection failed:", e)