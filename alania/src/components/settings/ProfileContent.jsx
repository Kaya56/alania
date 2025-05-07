import { useState, useEffect } from 'react';
import { UserIcon, PencilIcon, ArrowRightStartOnRectangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useFileUrl } from '../../hooks/useFileUrl';
import InlineEditableField from './InlineEditableField';
import FileService from '../../services/file/FileService';
import UserService from '../../services/users/UserService';
import { useAuth } from '../../context/AuthContext';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

function ProfileContent({ onLogout }) {
  const { currentUser: authUser, updateCurrentUser, logout } = useAuth(); // Remplacer setCurrentUser par updateCurrentUser
  const [userProfile, setUserProfile] = useState({
    name: authUser?.name || '',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    profilePicture: authUser?.photoId || '', // Aligné avec UserService (photoId au lieu de profilePicture)
    username: authUser?.username || '',
  });
  const [file, setFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
    username: '',
  });
  const [changedFields, setChangedFields] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { fileUrl } = useFileUrl(userProfile.profilePicture, { lazy: false });

  // Synchroniser userProfile avec authUser
  useEffect(() => {
    if (authUser) {
      setUserProfile({
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        profilePicture: authUser.photoId || '',
        username: authUser.username || '',
      });
    }
  }, [authUser]);

  // Réinitialisation du message de succès au démontage
  useEffect(() => {
    return () => setShowSuccessMessage(false);
  }, []);

  // Fonctions de validation
  const validateName = (name) => {
    if (!name.trim()) return 'Le nom ne peut pas être vide';
    if (name.length < 3) return 'Le nom doit avoir au moins 3 caractères';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'L’email ne peut pas être vide';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'L’email n’est pas valide';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return ''; // Optionnel
    try {
      if (!isValidPhoneNumber('+'+phone)) {
        console.log('Numéro de téléphone invalide:', phone);
        return 'Le numéro de téléphone n’est pas valide pour le pays sélectionné';
      }
      return '';
    } catch (error) {
      return 'Le numéro de téléphone n’est pas valide';
    }
  };

  const validateProfilePicture = (file) => {
    if (!file) return ''; // Optionnel
    if (file.size > 2 * 1024 * 1024) return 'La photo ne doit pas dépasser 2 Mo';
    if (!['image/jpeg', 'image/png'].includes(file.type)) return 'Seuls JPEG et PNG sont acceptés';
    return '';
  };

  const handleFieldChange = (field, newValue) => {
    let error = '';
    if (field === 'name') error = validateName(newValue);
    if (field === 'email') error = validateEmail(newValue);
    if (field === 'phone') error = validatePhone(newValue);
    if (field === 'username') error = ''; // Pas de validation pour username (ou ajouter si nécessaire)
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
    setUserProfile((prev) => ({ ...prev, [field]: newValue }));
    setChangedFields((prev) => ({ ...prev, [field]: newValue }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const error = validateProfilePicture(selectedFile);
      setValidationErrors((prev) => ({ ...prev, profilePicture: error }));
      if (!error) {
        setFile(selectedFile);
        const tempUrl = URL.createObjectURL(selectedFile);
        setUserProfile((prev) => ({ ...prev, profilePicture: tempUrl }));
        setChangedFields((prev) => ({ ...prev, profilePicture: selectedFile }));
      }
    }
  };

  const handleSaveChanges = async () => {
    console.log('handleSaveChanges called with changedFields:', changedFields);
    if (Object.keys(changedFields).length === 0) return;

    const localFields = ['name', 'email', 'phone', 'profilePicture', 'username'];
    const fieldsToSave = Object.keys(changedFields)
      .filter((key) => localFields.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: changedFields[key] }), {});

    let errors = {};
    if (fieldsToSave.name) errors.name = validateName(fieldsToSave.name);
    if (fieldsToSave.email) errors.email = validateEmail(fieldsToSave.email);
    if (fieldsToSave.phone) errors.phone = validatePhone(fieldsToSave.phone);
    if (fieldsToSave.profilePicture) errors.profilePicture = validateProfilePicture(fieldsToSave.profilePicture);
    if (fieldsToSave.username) errors.username = ''; // Ajouter validation si nécessaire

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    if (Object.values(errors).some((error) => error)) return;

    try {
      let updates = { ...fieldsToSave };
      if (file && fieldsToSave.profilePicture) {
        const savedPhoto = await FileService.savePhoto(authUser.email, file);
        updates.photoId = savedPhoto.id; // Utiliser photoId pour UserService
        delete updates.profilePicture; // Supprimer profilePicture, car on utilise photoId
      }
      await UserService.updateUser(authUser.email, updates);
      setUserProfile((prev) => ({ ...prev, ...updates, profilePicture: updates.photoId || prev.profilePicture }));
      await updateCurrentUser(); // Mettre à jour currentUser via AuthContext
      setChangedFields({});
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setValidationErrors((prev) => ({ ...prev, submit: 'Erreur lors de la sauvegarde' }));
    }
  };

  if (!authUser) return <div className="text-gray-600">Aucun utilisateur</div>;

  return (
    <div className="flex flex-col items-center p-6 space-y-8 max-w-2xl mx-auto">
      {/* Message de succès */}
      {showSuccessMessage && (
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-md shadow-sm animate-fade-in">
          Changements effectués
        </div>
      )}

      {/* Zone 1 : Photo de profil */}
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          {userProfile.profilePicture ? (
            <img
              src={fileUrl || userProfile.profilePicture}
              alt="Photo de profil"
              className="w-28 h-28 rounded-full object-cover shadow-md"
            />
          ) : (
            <UserIcon className="w-28 h-28 text-gray-400" />
          )}
          <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
            <PencilIcon className="w-5 h-5 text-gray-600" />
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
        {validationErrors.profilePicture && (
          <span className="text-red-500 text-sm">{validationErrors.profilePicture}</span>
        )}
      </div>

      {/* Zone 2 : Informations personnelles */}
      <div className="w-full space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <InlineEditableField
            label="nom"
            value={userProfile.name}
            onChange={(newVal) => handleFieldChange('name', newVal)}
            onSave={(newVal) => handleFieldChange('name', newVal)}
            error={validationErrors.name}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <InlineEditableField
            label="email"
            type="email"
            value={userProfile.email}
            onChange={(newVal) => handleFieldChange('email', newVal)}
            onSave={(newVal) => handleFieldChange('email', newVal)}
            error={validationErrors.email}
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <InlineEditableField
            label="téléphone"
            value={userProfile.phone}
            onChange={(newVal) => handleFieldChange('phone', newVal)}
            onSave={(newVal) => handleFieldChange('phone', newVal)}
            error={validationErrors.phone}
            type="tel"
            renderInput={({ value, onChange, inputRef }) => (
              <PhoneInput
                country={'fr'}
                value={value}
                onChange={onChange}
                inputClass="border-none py-2 px-3 text-gray-700 focus:outline-none focus:border-green-400 transition-colors text-sm leading-tight"
                buttonClass="py-2 px-3 bg-transparent border-0 focus:outline-none"
                dropdownClass="border rounded-md shadow-sm"
                containerClass="flex items-center w-full"
                inputStyle={{ width: '100%' }}
                inputProps={{ ref: inputRef }}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
          <InlineEditableField
            label="username"
            value={userProfile.username}
            onChange={(newVal) => handleFieldChange('username', newVal)}
            onSave={(newVal) => handleFieldChange('username', newVal)}
            error={validationErrors.username}
          />
        </div>
      </div>

      {/* Zone 3 : Actions */}
      <div className="flex flex-col items-center space-y-4">
        {Object.keys(changedFields).length > 0 && (
          <button
            onClick={handleSaveChanges}
            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-md bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Enregistrer les modifications
          </button>
        )}
        <button
          onClick={() => {
            logout(); // Utiliser logout de useAuth
            onLogout(); // Appeler onLogout pour la compatibilité avec le parent
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-red-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default ProfileContent;