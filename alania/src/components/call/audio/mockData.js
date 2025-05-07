export const MOCK_CALL_DATA = {
    p2p: {
      participantName: 'Alice',
      participantAvatar: 'https://randomuser.me/api/portraits/women/38.jpg',
      callStatus: 'active',
      audioStream: null,
      isMuted: false,
    },
    group: {
      participants: [
        {
          id: '1',
          name: 'Alice',
          avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
          stream: null,
        },
        {
          id: '2',
          name: 'Bob',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
          stream: null,
        },
        {
          id: '3',
          name: 'joe',
          avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
          stream: null,
        },
      ],
      callStatus: 'active',
      isMuted: false,
    },
  };