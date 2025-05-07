import FileService from './FileService';

const fileCache = new Map();
const pendingPromises = new Map();
const metadataCache = new Map();

const FileLoader = {
  async getFileUrl(email, fileId) {
    if (!fileId || !email) {
      // console.warn(`getFileUrl: fileId=${fileId}, email=${email} manquant`);
      return null;
    }
    if (fileCache.has(fileId)) {
      // console.log(`getFileUrl: Cache hit for fileId=${fileId}`);
      return fileCache.get(fileId);
    }
    if (pendingPromises.has(fileId)) {
      // console.log(`getFileUrl: Pending promise for fileId=${fileId}`);
      return await pendingPromises.get(fileId);
    }
    const promise = (async () => {
      try {
        const fileBlob = await FileService.getFileData(email, fileId);
        // console.log(`getFileUrl: fileBlob for fileId=${fileId}`, fileBlob);
        if (fileBlob) {
          const url = URL.createObjectURL(fileBlob);
          fileCache.set(fileId, url);
          const metadata = await FileService.getFile(email, fileId);
          // console.log(`getFileUrl: metadata for fileId=${fileId}`, metadata);
          if (metadata) {
            metadataCache.set(fileId, metadata);
          }
          return url;
        }
        // console.warn(`getFileUrl: No blob for fileId=${fileId}`);
        return null;
      } catch (err) {
        // console.error(`getFileUrl error for fileId=${fileId}:`, err);
        return null;
      } finally {
        pendingPromises.delete(fileId);
      }
    })();
    pendingPromises.set(fileId, promise);
    return await promise;
  },
  
  async getFileMetadata(email, fileId) {
    if (!fileId || !email) {
      // console.warn(`getFileMetadata: fileId=${fileId}, email=${email} manquant`);
      return null;
    }
    if (metadataCache.has(fileId)) {
      // console.log(`getFileMetadata: Cache hit for fileId=${fileId}`);
      return metadataCache.get(fileId);
    }
    try {
      const metadata = await FileService.getFile(email, fileId);
      // console.log(`getFileMetadata: metadata for fileId=${fileId}`, metadata);
      if (metadata) {
        metadataCache.set(fileId, metadata);
      }
      return metadata;
    } catch (err) {
      // console.error(`getFileMetadata error for fileId=${fileId}:`, err);
      return null;
    }
  },

  clearCache() {
    fileCache.forEach((url) => URL.revokeObjectURL(url));
    fileCache.clear();
    metadataCache.clear();
    pendingPromises.clear();
  },

  removeFile(fileId) {
    if (fileCache.has(fileId)) {
      URL.revokeObjectURL(fileCache.get(fileId));
      fileCache.delete(fileId);
    }
    metadataCache.delete(fileId);
  },
};

export default FileLoader;