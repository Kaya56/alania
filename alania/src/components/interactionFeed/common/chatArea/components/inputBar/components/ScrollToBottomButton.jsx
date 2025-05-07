import PropTypes from 'prop-types';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

function ScrollToBottomButton({ visible, onClick }) {
  visible = true; // For testing purposes, always show the button
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-25 right-9 z-50 bg-teal-600 text-white p-3 rounded-full shadow-lg 
        hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      aria-label="Défiler vers le bas"
      title="Aller aux derniers messages"
    >
      <ChevronDownIcon className="h-5 w-5 pt-1" />
    </button>
  );
}

ScrollToBottomButton.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ScrollToBottomButton;