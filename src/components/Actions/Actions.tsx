import { useDispatch, useSelector } from "react-redux";
import classes from "./Actions.module.css";
import { establishSquad } from "../../store/footballersSlice";
import { clearSelection } from "../../store/selectionSlice";
import { RootState } from "../../store/store";
import Footballer from "../../models/Footballer";
import { BoardFootballer, createSquad } from "../../utils/HttpRequests";
import { useNavigate } from "react-router-dom";
import { finalizeTeam, setTeamName } from "../../store/teamSlice";
import FormButton from "../FormButton/FormButton";
import { setUserName } from "../../store/userSlice";

interface IProps {
    onSaveAsImage: () => void
}

function Actions(props: IProps) {
    const dispatch = useDispatch();
    const footballers: (Footballer | null)[][][] = useSelector((state: RootState) => state.footballers.boardFootballers);
    const footballerShirtNumbers: (number | null)[][][] = useSelector((state: RootState) => state.footballers.footballerShirtNumbers);
    const teamName: (string) = useSelector((state: RootState) => state.team.name);
    const navigate = useNavigate();
    const finalized = useSelector((state: RootState) => state.team.finalized);

    function handleNewSquad() {
        const userPick = window.confirm("This will clear all current footballers in squad. Are you sure?");
        if (userPick === true) {
            dispatch(clearSelection());
            dispatch(establishSquad());
            dispatch(finalizeTeam(false));
            dispatch(setTeamName(""));
            navigate("/");
        }
    }

    function handleSaveSquad() {
        if (!localStorage["token"] || !localStorage["refreshToken"] || !localStorage["userName"]) {
            alert("To save squad you have to login!");
            return;
        }

        if (teamName.length <= 4) {
            alert("Squad name should be minimum length of 4!");
            return;
        }

        let footballerIsNotAssigned = false; // Validate footballers
        let boardFootballers: BoardFootballer[] = [];
        footballers.forEach((arr, y) => arr.forEach((inArr, x) => {
            if (inArr[0] === null) {
                return;
            }

            if (inArr[0]?.id! < 0) {
                footballerIsNotAssigned = true;
            }

            boardFootballers.push({
                footballerId: inArr[0]!.id!,
                positionY: inArr[0]!.position?.y!,
                positionX: inArr[0]!.position?.x!,
                shirtNumber: footballerShirtNumbers[y][x][0] || 255
            })
        }));

        if (footballerIsNotAssigned) {
            alert("Not all players are assigned!");
            return;
        }

        const createSquadAsync = async () => {
            try {
                const response = await createSquad(teamName, boardFootballers);
                    console.log(response);
                    const squadId = response.data;
                    if (response.status === 200) {
                        dispatch(finalizeTeam(true));
                        //navigator.clipboard.writeText(window.location.href + squadId);
                        //alert("Saved squad url is copied to clipboard!");
                        navigate("/" + squadId);
                    } else if (response.status === 511) {
                        console.error("Can't get new token. Refresh token is expired!");
                        localStorage.removeItem("token");
                        localStorage.removeItem("refreshToken");
                        localStorage.removeItem("userName");
                        dispatch(setUserName(null));
                        navigate("/");
                    } else {
                        console.error("WTF?");
                    }
                } catch (error) {
                console.error(error);
            }
        }
        createSquadAsync();
    }

    return <div className={classes.Actions}>
        <FormButton onClick={handleNewSquad} label="New Squad" className={classes.Button} />
        <FormButton onClick={props.onSaveAsImage} label="Save As Image" className={classes.Button}/>
        <FormButton onClick={handleSaveSquad} label="Save Squad" disabled={finalized} className={classes.Button}/>
    </div>
}

export default Actions;