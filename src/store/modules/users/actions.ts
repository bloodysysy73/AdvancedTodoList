import { database } from '@/apis/firebase/firebase';
import { MutationTypes as settingsMutation } from "@/store/modules/settings/mutations";
import { MutationTypes as userMutationTypes } from './mutations'

import { Message, User, Users } from "@/common/models/types/index";
import { RootState } from "../../state";
import { ActionTree } from "vuex";
import store from '@/store/index';

import { MutationTypes as SettingsMutationTypes } from "@/store/modules/settings/mutations";



export enum ActionTypes {
  FETCH_USER = "fetchUser",
  SAVE_USER = "saveUser",
  FETCH_USERS = "fetchUsers",
  SEND_MSG = "sendMsg",
  DELETE_USER = "deleteUser",
}


// for API, often async
export const actionsUsers: ActionTree<Users, RootState> = {

  async [ActionTypes.SAVE_USER](context, payload: User): Promise<void> {

    Object.keys(payload).forEach((key) => (payload[key] == null) && delete payload[key]);

    if(!payload.uid) {return}

    context.commit(SettingsMutationTypes.SET_ACTION_LOADING, true);
    await database.ref(`users/${payload.uid}`).set({
      ...payload,
    }).then(() => {
      context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
    })
  },

  //FETCH USER
  async [ActionTypes.FETCH_USER](
    context,
    payload: string
  ): Promise<void> {

    if(!payload){return}

    const  uid = payload;
    let user: User;

    context.commit(SettingsMutationTypes.SET_ACTION_LOADING, true);
    try {
      await database.ref(`users/${uid}`).once('value', (snapshot) => {
        user = snapshot.val();
      }).then(() => {
        if (user)  {
          user.loggedIn = true
          context.commit(userMutationTypes.SET_USER, user);
        }
        context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
      });
    } catch (error) {
      context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
    }
    
  },

   //FETCH USERS
   async [ActionTypes.FETCH_USERS](
    context,
  ): Promise<void> {

    let users: User[];
    context.commit(SettingsMutationTypes.SET_ACTION_LOADING, true);

    let user = store.getters.getUser
    let userRole = [];
    let isadmin: boolean= false;
    let listUsers: User[]= [];

    if(user && user && user.roles){
      userRole = user.roles;
      isadmin = userRole.includes('admin');
    }
    if(!isadmin){return}

    try {
      await database.ref(`users`).once('value', (snapshot) => {
        users = snapshot.val();

        listUsers = Object.entries(snapshot.val()).reduce((acc, [key, user]) => {

        acc.push(user);
        return acc;
      }, []);

      }).then(() => {
        if (users)  {
          context.commit(userMutationTypes.SET_USERS, listUsers);
        }
        context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
      });
    } catch (error) {
      context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
    }
  },

   //SEND MSG
   async [ActionTypes.SEND_MSG](context, payload: Message): Promise<void> {

    Object.keys(payload).forEach((key) => (payload[key] == null) && delete payload[key]);

    const uid = store.getters.getUser.uid;

    if(!payload || !uid) {return}
    
    context.commit(SettingsMutationTypes.SET_ACTION_LOADING, true);
    await database.ref(`users/${uid}/messages`).push({
      ...payload,
    }).then(() => {
      context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
    })
  },

  //DELET USER USER
  async [ActionTypes.DELETE_USER](context, uid: string): Promise<void> {

    if(!uid) {return}
    
    context.commit(SettingsMutationTypes.SET_ACTION_LOADING, true);
    await database.ref(`users/${uid}`).remove().then(() => {
      context.commit(userMutationTypes.REMOVE_USER,uid);
      context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      context.commit(SettingsMutationTypes.SET_ACTION_LOADING, false);
    })
  },


};
