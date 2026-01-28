-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'demo-user',
    "category" TEXT,
    "amount" REAL NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "alertThreshold" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Budget" ("alertThreshold", "amount", "category", "createdAt", "endDate", "id", "period", "startDate", "updatedAt") SELECT "alertThreshold", "amount", "category", "createdAt", "endDate", "id", "period", "startDate", "updatedAt" FROM "Budget";
DROP TABLE "Budget";
ALTER TABLE "new_Budget" RENAME TO "Budget";
CREATE INDEX "Budget_userId_category_idx" ON "Budget"("userId", "category");
CREATE INDEX "Budget_userId_startDate_idx" ON "Budget"("userId", "startDate");
CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'demo-user',
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "tags" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringId" TEXT,
    "templateId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("amount", "category", "createdAt", "date", "description", "id", "isRecurring", "paymentMethod", "recurringId", "tags", "templateId", "updatedAt") SELECT "amount", "category", "createdAt", "date", "description", "id", "isRecurring", "paymentMethod", "recurringId", "tags", "templateId", "updatedAt" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE INDEX "Expense_userId_date_idx" ON "Expense"("userId", "date");
CREATE INDEX "Expense_userId_category_idx" ON "Expense"("userId", "category");
CREATE INDEX "Expense_isRecurring_idx" ON "Expense"("isRecurring");
CREATE TABLE "new_ExpenseGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'demo-user',
    "name" TEXT NOT NULL,
    "targetAmount" REAL NOT NULL,
    "currentAmount" REAL NOT NULL DEFAULT 0,
    "category" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExpenseGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ExpenseGoal" ("category", "createdAt", "currentAmount", "endDate", "id", "isCompleted", "name", "startDate", "targetAmount", "updatedAt") SELECT "category", "createdAt", "currentAmount", "endDate", "id", "isCompleted", "name", "startDate", "targetAmount", "updatedAt" FROM "ExpenseGoal";
DROP TABLE "ExpenseGoal";
ALTER TABLE "new_ExpenseGoal" RENAME TO "ExpenseGoal";
CREATE INDEX "ExpenseGoal_userId_isCompleted_idx" ON "ExpenseGoal"("userId", "isCompleted");
CREATE INDEX "ExpenseGoal_userId_endDate_idx" ON "ExpenseGoal"("userId", "endDate");
CREATE TABLE "new_ExpenseTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'demo-user',
    "name" TEXT NOT NULL,
    "amount" REAL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "paymentMethod" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExpenseTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ExpenseTemplate" ("amount", "category", "createdAt", "description", "id", "name", "paymentMethod", "tags", "updatedAt") SELECT "amount", "category", "createdAt", "description", "id", "name", "paymentMethod", "tags", "updatedAt" FROM "ExpenseTemplate";
DROP TABLE "ExpenseTemplate";
ALTER TABLE "new_ExpenseTemplate" RENAME TO "ExpenseTemplate";
CREATE INDEX "ExpenseTemplate_userId_name_idx" ON "ExpenseTemplate"("userId", "name");
CREATE TABLE "new_RecurringExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'demo-user',
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "dayOfMonth" INTEGER,
    "dayOfWeek" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextDueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurringExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecurringExpense" ("amount", "category", "createdAt", "dayOfMonth", "dayOfWeek", "description", "endDate", "frequency", "id", "isActive", "nextDueDate", "paymentMethod", "startDate", "updatedAt") SELECT "amount", "category", "createdAt", "dayOfMonth", "dayOfWeek", "description", "endDate", "frequency", "id", "isActive", "nextDueDate", "paymentMethod", "startDate", "updatedAt" FROM "RecurringExpense";
DROP TABLE "RecurringExpense";
ALTER TABLE "new_RecurringExpense" RENAME TO "RecurringExpense";
CREATE INDEX "RecurringExpense_userId_isActive_idx" ON "RecurringExpense"("userId", "isActive");
CREATE INDEX "RecurringExpense_userId_nextDueDate_idx" ON "RecurringExpense"("userId", "nextDueDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
