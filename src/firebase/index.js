import firebase from 'firebase/app';
import 'firebase/firestore'; // for the db
import 'firebase/auth';

const config = {
  apiKey: "AIzaSyATPDO3ltQjioL4h_LwzgvW2PfFIMSS_ZQ",
  authDomain: "nomad-bags-store.firebaseapp.com",
  databaseURL: "https://nomad-bags-store.firebaseio.com",
  projectId: "nomad-bags-store",
  storageBucket: "nomad-bags-store.appspot.com",
  messagingSenderId: "463459585373",
  appId: "1:463459585373:web:382c9dac918e125a106cb4"
}

firebase.initializeApp(config);

const firestore = firebase.firestore();
const auth = firebase.auth();

const createUserProfileDocument = async (userAuth, additionalData) => {
  if (!userAuth) { return };

  const userRef = firestore.doc(`users/${userAuth.uid}`) //users/uniq26535
  const snapShot = await userRef.get();

  if (!snapShot.exists) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();

    try {
      await userRef.set({
        displayName,
        email,
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.log('error creating user', error.message);
    }
  }

  return userRef;
}

export {
  firestore,
  createUserProfileDocument,
  auth,
}