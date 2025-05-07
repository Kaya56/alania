import PropTypes from 'prop-types';

const AudioGroupCallPlaceholder = ({ participants, callStatus }) => (
  <div className="flex flex-col items-center gap-4 p-5 bg-gray-100 rounded-lg">
    <span className="text-lg text-gray-700">
      Appel de groupe - Statut : {callStatus}
    </span>
    <ul className="flex flex-col gap-2">
      {participants.map((participant) => (
        <li key={participant.id} className="flex items-center gap-2">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-8 h-8 rounded-full"
          />
          <span>{participant.name}</span>
        </li>
      ))}
    </ul>
  </div>
);

AudioGroupCallPlaceholder.propTypes = {
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    })
  ).isRequired,
  callStatus: PropTypes.string.isRequired,
};

export default AudioGroupCallPlaceholder;