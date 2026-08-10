import { registerMember } from "../src/services/auth.service.js";

async function main() {
  try {
    const result = await registerMember({
      name: "Aisha Mohd",
      email: "aisha@example.com",
      password: "ThoughtShare123",
    });

    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
}

main();