-- CreateTable
CREATE TABLE "customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "identifier" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
