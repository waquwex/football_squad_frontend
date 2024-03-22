import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface UIState {
    showEditor: boolean
}

const initialState: UIState = {
    showEditor: false
};

const userSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setShowEditor(state, action: PayloadAction<boolean>) {
            state.showEditor = action.payload;
        }
    }
});

export const { setShowEditor } = userSlice.actions
export default userSlice;