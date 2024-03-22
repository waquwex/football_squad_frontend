import { configureStore } from "@reduxjs/toolkit";
import footballersSlice from "./footballersSlice";
import selectionSlice from "./selectionSlice";
import teamSlice from "./teamSlice";
import userSlice from "./userSlice";
import uiSlice from "./uiSlice";

export const store = configureStore({
    reducer: {
        ui: uiSlice.reducer,
        footballers: footballersSlice.reducer,
        selection: selectionSlice.reducer,
        team: teamSlice.reducer,
        user: userSlice.reducer
    }
});

export default store;
export type RootState = ReturnType<typeof store.getState>