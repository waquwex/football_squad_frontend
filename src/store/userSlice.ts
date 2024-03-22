import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface UserState {
    name: (string | null)
}

const initialState: UserState = {
    name: null
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserName(state, action: PayloadAction<(string | null)>) {
            state.name = action.payload;
        }
    }
});

export const { setUserName } = userSlice.actions
export default userSlice;