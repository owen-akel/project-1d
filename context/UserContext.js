import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Andrew Huberman',
    photo: null,
    residence: 'New York',
    hometown: 'San Francisco, CA',
    college: 'Dartmouth College',
    age: 2026,
    interests: ['Coding', 'Lifting', 'Running', 'Basketball', 'Golf', 'Wine Tasting', 'Concerts', 'Breweries'],
  });

  const updateUser = (updates) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updates,
    }));
  };

  const setResidence = (residence) => {
    setUser((prevUser) => ({
      ...prevUser,
      residence,
    }));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        setResidence,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

