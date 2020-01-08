export const randomImage = images => {
  const keys = Object.keys(images);
  const random = Math.floor(Math.random() * keys.length);
  return images[keys[random]];
};

export default {};
