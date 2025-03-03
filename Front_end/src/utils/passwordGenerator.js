const generatePassword = (length, options = {
  alphabets: true,
  numbers: false,
  symbols: false
}) => {
  const alphabetChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (options.alphabets) chars += alphabetChars;
  if (options.numbers) chars += numberChars;
  if (options.symbols) chars += symbolChars;

  // Default to alphabets if no options selected
  if (chars === '') chars = alphabetChars;

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
};

export default generatePassword;
