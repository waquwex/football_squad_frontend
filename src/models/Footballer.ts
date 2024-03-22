import { Position } from "../utils/Position";

// Use this in redux store
export type Footballer = {
    id?: number,
    name?: string,
    positionName?: string,
    position?: Position,
    dateOfBirth?: number,
    imageUrl?: string,
    countryCodes?: string,
}

export default Footballer;