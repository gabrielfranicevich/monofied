import { useEffect } from 'react';

export const useAppRouting = (screen, setScreen, roomId, setRoomId, roomData) => {
  // Initial URL parsing and popstate listener
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1);
      const pathUpper = path.toUpperCase();

      if (path === 'online') {
        setScreen('online_lobby');
        if (setRoomId) setRoomId(null);
      } else if (pathUpper && pathUpper.length === 4) {
        if (setRoomId) setRoomId(pathUpper);
        setScreen('online_lobby');
        // We replace state to /online to clean url or keep it? App logic seemed to clear it to /online.
        // But let's stick to what App did:
        window.history.replaceState(null, '', '/online');
      } else {
        if (setRoomId) setRoomId(null);
        setScreen('home');
      }
    };

    // Run once on mount if we are not already in a specific state?
    // App.jsx ran this logic on mount manually.
    const path = window.location.pathname.substring(1);
    const pathUpper = path.toUpperCase();
    if (path === 'online') {
      setScreen('online_lobby');
    } else if (pathUpper && pathUpper.length === 4) {
      if (setRoomId) setRoomId(pathUpper);
      setScreen('online_lobby');
      window.history.replaceState(null, '', '/online');
    } else if (path) {
      window.history.replaceState(null, '', '/');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setScreen, setRoomId]);

  // Update URL based on state
  useEffect(() => {
    if ((screen === 'online_waiting' || screen === 'online_playing') && roomData?.id) {
      const currentPath = window.location.pathname.substring(1);
      if (currentPath !== roomData.id) {
        window.history.pushState(null, '', `/${roomData.id}`);
      }
    } else if (screen === 'online_lobby' || screen === 'online_create') {
      if (!roomId) {
        const currentPath = window.location.pathname.substring(1);
        if (currentPath !== 'online') {
          window.history.pushState(null, '', '/online');
        }
      }
      // Note: If roomId exists (pending join), App cleared URL to /online anyway.
    } else if (screen === 'home') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [screen, roomData, roomId]);
};
