# Scripts Directory

This directory contains utility scripts for database and system management.

## Available Scripts

### create-admin.js

Creates a default admin user in the database.

**Usage:**
```bash
npm run create-admin
```

**Default Credentials:**
- Email: `admin@whatsapp-dashboard.com`
- Password: `admin123456`
- Username: `admin`
- Role: `admin`

**Important:**
- Change the password after first login!
- The script checks if the user already exists to avoid duplicates.
- Make sure the database is running and migrations are applied before running this script.

**Prerequisites:**
- Database must be set up and running
- Migrations must be applied (at least `001_create_users_table.sql`)
- Environment variables must be configured (`.env` file)

---

## Running Scripts

All scripts can be run from the backend directory:

```bash
cd backend
npm run create-admin
```

Or directly with Node.js:

```bash
cd backend
node scripts/create-admin.js
```


