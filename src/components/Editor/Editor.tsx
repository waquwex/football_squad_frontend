import React, { useCallback, useEffect, useMemo, useState } from "react";
import classes from "./Editor.module.css";
import Footballer from "../../models/Footballer";
import { RootState } from "../../store/store";
import { Position } from "../../utils/Position";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateFootballer, updateFootballerShirtNumber } from "../../store/footballersSlice";
import loadingIcon from "../../images/loading_icon.png";
import { searchFootballer } from "../../utils/HttpRequests";
import { setShowEditor } from "../../store/uiSlice";
import { clearSelection } from "../../store/selectionSlice";

interface IProps {
}

function Editor(props: IProps) {
    const selection: (Position | null) = useSelector((state: RootState) => state.selection.position);
    const players: (Footballer | null)[][][] = useSelector((state: RootState) => state.footballers.boardFootballers);
    const playerShirtNumbers: (number | null)[][][] = useSelector((state: RootState) => state.footballers.footballerShirtNumbers);
    const [footballerName, setFootballerName] = useState<{ name: string, fromInput: boolean }>({ name: "", fromInput: false });
    const [footballerNameSearchResult, setFootballerNameSearchResult] = useState<Footballer[]>();
    const dispatch = useDispatch();
    const [searching, setSearching] = useState<boolean>(false);
    const finalized = useSelector((state: RootState) => state.team.finalized);

    function handleShirtNumberOnInput(event: React.FormEvent<HTMLInputElement>) {
        if (!selection) {
            return;
        }

        if (finalized) {
            return;
        }

        console.log(event.currentTarget.value);

        const regex = /^\d{1,2}$/;
        if (regex.test(event.currentTarget.value)) {
            const inputAsNumber = Number.parseInt(event.currentTarget.value);

            if (inputAsNumber >= 1 && inputAsNumber <= 99) {
                dispatch(updateFootballerShirtNumber({ position: selection!, shirtNumber: inputAsNumber }));
            } else {
                dispatch(updateFootballerShirtNumber({ position: selection!, shirtNumber: null }));
            }
        } else {
            dispatch(updateFootballerShirtNumber({ position: selection!, shirtNumber: null }));
        }
    }

    function handlePlayerNameOnInput(event: React.FormEvent<HTMLInputElement>) {
        if (finalized) {
            return;
        }

        let enteredValue = event.currentTarget.value;

        setFootballerName(prev => {
            if (enteredValue.length > 30) {
                return { name: prev.name, fromInput: false };
            } else {
                const pattern: RegExp = /^[\p{L}\s.'-]*$/u;
                if (pattern.test(enteredValue)) {
                    return { name: enteredValue, fromInput: true };
                } else {
                    return { name: prev.name, fromInput: true };
                }
            }
        });
    }

    // 
    useEffect(() => {
        if (!selection) {
            return;
        }

        setFootballerName({ name: players[selection!.y][selection!.x][0]?.name!, fromInput: false });
    }, [players, selection]);


    const footballerExistsMap = useMemo(() => {
        const existMap = footballerNameSearchResult?.map(sr => {
            let exists = false;
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 5; x++) {
                    if (players[y][x][0]?.id === sr.id) {
                        exists = true;
                    }
                }
            }
            return exists;
        });

        return existMap;
    }, [players, footballerNameSearchResult])


    // effect for searching
    useEffect(() => {
        setSearching(false);
        //setFootballerNameSearchResult([]);

        if (!footballerName.fromInput) {
            return;
        }

        if (footballerName.name.length < 4) {
            return;
        }

        let abortController = new AbortController();

        setSearching(true);
        const timeoutHandle = setTimeout(() => {
            // Search
            const searchFootballerAsync = async () => {
                try {
                    const searchResultFootballers = await searchFootballer(footballerName.name, abortController);
                    setSearching(false);
                    setFootballerNameSearchResult(searchResultFootballers);
                } catch (error) {
                    console.error(error);
                    setSearching(false);
                    setFootballerNameSearchResult([]);
                }
            }
            searchFootballerAsync();
        }, 500);

        return () => {
            clearTimeout(timeoutHandle);
            abortController.abort();
        }
    }, [players, footballerName]);

    function formatDayAndMonth(timestamp: number) {
        const date = new Date(timestamp);
        return date.getDate().toString().padStart(2, "0") + "." +
            (date.getMonth() + 1).toString().padStart(2, "0");
    }

    // selecting footballer item from search result
    const handleFootballerSearchSelect = useCallback((footballer: Footballer) => {
        if (!selection) {
            return;
        }

        console.log("footballer is selected!");
        dispatch(updateFootballer({ position: selection!, footballer }));
    }, [dispatch, selection]);

    function handleCloseEditor() {
        dispatch(setShowEditor(false));
        dispatch(clearSelection());
    }

    return <div className={classes.Editor}>
        <div className={classes.ClosePlace}><button onClick={handleCloseEditor}>&#10006;</button></div>
        <div className={classes.FormField}>
            <label htmlFor="teamName">Player Name {searching &&
                <img className={classes.LoadingIcon} alt="loading icons" src={loadingIcon} />}</label>
            <input disabled={finalized || !selection} className={footballerName.fromInput ? undefined : classes.AssignedName} type="text"
                value={
                    selection ?
                        footballerName.name || "" :
                        ""
                } onInput={handlePlayerNameOnInput} />
        </div>
        <div className={classes.FormField}>
            <label htmlFor="teamName">Shirt Number</label>
            <input disabled={finalized || !selection} type="number" value={
                (selection && playerShirtNumbers[selection!.y][selection!.x][0] !== null) ?
                    playerShirtNumbers[selection!.y][selection!.x][0]!
                    :
                    " "
            }
                onInput={handleShirtNumberOnInput} />
        </div>
        {(footballerNameSearchResult && selection) &&
            <ul className={classes.FootballerNameSuggestions}>
                {footballerNameSearchResult?.map((f, index) =>
                    <li key={f.id}>
                        <button onClick={() => handleFootballerSearchSelect(f)}
                            disabled={footballerExistsMap?.[index] === true}>
                            <div className={classes.Flag}>
                                <img src={"/countryFlags/" +
                                    f.countryCodes?.split(",")[0]
                                    + ".png"} alt={f.countryCodes + " flag"}></img>
                            </div>
                            <div className={classes.Name}>
                                {f.name}
                            </div>
                            <div className={classes.DateOfBirth}>
                                {f.dateOfBirth && formatDayAndMonth(f.dateOfBirth)}
                                <br></br>
                                {new Date(f.dateOfBirth!.valueOf()).getFullYear()}
                            </div>
                        </button>
                    </li>)}
            </ul>
        }
    </div>
}


export default Editor;