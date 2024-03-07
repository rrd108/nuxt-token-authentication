import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  // Create a user object
  const data = {
    email: "rrd@webmania.cc",
    password: "bd0f17042ff2f6733b4ebb30dfa68f5a",
    token: "270fsdg04%rt2f6$)b4eblok0dfgaurannga",
  };

  try {
    // Create the user as a seed
    await prisma.users.create({ data });
    console.log("User seeded successfully!");
  } catch (error) {
    console.error("Error seeding user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
