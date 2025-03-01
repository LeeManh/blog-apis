export const capitalizeFirst = (str: string): string => {
  return str.match('^[a-z]')
    ? str.charAt(0).toUpperCase() + str.substring(1)
    : str;
};
