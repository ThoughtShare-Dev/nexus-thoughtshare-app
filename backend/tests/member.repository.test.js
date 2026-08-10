import {
  findMemberByEmail,
} from "../src/repositories/member.repository.js";

async function main() {
  const member = await findMemberByEmail("test@example.com");

  console.log(member);
}

main();