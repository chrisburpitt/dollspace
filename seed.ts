// seed.ts
import { PrismaClient } from "./src/lib/generated/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { username: "Chloe" },
    update: {},
    create: {
      username: "Chloe",
      displayName: "Chloe",
      bio: "Your Dollspace queen and saviour xo",
    },
  });
  console.log("Successfully created user profile:", user);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

