import { database } from '@/apis/firebase/firebase';
import { MutationTypes } from "./mutations";
import { Settings } from "@/common/models/types/index";
import { RootState } from "../../state";
import { ActionTree } from "vuex";
import store from '@/store/index'; 



export enum ActionTypes {
    FETCH_SETTINGS = "fetchSettings",
    SAVE_SETTINGS = "saveSettings",
  }
  

// for API, often async
export const actionsSettings : ActionTree<Settings, RootState> = {

    //SAVE SETTINGS
      async [ActionTypes.SAVE_SETTINGS](
        context,
        payload
      ): Promise<void> {

        Object.keys(payload).forEach((key) => (payload[key] == null) && delete payload[key]);
    
        const { uid } = store.getters.getUser;
    

        context.commit(MutationTypes.SET_ACTION_LOADING, true);
        try {
          await database.ref(`settings/${uid}`).update({
            [payload.label]: payload.value
          });
          context.commit(MutationTypes.SET_ACTION_LOADING, false);
        } catch (error) {
          context.commit(MutationTypes.SET_ACTION_LOADING, false);
        }
      },

    //   FETCH SETTINGS
      async [ActionTypes.FETCH_SETTINGS](context, uid: string): Promise<void> {
        
        let settings: Settings;

        context.commit(MutationTypes.SET_ACTION_LOADING, true);
        try {
          await database.ref(`settings/${uid}`).once('value', (snapshot) => {
            settings = snapshot.val();
          }).then(() => {
            if (settings)  {
              context.commit(MutationTypes.SET_SETTINGS, settings);
            }
            context.commit(MutationTypes.SET_ACTION_LOADING, false);
          });
        } catch (error) {
          context.commit(MutationTypes.SET_ACTION_LOADING, false);
        }
      },
};