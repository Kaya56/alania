import logoSansLabel from '../../../assets/images/logoSansLabel.png';
function TopBar() {
  return (
    <div className="bg-white px-2 py-2 mr-0 flex items-center border border-gray-300">
      {/* Logo */}
      <img src={logoSansLabel} alt="" className='w-10 h-10'/>
      {/* Nom de l'application */}
      <span className="ml-3 text-xl font-semibold text-gray-900">Alania</span>
    </div>
  );
}

export default TopBar;