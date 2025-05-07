import { v4 as uuidv4 } from 'uuid';
import DatabaseService from '../db/DatabaseService';

const FileService = {
  async saveFile(email, file, messageId = null, statusId = null, isVoice = false) {
    try {
      const db = await DatabaseService.getDb(email);
      const id = `file-${uuidv4()}`;
      const mimetype = file.mimetype || file.type || 'application/octet-stream';
      const size = file.size;
      const name = file.name || id;
      const createdAt = Date.now();

      const fileData = {
        id,
        messageId,
        statusId,
        type: mimetype,
        size,
        name,
        createdAt,
        data: file,
        isVoice,
      };

      console.log(`saveFile: Saving fileId=${id}, isVoice=${isVoice}, size=${size}`, fileData);
      await db.files.put(fileData);

      return { id, path: id, type: mimetype, size, name, createdAt, isVoice };
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du fichier:', err);
      throw err;
    }
  },

  async savePhoto(email, photo) {
    try {
      const db = await DatabaseService.getDb(email);
      const id = `photo-${uuidv4()}`;
      const createdAt = Date.now();

      const fileData = {
        id,
        type: photo.type || 'image/jpeg',
        size: photo.size,
        name: id,
        createdAt,
        data: photo,
        isVoice: false,
      };

      await db.files.put(fileData);

      return { id, path: id, type: photo.type, size: photo.size, name: id, createdAt, isVoice: false };
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la photo:', err);
      throw err;
    }
  },

  async getFile(email, fileId) {
    try {
      const db = await DatabaseService.getDb(email);
      const file = await db.files.get(fileId);
      if (file) {
        return {
          id: file.id,
          messageId: file.messageId,
          statusId: file.statusId,
          path: file.id,
          type: file.type,
          size: file.size,
          name: file.name,
          createdAt: file.createdAt,
          isVoice: file.isVoice || false,
        };
      }
      return null;
    } catch (err) {
      console.error('Erreur lors de la récupération du fichier:', err);
      throw err;
    }
  },

  async getFileData(email, fileId) {
    const db = await DatabaseService.getDb(email);
    const file = await db.files.get(fileId);
    console.log(`getFileData: fileId=${fileId}, file=`, file);
    return file ? file.data : null;
  }
};

export default FileService;