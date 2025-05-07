import { useState, useEffect, useRef } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const InlineEditableField = ({
  label,
  value,
  type = 'text',
  onChange,
  onSave,
  error,
  renderInput,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSaveClick = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center py-2">
        {isEditing ? (
          <>
            {renderInput ? (
              renderInput({
                value: tempValue,
                onChange: (val) => {
                  setTempValue(val);
                  onChange(val);
                },
                inputRef,
              })
            ) : (
              <input
                ref={inputRef}
                type={type}
                value={tempValue}
                onChange={(e) => {
                  setTempValue(e.target.value);
                  onChange(e.target.value);
                }}
                className="flex-1 border-0 border-b border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:border-green-400 transition-colors"
              />
            )}
            <button
              onClick={handleSaveClick}
              className="ml-2 text-green-600 hover:text-green-700 transition-colors"
              aria-label="Enregistrer"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancelClick}
              className="ml-2 text-red-600 hover:text-red-700 transition-colors"
              aria-label="Annuler"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 py-2 border-b border-gray-300">{value}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={`Modifier ${label}`}
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};

export default InlineEditableField;