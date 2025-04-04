"use client";

import { createContext, useContext, useState } from 'react';

const VersionContext = createContext();

export function VersionProvider({ children, initialVersions = [], setDescription }) {
  const [expandedVersion, setExpandedVersion] = useState(null);
  
  // Toggle the expanded state of a version
  const toggleVersion = (versionId) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
  };
  
  // Handle both toggling and setting description
  const handleVersionSelect = (version) => {
    // Toggle expansion
    toggleVersion(version.version);
    
    // Set the description (if function exists)
    if (setDescription) {
      setDescription(version);
    }
  };

  return (
    <VersionContext.Provider value={{
      expandedVersion,
      toggleVersion,
      handleVersionSelect,
      versions: initialVersions
    }}>
      {children}
    </VersionContext.Provider>
  );
}

// Custom hook to use the version context
export function useVersionContext() {
  return useContext(VersionContext);
} 