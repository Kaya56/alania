import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../context/AuthContext';
import FileLoader from '../services/file/FileLoader';


export function useFileUrl(fileId, options = { lazy: false }) {
  const { currentUser } = useAuth();
  const [fileUrl, setFileUrl] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    skip: !options.lazy,
  });

  useEffect(() => {
    let mounted = true;
  
    // console.log(`useFileUrl: fileId=${fileId}, email=${currentUser?.email}, inView=${inView}, lazy=${options.lazy}`);
  
    const loadFile = async () => {
      if (!fileId || !currentUser?.email) {
        // console.warn('useFileUrl: fileId ou email manquant', fileId, currentUser?.email);
        setFileUrl(null);
        setMetadata(null);
        setError(null);
        return;
      }
  
      try {
        const [url, meta] = await Promise.all([
          FileLoader.getFileUrl(currentUser.email, fileId),
          FileLoader.getFileMetadata(currentUser.email, fileId),
        ]);
        // console.log(`useFileUrl: url=${url}, meta=`, meta);
        if (mounted) {
          setFileUrl(url);
          setMetadata(meta);
          setError(null);
        }
      } catch (err) {
        // console.error(`useFileUrl error for fileId=${fileId}:`, err);
        if (mounted) {
          setFileUrl(null);
          setMetadata(null);
          setError('Erreur lors du chargement du fichier');
        }
      }
    };
  
    if (!options.lazy || inView) {
      loadFile();
    }
  
    return () => {
      mounted = false;
    };
  }, [fileId, currentUser?.email, inView, options.lazy]);
 
  return { fileUrl, metadata, error, ref };
}