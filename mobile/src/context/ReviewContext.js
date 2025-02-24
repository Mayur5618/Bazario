import React, { createContext, useContext, useState } from 'react';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const triggerRefresh = () => {
    setShouldRefresh(true);
  };

  const resetRefresh = () => {
    setShouldRefresh(false);
  };

  return (
    <ReviewContext.Provider value={{ shouldRefresh, triggerRefresh, resetRefresh }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => useContext(ReviewContext); 