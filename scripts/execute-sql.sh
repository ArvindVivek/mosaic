#!/bin/bash

# Script to execute SQL files on Supabase using their REST API
# Usage: ./execute-sql.sh <sql_file>

set -e

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "Error: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL must be set"
  exit 1
fi

SQL_FILE=$1
if [ -z "$SQL_FILE" ]; then
  echo "Usage: $0 <sql_file>"
  exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
  echo "Error: File $SQL_FILE not found"
  exit 1
fi

echo "Executing $SQL_FILE on Supabase..."

# Extract the project reference from the URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

# Read SQL file
SQL_CONTENT=$(cat "$SQL_FILE")

# Use Supabase SQL API (this requires using the Supabase management API or SQL editor)
# For now, we'll output the SQL for manual execution
echo ""
echo "========================================="
echo "SQL to execute:"
echo "========================================="
cat "$SQL_FILE"
echo ""
echo "========================================="
echo ""
echo "Please execute this SQL in the Supabase SQL Editor at:"
echo "https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo ""
