const OptionKey = "BloodOption";

export const getOption = () => {
  return localStorage.getItem(OptionKey);
};
export const setOption = (option: any) => {
  localStorage.setItem(OptionKey, option);
};
export const removeOption = () => {
  localStorage.removeItem(OptionKey);
};
