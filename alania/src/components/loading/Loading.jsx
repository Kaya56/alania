// src/components/Loading.js
import logo from '../../assets/images/logo.png';

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <img
        src={logo}
        alt="Logo de l'application"
        className="w-32 h-32 animate-pulse"
      />
    </div>
  );
};

export default Loading;
