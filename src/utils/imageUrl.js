const getImageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  return `/uploads/${filename}`;
};

export default getImageUrl;
