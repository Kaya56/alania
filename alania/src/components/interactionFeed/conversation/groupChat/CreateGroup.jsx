import { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useGroups } from "../../../../hooks/useGroups";
import MemberSelector from "./MemberSelector";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from "react-dom";

function CreateGroup({ isOpen, onClose, onDataChanged }) {
  const { currentUser } = useAuth();
  const { createGroup, addMember } = useGroups(currentUser?.email);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedOption, setSelectedOption] = useState("general");

  const settingsOptions = [
    { label: "Informations générales", value: "general" },
    { label: "Membres", value: "members" },
  ];

  useEffect(() => {
    if (photo) {
      const objectUrl = URL.createObjectURL(photo);
      setPhotoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPhotoPreview(null);
    }
  }, [photo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom du groupe est requis");
      return;
    }
    if (selectedMembers.length === 0) {
      setError("Ajoutez au moins un membre au groupe");
      return;
    }
    try {
      const group = await createGroup(name, description, photo);
      for (const member of selectedMembers) {
        await addMember(group.id, member.email);
      }
      setSuccess("Groupe créé avec succès !");
      onDataChanged("groups"); // Notifier le changement
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError("Erreur lors de la création du groupe");
    }
  };

  const handleNext = () => {
    const currentIndex = settingsOptions.findIndex(opt => opt.value === selectedOption);
    if (currentIndex < settingsOptions.length - 1) {
      setSelectedOption(settingsOptions[currentIndex + 1].value);
    }
  };

  const handlePrevious = () => {
    const currentIndex = settingsOptions.findIndex(opt => opt.value === selectedOption);
    if (currentIndex > 0) {
      setSelectedOption(settingsOptions[currentIndex - 1].value);
    }
  };

  // Gérer la touche Échap pour fermer la modale
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !currentUser) return null;

  const renderContent = () => {
    switch (selectedOption) {
      case "general":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">Informations du groupe</h3>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1" htmlFor="group-name">
                Nom du groupe
              </label>
              <input
                type="text"
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 text-sm dark:bg-gray-700 dark:text-gray-200"
                placeholder="Nom du groupe"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1" htmlFor="group-description">
                Description
              </label>
              <textarea
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 text-sm dark:bg-gray-700 dark:text-gray-200"
                placeholder="Description (optionnel)"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1" htmlFor="group-photo">
                Photo du groupe
              </label>
              <input
                type="file"
                id="group-photo"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-200"
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Aperçu de la photo du groupe"
                  className="mt-2 w-20 h-20 rounded-full object-cover"
                />
              )}
            </div>
          </div>
        );
      case "members":
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">Ajouter des membres</h3>
            <MemberSelector
              currentUser={currentUser}
              selectedMembers={selectedMembers}
              onMembersChange={setSelectedMembers}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const currentStep = settingsOptions.findIndex(opt => opt.value === selectedOption) + 1;
  const totalSteps = settingsOptions.length;
  const isLastOption = selectedOption === settingsOptions[settingsOptions.length - 1].value;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-[90vw] max-w-2xl max-h-[80vh] flex flex-col sm:flex-row overflow-hidden shadow-2xl transform transition-all duration-300 animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors z-10"
          aria-label="Fermer la modale"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Panneau gauche : Menu (visible uniquement sur desktop) */}
        <div className="hidden sm:block w-full sm:w-1/4 bg-gray-100 dark:bg-gray-700 p-4 border-r border-gray-200 dark:border-gray-600">
          {settingsOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedOption(option.value)}
              className={`w-full text-left py-2 px-4 rounded-md mb-2 transition-colors duration-200 text-sm ${
                selectedOption === option.value
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Panneau droit : Contenu */}
        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Barre de progression (visible uniquement sur mobile) */}
          <div className="sm:hidden mb-4">
            <div className="flex w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              {settingsOptions.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 ${index < currentStep ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-200 dark:bg-gray-600'}`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">
              Étape {currentStep}/{totalSteps} : {settingsOptions[currentStep - 1].label}
            </div>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Contenu dynamique */}
          {renderContent()}

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="sm:hidden px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 dark:focus:ring-gray-500 text-sm"
              >
                Précédent
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 dark:focus:ring-gray-500 text-sm"
            >
              Annuler
            </button>
            <button
              type={isLastOption ? "submit" : "button"}
              onClick={isLastOption ? undefined : handleNext}
              className="px-4 py-2 bg-blue-500 dark:bg-blue-400 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 dark:focus:ring-blue-600 text-sm"
            >
              {isLastOption ? "Créer" : "Suivant"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default CreateGroup;