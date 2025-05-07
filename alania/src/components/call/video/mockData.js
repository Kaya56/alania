export const MOCK_CALL_DATA = {
  p2p: {
    participantName: 'Alice',
    participantAvatar: 'https://randomuser.me/api/portraits/women/38.jpg',
    callStatus: 'active',
    audioStream: null,
    videoStream: null, // Ajout du flux vidéo
    isMuted: false,
    isCameraOn: true, // État de la caméra
  },
  group: {
    participants: [
      {
        id: '1',
        name: 'Alice',
        avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
        stream: null,
        isMuted: false,
        isCameraOn: true, // État de la caméra
      },
      {
        id: '2',
        name: 'Bob',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        stream: null,
        isMuted: false,
        isCameraOn: true, // État de la caméra
      },
      {
        id: '3',
        name: 'Joe',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        stream: null,
        isMuted: false,
        isCameraOn: true, // État de la caméra
      },
    ],
    callStatus: 'active',
    isMuted: false,
  },
};
