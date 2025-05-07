import DatabaseService from '../db/DatabaseService';

const ProfileService = {
  async savePhotoProfil(email, fileData) {
    const db = await DatabaseService.getDb(email);
    const id = `profile-photo-${email}`;
    const createdAt = Date.now();
    const fileRecord = {
      id,
      messageId: null,
      statusId: null,
      type: fileData.type || 'image/jpeg',
      size: fileData.size,
      name: 'photo.jpg',
      createdAt,
      data: fileData, // Blob
    };
    await db.files.put(fileRecord);
    return id;
  },

  async getPhotoProfil(email) {
    console.log('getPhotoProfil', email);
    const db = await DatabaseService.getDb(email);
    const file = await db.files.get(`profile-photo-${email}`);
    return file ? file.id : null;
  },
};

export default ProfileService;