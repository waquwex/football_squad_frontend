export type BoardFootballer = {
    footballerId: number,
    positionY: number,
    positionX: number,
    shirtNumber: number
}

export type AppResponse = {
    status: number,
    data: (any | null | undefined)
}

// try to do request, if response code is 401 it means it's unauthorized
// gather new token and try
async function authorizedRequest<T extends any[]>(
    request: (...args: T) => Promise<AppResponse>, ...args: T): Promise<AppResponse> {
    const response = await request(...args);

    if (response.status === 200) {
        return response;
    } else if (response.status === 401) {
        console.log("token is expired! getting new token!");
        const tokenStatus = await getNewToken();
        if (tokenStatus === 200) {
            console.log("got new token!");
            const secondResponse = await request(...args);
            return secondResponse;
        } else if (tokenStatus === 511){ // it is 511 most likely
            console.log("authorizedRequest(): can't get new token!: " + tokenStatus);
            return { status: 511, data: null }
        } else {
            throw new Error("Unpredictable error!");
        }
    } else {
        return response;
    }
}

// Authorized
export async function createSquad(teamName: string, boardFootballers: BoardFootballer[]): Promise<AppResponse> {
    return await authorizedRequest(_createSquad, teamName, boardFootballers);
}

// Authorized
export async function changePassword(currentPassword: string, newPassword: string,
    confirmNewPassword: string): Promise<AppResponse> {
    return await authorizedRequest(_changePassword, currentPassword, newPassword, confirmNewPassword);
}

// Authorized
export async function deleteAccount() {
    return await authorizedRequest(_deleteAccount);
}

// Authorized
export async function getSquadCountOfUser(): Promise<AppResponse> {
    return await authorizedRequest(_getSquadCountOfUser);
}

// Authorized
export async function getSquadsOfUser(pageNumber: number): Promise<AppResponse> {
    return await authorizedRequest(_getSquadsOfUser, pageNumber);
}

// Authorized
// http request to only create endpoint
async function _createSquad(teamName: string, boardFootballers: BoardFootballer[]): Promise<AppResponse> {
    const requestUrl = process.env.REACT_APP_BACKEND_URL + "/api/squad/create";
    const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": '*',
            "Authorization": `Bearer ${localStorage['token']}`
        },
        body: JSON.stringify({
            squadName: teamName,
            boardFootballers: boardFootballers,
        }),
        mode: "cors"
    });

    let data = null;
    if (response.status === 200) {
        const json = await response.json();
        data = json.squadId;
    }

    return { status: response.status, data };
}


// Anonymous
// Gets new token and saves it into localStorage
async function getNewToken(): Promise<number> {
    if (!localStorage["token"] || !localStorage["refreshToken"] ||
        !localStorage["userName"]) {
        console.log(localStorage);
        throw new Error("Local storage is empty! Fatal error!");
    }

    const requestUrl = process.env.REACT_APP_BACKEND_URL + "/api/account/gettoken";
    const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": '*',
        },
        body: JSON.stringify({
            JWTToken: localStorage["token"],
            refreshToken: localStorage["refreshToken"]
        }),
        mode: "cors"
    });

    if (response.status === 200) {
        const json = await response.json();
        localStorage["token"] = json.token;
        localStorage["refreshToken"] = json.refreshToken;
        localStorage["userName"] = json.userName;
    } else if (response.status === 511) {
    } else {
        throw new Error("Unpredictable error! 2");
    }
    return response.status;
}

// Anonymous
export async function searchFootballer(footballerName: string, abortController: AbortController) {
    let requestUrl = process.env.REACT_APP_BACKEND_URL + "/api/footballer/search?searchTerm="
        + encodeURIComponent(footballerName);

    const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": '*'
        },
        mode: "cors",
        signal: abortController.signal
    });

    const data = await response.json();
    const dataArr = data as Array<any>;
    const searchResultFootballers = dataArr.map(d => {
        return {
            id: d.id,
            name: d.name,
            dateOfBirth: new Date(Date.parse(d.dateOfBirth)).valueOf(),
            imageUrl: d.imageUrl,
            countryCodes: d.countryCodes
        }
    });

    return searchResultFootballers;
}

