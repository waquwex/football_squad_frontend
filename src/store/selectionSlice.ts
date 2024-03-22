import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Position } from "../utils/Position";

export interface SelectionState {
    position: Position | null
}

const initialState: SelectionState = {
    position: null
};

const selectionSlice = createSlice({
    name: "selection",
    initialState,
    reducers: {
        setSelection(state, action: PayloadAction<Position>) {
            state.position = action.payload;
        },
        clearSelection(state) {
            return {
                position: null 
            }
        }
    }
});

export const { setSelection, clearSelection } = selectionSlice.actions
export default selectionSlice;