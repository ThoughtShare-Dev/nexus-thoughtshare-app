import prisma from "../src/config/prisma.js";

const skills = [
  "JavaScript",
  "Python",
  "SQL",
  "Node.js",
  "React",
  "Express.js",
  "Prisma",
  "Git",
  "GitHub",
  "Docker",
  "Power BI",
  "Excel",
  "Accounting",
  "Data Analysis",
  "UI/UX Design",
];

async function main() {
  for (const name of skills) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Skills seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  