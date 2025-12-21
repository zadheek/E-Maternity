/*
  Warnings:

  - The values [PHI] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `PHIProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('MOTHER', 'MIDWIFE', 'DOCTOR', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "PHIProfile" DROP CONSTRAINT "PHIProfile_userId_fkey";

-- DropTable
DROP TABLE "PHIProfile";
