import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Footballer from "../models/Footballer";
import { Position } from "../utils/Position";

function getPositionName(pos: Position): string {
    if (pos.y === 0 && pos.x !== 2) {
        throw new Error("Footballer position validation error! Goalkeeper can have  only x position value 2");
    }

    if (pos.y === 5 && !(pos.x >= 1 && pos.x <= 3)) {
        throw new Error("Footballer position validation error! Forwards can have x position only 1, 2, 3 values");
    }

    if (pos.y < 0 || pos.y > 5 || pos.x < 0 || pos.x > 4) {
        throw new Error("Footballer position validation error! Exceeded avaliable positions!");
    }

    if (pos.y === 0) {
        return "GK"
    } else if (pos.y === 1 && pos.x === 0) {
        return "DL"
    } else if (pos.y === 1 && pos.x >= 1 && pos.x <= 3) {
        return "DC"
    } else if (pos.y === 1 && pos.x === 4) {
        return "DR"
    } else if (pos.y === 2 && pos.x === 0) {
        return "WBL"
    } else if (pos.y === 2 && pos.x >= 1 && pos.x <= 3) {
        return "DMC"
    } else if (pos.y === 2 && pos.x === 4) {
        return "WBR"
    } else if (pos.y === 3 && pos.x === 0) {
        return "ML"
    } else if (pos.y === 3 && pos.x >= 1 && pos.x <= 3) {
        return "MC"
    } else if (pos.y === 3 && pos.x === 4) {
        return "MR"
    } else if (pos.y === 4 && pos.x === 0) {
        return "AML"
    } else if (pos.y === 4 && pos.x >= 1 && pos.x <= 3) {
        return "AMC"
    } else if (pos.y === 4 && pos.x === 4) {
        return "AMR"
    } else if (pos.y === 5 && pos.x >= 1 && pos.x <= 3) {
        return "ST"
    }

    return "ERROR";
}

const _442Formation: Position[] = [
    { x: 2, y: 0 },
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
    { x: 1, y: 5 }, { x: 3, y: 5 }
];

export interface FootballersState {
    boardFootballers: (Footballer | null)[][][],
    footballerShirtNumbers: (number | null)[][][]
}

const initialState: FootballersState = {
    boardFootballers: [],
    footballerShirtNumbers: []
};


export interface SwitchFootballerPayload {
    source: Position,
    target: Position
}

export type UpdateFootballerShirtNumberPayload = {
    position: Position,
    shirtNumber: number | null
}

export type UpdateFootballerPayload = {
    position: Position,
    footballer: Footballer
}

export type SetSquadPayload = {
    footballers: Footballer[],
    shirtNumbers: number[]
}

