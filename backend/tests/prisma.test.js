import prisma from "../src/config/prisma.js";

async function testConnection() {
  try {
    await prisma.$connect();

    console.log("Connected to PostgreSQL");

    const members = await prisma.member.findMany();

    console.log("Members:");
    console.log(members);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();