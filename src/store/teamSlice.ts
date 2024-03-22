import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface TeamState {
    name: string,
    finalized: boolean
}

const initialState: TeamState = {
    name: "",
    finalized: false
};

const teamSlice = createSlice({
    name: "team",
    initialState,
    reducers: {
        setTeamName(state, action: PayloadAction<string>) {
            state.name = action.payload;
        },
        finalizeTeam(state, action: PayloadAction<boolean>) {
            state.finalized = action.payload;
        }
    }
});

export const { setTeamName, finalizeTeam } = teamSlice.actions
export default teamSlice;