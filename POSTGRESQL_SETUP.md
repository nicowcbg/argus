# PostgreSQL Setup Guide

## Quick Setup Options

### Option 1: Local PostgreSQL (Recommended for Development)

#### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb argus

# Or using psql:
psql postgres
CREATE DATABASE argus;
\q
```

#### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database (as postgres user)
sudo -u postgres psql
CREATE DATABASE argus;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE argus TO your_username;
\q
```

#### Windows

1. Download PostgreSQL from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer
3. During installation, set a password for the `postgres` user
4. After installation, open "SQL Shell (psql)" or "pgAdmin"
5. Create database:
   ```sql
   CREATE DATABASE argus;
   ```

### Option 2: Docker (Easiest)

```bash
# Run PostgreSQL in Docker
docker run --name postgres-argus \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=argus \
  -p 5432:5432 \
  -d postgres:15

# Your DATABASE_URL will be:
# postgresql://postgres:password@localhost:5432/argus?schema=public
```

### Option 3: Cloud Services (For Production)

#### Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy the connection string to your `.env`

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string (replace `[YOUR-PASSWORD]` with your password)

#### Neon
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string

#### AWS RDS
1. Go to AWS Console → RDS
2. Create PostgreSQL instance
3. Get connection details from instance details

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

### Examples:

**Local:**
```
postgresql://postgres:password@localhost:5432/argus?schema=public
```

**Docker:**
```
postgresql://postgres:password@localhost:5432/argus?schema=public
```

**Railway/Supabase/Neon:**
```
postgresql://user:password@host.railway.app:5432/railway?schema=public
```

## Verify Installation

```bash
# Check if PostgreSQL is running
pg_isready

# Connect to database
psql -d argus

# Or using connection string
psql "postgresql://postgres:password@localhost:5432/argus"
```

## Common Issues

### "Connection refused"
- Make sure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check if port 5432 is available: `lsof -i :5432`

### "Database does not exist"
- Create the database: `createdb argus`

### "Password authentication failed"
- Reset password: `psql postgres` then `ALTER USER postgres WITH PASSWORD 'newpassword';`

### "Permission denied"
- Make sure your user has permissions: `GRANT ALL PRIVILEGES ON DATABASE argus TO your_username;`

## Next Steps

After setting up PostgreSQL:

1. Add `DATABASE_URL` to your `.env` file
2. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Useful Commands

```bash
# Connect to database
psql -d argus

# List all databases
psql -l

# List all tables (after connecting)
\dt

# Exit psql
\q

# View database size
SELECT pg_size_pretty(pg_database_size('argus'));
```
