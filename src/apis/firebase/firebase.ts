import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import Vue from 'vue';
import store from '@/store/index';

//vuex
//settings
import { MutationTypes as settingMutationType } from "@/store/modules/settings/mutations";
import { ActionTypes as settingActionType } from "@/store/modules/settings/actions";

//user
import { MutationTypes as userType } from "@/store/modules/users/mutations";
import { ActionTypes as userAction } from "@/store/modules/users/actions";

//todos
import { ActionTypes as todosActionsType } from '@/store/modules/todos/actions';
import { MutationTypes as todosMutationType } from '@/store/modules/todos/mutations';
import { User } from '@/common/models/types';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyChdropJqIFhiwM5fFmKGqiArntOXkVxLk',
  authDomain: 'advancedtodolist-5aaec.firebaseapp.com',
  databaseURL: 'https://advancedtodolist-5aaec.firebaseio.com',
  projectId: 'advancedtodolist-5aaec',
  storageBucket: 'advancedtodolist-5aaec.appspot.com',
  messagingSenderId: '65198032438',
  appId: '1:65198032438:web:399ca8bb024d70abf23a97',
  measurementId: 'G-WYDMNK5ZVN'
};

const firebaseApp = firebase.default.initializeApp(firebaseConfig);

export const fs = firebaseApp.firestore();
export const database = firebaseApp.database();


export default {

  auth: firebase.default.auth(),
  loginGoogle() {
    const provider = new firebase.default.auth.GoogleAuthProvider();
    firebase.default.auth().signInWithPopup(provider)
      .then(function (response) {
        let firstResponse = response;
      
        checkIfUserExists(response.user.uid).then((response: { success: boolean }) => {

          if (!response.success) {

            let payload = {
                uid: firstResponse.user.uid,
                pseudo: firstResponse.user.displayName,
                email: firstResponse.user.email,
                roles: ['user']
            }
            store.dispatch(userAction.SAVE_USER, payload);
          }

        })

        Vue.toasted.show("Logged-in with google, Hello", {
          icon: "login",
          theme: "bubble",
          position: "bottom-right",
          duration: 5000
        });
      })
      .catch(function (error) {
        Vue.toasted.show("Error google..", {
          icon: "error_outline",
          theme: "bubble",
          position: "bottom-right",
          duration: 5000
        });
      });
  },
  logout() {
    firebase.default.auth().signOut()
      .then(function () {
        Vue.toasted.show("You logged-out, goodbye", {
          icon: "subdirectory_arrow_left",
          theme: "bubble",
          position: "bottom-right",
          duration: 5000
        });
      })
      .catch(function (error) {
        Vue.toasted.show("Cannot log-out", {
          icon: "error_outline",
          theme: "bubble",
          position: "bottom-right",
          duration: 5000
        });
      });
  },
  signUpEmail(email: string, password: string, pseudo: string): Promise<{}> {
    return new Promise((resolve, reject) => {
      firebase
        .default.auth()
        .createUserWithEmailAndPassword(email, password)
        .then((response) => {

          let payload = {
              uid: response.user.uid,
              pseudo: pseudo,
              email: response.user.email,
              roles: ['user']
          }
          store.dispatch(userAction.SAVE_USER, payload);
          resolve({ success: true });
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  loginEmail(email: string, password: string): Promise<{}> {
    return new Promise((resolve, reject) => {
      firebase
        .default.auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          resolve({ success: true });
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  sendResetPassEmail(emailAddress: string): Promise<{}> {
    return new Promise((resolve, reject) => {
      firebase.default.auth().sendPasswordResetEmail(emailAddress).then(() => {
        resolve({ success: true });
      })
        .catch(error => {
          reject(error);
        });
    });
  },
  setAuthChange() {
    let user: User = {
      loggedIn: false,
    };
    firebase.default.auth().onAuthStateChanged(userfb => {

      if (userfb) {

        const uid: string = userfb.uid;

        store.dispatch(userAction.FETCH_USER, uid)
        store.dispatch(todosActionsType.FETCH_TODOS, uid)
        store.dispatch(settingActionType.FETCH_SETTINGS, uid)

      } else {
        user = {
          loggedIn : false
        };
        store.commit(todosMutationType.SETTODOLIST, []);
        store.commit(settingMutationType.SET_SETTINGS, {});
        store.commit(userType.SET_USER, {})
      }
    });
  },
};

const checkIfUserExists = (userUid: string): Promise<{}> => {
  let exists: boolean;

  return new Promise((resolve, reject) => {
    database.ref(`users/${userUid}`).once('value', function (snapshot) {
      exists = (snapshot.val() !== null);
    }).then(() => {
      resolve({ success: exists });
    }).catch(error => {
      reject(error);
    });
  });

}
