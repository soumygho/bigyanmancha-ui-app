const blobToJson = (blob: Blob): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch (e) {
        reject('Invalid JSON: ' + e);
      }
    };

    reader.onerror = () => {
      reject('FileReader error: ' + reader.error);
    };

    reader.readAsText(blob);
  });
}
export default blobToJson;
