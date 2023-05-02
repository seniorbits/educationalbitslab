const fetchFile = async (filePath: string) => {
  try {
    return fetch(filePath);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(message);
  }
};

export default fetchFile;