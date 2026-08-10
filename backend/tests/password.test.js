import {
  hashPassword,
  comparePassword,
} from "../src/utils/password.js";

const runPasswordTest = async () => {
  const password = "ThoughtShare123";

  console.log("Original password:");
  console.log(password);

  const hashedPassword = await hashPassword(password);

  console.log("\nHashed password:");
  console.log(hashedPassword);

  const isMatch = await comparePassword(
    password,
    hashedPassword
  );

  console.log("\nCorrect password:");
  console.log(isMatch);

  const isWrong = await comparePassword(
    "WrongPassword",
    hashedPassword
  );

  console.log("\nWrong password:");
  console.log(isWrong);
};

runPasswordTest();