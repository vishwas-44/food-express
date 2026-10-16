'use client';

import {
  createContext,
  useEffect,
  useState,
} from 'react';

export const MyContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [userDetails, setUserDetails] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  // Restore login state when the application starts
  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem('userDetails');

      const savedLogin =
        localStorage.getItem('isLoggedIn');

      if (
        savedLogin === 'true' &&
        savedUser
      ) {
        setIsLoggedIn(true);
        setUserDetails(
          JSON.parse(savedUser)
        );
      }
    } catch (error) {
      console.error(
        'Error restoring login:',
        error
      );

      localStorage.removeItem(
        'isLoggedIn'
      );

      localStorage.removeItem(
        'userDetails'
      );

      setIsLoggedIn(false);
      setUserDetails(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Login state handler
  const handleSetIsLoggedIn = (value) => {
    setIsLoggedIn(value);

    if (!value) {
      localStorage.removeItem(
        'isLoggedIn'
      );

      localStorage.removeItem(
        'userDetails'
      );
    } else {
      localStorage.setItem(
        'isLoggedIn',
        'true'
      );
    }
  };

  // User details handler
  const handleSetUserDetails = (user) => {
    setUserDetails(user);

    if (user) {
      localStorage.setItem(
        'userDetails',
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(
        'userDetails'
      );
    }
  };

  return (
    <MyContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn:
          handleSetIsLoggedIn,

        userDetails,
        setUserDetails:
          handleSetUserDetails,

        authLoading,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};