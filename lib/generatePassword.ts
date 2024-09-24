export function generatePassword(): string {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";
  let password = "";
  let hasUppercase = false;
  let hasLowercase = false;
  let hasDigit = false;
  let hasSpecial = false;

  while (
    !hasUppercase ||
    !hasLowercase ||
    !hasDigit ||
    !hasSpecial ||
    password.length < length
  ) {
    const char = charset[Math.floor(Math.random() * charset.length)];
    password += char;

    if (/[A-Z]/.test(char)) hasUppercase = true;
    if (/[a-z]/.test(char)) hasLowercase = true;
    if (/[0-9]/.test(char)) hasDigit = true;
    if (/[@$!%*?&]/.test(char)) hasSpecial = true;
  }
  // console.log(password);
  return password;
}