const footballersSlice = createSlice({
    name: "footballers",
    initialState: initialState,
    reducers: {
        setSquad(state, action: PayloadAction<SetSquadPayload>) {
            const newFootballers: (Footballer | null)[][][] = [];

            // Fill empty array for boardPlayers initial state
            for (let y = 0; y < 6; y++) {
                newFootballers[y] = [];
                for (let x = 0; x < 5; x++) {
                    newFootballers[y][x] = [];
                    newFootballers[y][x][0] = null;
                }
            }

            const newShirtNumbers: (number | null)[][][] = [];
            // Fill empty array for shirtNumbers initial state
            for (let y = 0; y < 6; y++) {
                newShirtNumbers[y] = [];
                for (let x = 0; x < 5; x++) {
                    newShirtNumbers[y][x] = [];
                    newShirtNumbers[y][x][0] = null;
                }
            }

            action.payload.footballers.forEach((footballer, index) => {
                newFootballers[footballer.position?.y!][footballer.position?.x!][0] = {
                    id: footballer.id,
                    name: footballer.name,
                    imageUrl: footballer.imageUrl,
                    positionName: getPositionName({ x: footballer.position?.x!, y: footballer.position?.y! }),
                    position: { y: footballer.position?.y!, x: footballer.position?.x! }
                }
                newShirtNumbers[footballer.position?.y!][footballer.position?.x!][0] = action.payload.shirtNumbers[index];
            });

            state.boardFootballers = newFootballers;
            state.footballerShirtNumbers = newShirtNumbers;
        },
        // Position name is calculated initially
        establishSquad(state) {
            const newFootballers: (Footballer | null)[][][] = [];

            // Fill empty array for boardPlayers initial state
            for (let y = 0; y < 6; y++) {
                newFootballers[y] = [];
                for (let x = 0; x < 5; x++) {
                    newFootballers[y][x] = [];
                    newFootballers[y][x][0] = null;
                }
            }

            const newShirtNumbers: (number | null)[][][] = [];
            // Fill empty array for shirtNumbers initial state
            for (let y = 0; y < 6; y++) {
                newShirtNumbers[y] = [];
                for (let x = 0; x < 5; x++) {
                    newShirtNumbers[y][x] = [];
                    newShirtNumbers[y][x][0] = null;
                }
            }

            let fakeId = -1; // non player ids goes to negative
            _442Formation.forEach((pos, index) => {
                fakeId--;
                newFootballers[pos.y][pos.x][0] = {
                    id: fakeId,
                    name: "",
                    positionName: getPositionName({ x: pos.x, y: pos.y }),
                    position: { y: pos.y, x: pos.x }
                }
                newShirtNumbers[pos.y][pos.x][0] = index + 1;
            });

            state.boardFootballers = newFootballers;
            state.footballerShirtNumbers = newShirtNumbers;
        },
        // position name calculated when players on board moved
        placeFootballer(state: FootballersState, action: PayloadAction<SwitchFootballerPayload>) {
            const sourceFootballer =
                JSON.parse(JSON.stringify(
                    state.boardFootballers[action.payload.source.y][action.payload.source.x][0])) as Footballer;
            const targetFootballer =
                JSON.parse(JSON.stringify(
                    state.boardFootballers[action.payload.target.y][action.payload.target.x][0])) as (Footballer | null);

            const cloneBoardFootballers: (Footballer | null)[][][] = [];
            const cloneFootballerShirtNumbers: (number | null)[][][] = [];
            // Clone whole board players array
            for (let y = 0; y < 6; y++) {
                cloneBoardFootballers[y] = [];
                cloneFootballerShirtNumbers[y] = [];
                for (let x = 0; x < 5; x++) {
                    cloneBoardFootballers[y][x] = [];
                    cloneFootballerShirtNumbers[y][x] = [];
                    cloneBoardFootballers[y][x][0] =
                        JSON.parse(JSON.stringify(state.boardFootballers[y][x][0])) as (Footballer | null);
                    cloneFootballerShirtNumbers[y][x][0] = 
                        JSON.parse(JSON.stringify(state.footballerShirtNumbers[y][x][0])) as (number | null);;    
                }
            }

            const sourceShirtNumber = JSON.parse(JSON.stringify(
                state.footballerShirtNumbers[action.payload.source.y][action.payload.source.x][0])) as number;
            const targetShirtNumber = JSON.parse(JSON.stringify(
                state.footballerShirtNumbers[action.payload.target.y][action.payload.target.x][0])) as (number | null);

            sourceFootballer.position = { y: action.payload.target.y, x: action.payload.target.x };
            sourceFootballer.positionName = getPositionName({ y: sourceFootballer.position.y, x: sourceFootballer.position.x });

            if (targetFootballer) {
                targetFootballer.position = { y: action.payload.source.y, x: action.payload.source.x };
                targetFootballer.positionName = getPositionName({ y: targetFootballer.position.y, x: targetFootballer.position.x });

                // switch footballers
                cloneBoardFootballers[action.payload.target.y][action.payload.target.x][0] = sourceFootballer;
                cloneBoardFootballers[action.payload.source.y][action.payload.source.x][0] = targetFootballer;

                cloneFootballerShirtNumbers[action.payload.target.y][action.payload.target.x][0] = sourceShirtNumber;

                // switch shirt numbers
                cloneFootballerShirtNumbers[action.payload.target.y][action.payload.target.x][0] = sourceShirtNumber;
                cloneFootballerShirtNumbers[action.payload.source.y][action.payload.source.x][0] = targetShirtNumber;

                return {
                    footballerShirtNumbers: cloneFootballerShirtNumbers,
                    boardFootballers: cloneBoardFootballers
                }
            } else {
                // move footballer, set null previous position
                cloneBoardFootballers[action.payload.target.y][action.payload.target.x][0] = sourceFootballer;
                cloneBoardFootballers[action.payload.source.y][action.payload.source.x][0] = null;

                // move shirtNumber, set null previous position
                cloneFootballerShirtNumbers[action.payload.target.y][action.payload.target.x][0] = sourceShirtNumber;
                cloneFootballerShirtNumbers[action.payload.source.y][action.payload.source.x][0] = null;

                return {
                    footballerShirtNumbers: cloneFootballerShirtNumbers,
                    boardFootballers: cloneBoardFootballers
                }
            }
        },
        updateFootballerShirtNumber(state, action: PayloadAction<UpdateFootballerShirtNumberPayload>) {
            state.footballerShirtNumbers[action.payload.position.y][action.payload.position.x][0] = 
                action.payload.shirtNumber;
        },
        // Update footballer id, name and imageUrl
        updateFootballer(state, action: PayloadAction<UpdateFootballerPayload>) {
            state.boardFootballers[action.payload.position.y][action.payload.position.x][0]!.id =
                action.payload.footballer.id;
            state.boardFootballers[action.payload.position.y][action.payload.position.x][0]!.name =
                action.payload.footballer.name;
            state.boardFootballers[action.payload.position.y][action.payload.position.x][0]!.imageUrl =
                action.payload.footballer.imageUrl;
        }
    }
});

export const { establishSquad, placeFootballer, setSquad,
    updateFootballerShirtNumber, updateFootballer } = footballersSlice.actions
export default footballersSlice;