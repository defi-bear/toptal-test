import React, { useState, useEffect, useContext, createContext } from 'react';
import * as auth from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '../utils/firebase';

const authContext = createContext();

export const useAuth = () => useContext(authContext);

function useAuthProvider() {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const getAuth = auth.getAuth();

  const signin = (email, password) =>
    new Promise((resolve, reject) => {
      auth
        .signInWithEmailAndPassword(getAuth, email, password)
        .then(response => {
          getDocs(query(collection(db, 'users'), where('email', '==', email)))
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                const userObj = { ...response.user, ...doc.data() };
                setUser(userObj);
                resolve(userObj);
              });
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(signErr => {
          reject(signErr);
        });
    });

  const signup = (email, password, name) =>
    new Promise((resolve, reject) => {
      auth
        .createUserWithEmailAndPassword(getAuth, email, password)
        .then(response => {
          const userObj = { ...response.user, name, type: '0' };
          setUser(userObj);
          resolve(userObj);
        })
        .catch(err => {
          reject(err);
        });
    });

  const signout = () =>
    new Promise(resolve => {
      auth.signOut(getAuth).then(() => {
        setUser({});
        resolve();
      });
    });

  // const sendPasswordResetEmail = email =>
  //   auth.sendPasswordResetEmail(email).then(() => true);

  // const confirmPasswordReset = (code, password) =>
  //   auth.confirmPasswordReset(code, password).then(() => true);

  useEffect(() => {
    const unsubscribe = getAuth.onAuthStateChanged(authUser => {
      if (authUser) {
        setUser(authUser);
        getDocs(
          query(collection(db, 'users'), where('email', '==', authUser.email))
        ).then(querySnapshot => {
          querySnapshot.forEach(doc => {
            setUser({ ...authUser, ...doc.data() });
            setLoading(false);
          });
        });
      } else {
        setUser(false);
        setLoading(false);
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [getAuth]);
  // Return the user object and auth methods
  return {
    user,
    isLoading,
    signin,
    signup,
    signout,
    // sendPasswordResetEmail,
    // confirmPasswordReset,
  };
}

export function AuthProvider({ children }) {
  const authProvider = useAuthProvider();
  return (
    <authContext.Provider value={authProvider}>{children}</authContext.Provider>
  );
}
