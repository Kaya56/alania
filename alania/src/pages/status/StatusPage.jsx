// src/pages/status/StatusPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStatuses } from '../hooks/useStatuses';

const StatusPage = () => {
  const { currentUser } = useAuth();
  const { statuses, loading, createStatus } = useStatuses(currentUser?.email);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [groupId, setGroupId] = useState('');
  const [file, setFile] = useState(null);

  const handleCreateStatus = async (e) => {
    e.preventDefault();
    try {
      await createStatus({ text: content }, visibility, groupId || null, file);
      setContent('');
      setGroupId('');
      setFile(null);
    } catch (err) {
      alert('Erreur lors de la création du statut');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Statuts</h2>
      {currentUser ? (
        <>
          <form onSubmit={handleCreateStatus} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Votre statut"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="border p-2 flex-grow"
            />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="border p-2" />
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="border p-2"
            >
              <option value="public">Public</option>
              <option value="contacts">Contacts</option>
              <option value="group">Groupe</option>
            </select>
            {visibility === 'group' && (
              <input
                type="text"
                placeholder="ID du groupe"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="border p-2"
              />
            )}
            <button type="submit" className="bg-blue-500 text-white p-2">
              Publier
            </button>
          </form>
          {loading && <p>Chargement...</p>}
          <ul className="my-4">
            {statuses.map((status) => (
              <li key={status.id} className="py-2">
                {status.userId}: {status.content.text}
                {status.content.file && <span> (Fichier joint)</span>}
                ({status.visibility})
                {status.groupId && <span> - Groupe: {status.groupId}</span>}
                <span> - {new Date(status.createdAt).toLocaleString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Veuillez vous connecter.</p>
      )}
    </div>
  );
};

export default StatusPage;