import React, { useState, useEffect } from 'react';
import './InstallBanner.css';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="install-banner glass-card">
      <div className="install-content">
        <div className="install-icon">
          <img src="/icons/icon-192.png" alt="App Icon" />
        </div>
        <div className="install-text">
          <h4>Install CivicConnect</h4>
          <p>Add to your home screen for a better experience and offline access.</p>
        </div>
      </div>
      <div className="install-actions">
        <button className="btn btn-secondary btn-sm" onClick={handleDismiss}>Not Now</button>
        <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>Install</button>
      </div>
    </div>
  );
}