// Anonymous
export async function getSquad(squadId: string) {
    let requestUrl = process.env.REACT_APP_BACKEND_URL + "/api/squad/getSquad?id="
        + encodeURIComponent(squadId);

    const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": '*',
            "Authorization": `Bearer ${localStorage['token']}`
        },
        mode: "cors"
    });

    const data = await response.json();
    if (data.status === 500) { // Squad is not exists
        return {
            squadName: null,
            footballers: null
        }
    }
    const squadName = data.squadName;
    const footballers = data.boardFootballers.map((bf: any) => {
        return {
            id: bf.footballer.id,
            name: bf.footballer.name,
            positionY: bf.positionY,
            positionX: bf.positionX,
            imageUrl: bf.footballer.imageUrl,
            shirtNumber: bf.shirtNumber
        }
    });

    return {
        squadName,
        footballers
    }
}

// Anonymous
export async function register(username: string, email: string, password: string, confirmPassword: string)
    : Promise<AppResponse> {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/account/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        mode: "cors",
        body: JSON.stringify({
            username,
            email,
            password,
            confirmPassword
        })
    });

    let json = null;
    if (response.status !== 200) {
        json = await response.json();
    }

    return {
        status: response.status,
        data: json
    }
}

// Authorized
async function _changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string)
    : Promise<AppResponse> {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/account/changePassword", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": '*',
            "Authorization": `Bearer ${localStorage["token"]}`
        },
        mode: "cors",
        body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmNewPassword,
        })
    });

    return {
        status: response.status,
        data: null
    }
}


// Authorized
async function _deleteAccount(): Promise<AppResponse> {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/account/delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": '*',
            "Authorization": `Bearer ${localStorage["token"]}`
        },
        mode: "cors"
    });

    return {
        status: response.status,
        data: null
    }
}

// Authorized
async function _getSquadCountOfUser(): Promise<AppResponse> {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/squad/getUserSquadCount", {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": '*',
            "Authorization": `Bearer ${localStorage["token"]}`
        },
        mode: "cors"
    });

    let data = null;
    if (response.status === 200) {
        const json = await response.json();
        data = json.count;
    }

    return {
        status: response.status,
        data: data
    }
}


// Authorized
async function _getSquadsOfUser(pageNumber: number): Promise<AppResponse> {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/squad/getUserSquads?pageNumber=" + pageNumber, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": '*',
            "Authorization": `Bearer ${localStorage["token"]}`
        },
        mode: "cors"
    });

    // squadId: string
    // squadName: string
    // createdDate: date
    let data = null;
    if (response.status === 200) {
        let json = await response.json();
        data = json;
    }

    return {
        status: response.status,
        data
    }
}

// Anonymous
export async function login(email: string, password: string): Promise<AppResponse> {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/account/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        mode: "cors",
        body: JSON.stringify({
            email,
            password
        })
    });

    let json = await response.json();
    return {
        status: response.status,
        data: json
    }
}

// Anonymous
export async function forgotPassword(email: string): Promise<AppResponse> {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/account/forgotPassword", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        mode: "cors",
        body: JSON.stringify({
            email
        })
    });

    let json = null;
    if (response.status !== 200) {
        json = await response.json();
    }

    return {
        status: response.status,
        data: json
    }
}

// Anonymous
export async function resetPassword(email: string, newPassword: string,
    confirmNewPassword: string, token: string): Promise<AppResponse> {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/account/resetPassword", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        mode: "cors",
        body: JSON.stringify({
            email,
            newPassword,
            confirmNewPassword,
            token
        })
    });

    let json = null;
    if (response.status !== 200) {
        json = await response.json();
    }

    return {
        status: response.status,
        data: json
    }
}