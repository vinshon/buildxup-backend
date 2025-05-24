# BuildXUp Backend

## Setup Instructions

<!-- step 1: -->
### 1. Database Setup
Configure PostgreSQL with the following settings:

do postgresql setup and create db with below config
DB_HOST=localhost
DB_NAME=buildxup
DB_USER=postgres
DB_PASSWORD=root
DB_PORT=5432

<!-- step 2: -->
### 2. Project Setup
Use `npm install`
Get .env file shared below

<!-- step 3: -->
TO create table use `npx prisma migrate dev --name init`,  in this project terminal this comment will create table from prisma/schema.prisma

<!-- step 4: -->
Use `npx prisma generate`, this will initiate the schema.prisma sync with query's

<!-- step 5: -->
Use `npx prisma db push`, this will push the current table changes to your database

<!-- step 5: -->
`npm run dev` for development


<!-- Email OTP -->
Step 1: Enable 2-Step Verification
If you haven't already:

Go to https://myaccount.google.com/security

Turn on 2-Step Verification.

🔑 Step 2: Create an App Password
Go to https://myaccount.google.com/apppasswords

need to add the generate app password to FROM_EMAIL_PASSWORD on env


<! --------------------------------------END------------------------------------------! >