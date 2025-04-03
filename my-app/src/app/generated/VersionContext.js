"use client";

import { createContext, useContext, useState } from 'react';

const VersionContext = createContext();

export function VersionProvider({ children, initialVersions = [] }) {
  const [expandedVersion, setExpandedVersion] = useState(null);
  
  // Toggle the expanded state of a version
  const toggleVersion = (versionId) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
  };

  return (
    <VersionContext.Provider value={{
      expandedVersion,
      toggleVersion,
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