import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (options.username.length <= 2) {
    return [{ field: "username", message: "username too short" }];
  }
  if (!options.email.includes("@")) {
    return [{ field: "email", message: "email invalid" }];
  }
  if (options.password.length <= 3) {
    return [{ field: "password", message: "password  too short" }];
  }
  if (options.username.includes("@")) {
    return [{ field: "username", message: "username cannot have @" }];
  }
  return null;
};
