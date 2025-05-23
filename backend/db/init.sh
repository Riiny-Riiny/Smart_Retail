#!/bin/bash

# Database configuration
DB_NAME="smart_retail"
DB_USER="smart_retail_user"
DB_PASSWORD="your_secure_password"  # Change this in production

# Create database and user
psql postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
psql postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Apply schema
psql -d $DB_NAME -U $DB_USER -f schema.sql

echo "Database initialized successfully!" 