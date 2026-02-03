-- DropForeignKey
ALTER TABLE "Bet" DROP CONSTRAINT "Bet_userId_fkey";

-- AlterTable
ALTER TABLE "Bet" ADD COLUMN     "username" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "idx_anonymous_bet" ON "Bet"("gameId", "username", "question");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
