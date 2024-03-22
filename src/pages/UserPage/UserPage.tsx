import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getSquadCountOfUser, getSquadsOfUser } from "../../utils/HttpRequests";
import { ListSquad } from "../../models/ListSquad";
import classes from "./UserPage.module.css";
import { useDispatch } from "react-redux";
import { setUserName } from "../../store/userSlice";

function UserPage() {
    const userName: (string | null) = useSelector((state: RootState) => state.user.name);
    const navigate = useNavigate();
    const [squadCount, setSquadCount] = useState<number>(0);
    const [squads, setSquads] = useState<ListSquad[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();

    const totalPage = useMemo(() => {
        return (squadCount === 0) ? 0 : Math.ceil(squadCount / 5);
    }, [squadCount]);

    const pageNumber = useMemo(() => {
        return searchParams.get("squadsPage") ? Number.parseInt(searchParams.get("squadsPage")!) : 1;
    }, [searchParams])
    
    useEffect(() => {
        if (!userName || !localStorage["userName"]) {
            dispatch(setUserName(null));
            navigate("/");
            return;
        }

        const getSquadsOfUser_ = async () => {
            try {
                const response = await getSquadsOfUser(pageNumber - 1);
                if (response.status === 200) {
                    const responseSquads: ListSquad[] = response.data.map((s: any) => {
                        return {
                            id: s.id,
                            squadName: s.squadName,
                            createdDate: new Date(Date.parse(s.createdDate + "Z"))
                        }
                    });
                    setSquads(responseSquads);
                } else if (response.status === 511 ) {
                    console.log("can't get new token! Refresh token is expired!");
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

        const getSquadsAndSquadCountOfUserAsync = async () => {
            try {
                const response = await getSquadCountOfUser();
                if (response.status === 200) {
                    console.log("RESPONSE: " + response.data);
                    const count = response.data;
                    setSquadCount(count);

                    await getSquadsOfUser_();

                    if (count === 0) {
                        console.log("User doesn't have any squads yet");
                        return;
                    }
                } else if (response.status === 511) {
                    console.log("can't get new token! Refresh token is expired!");
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("userName");
                    dispatch(setUserName(null));
                    navigate("/");
                    return;
                } else {
                    console.error("WTF?");
                    return;
                }
            } catch (error) {
                console.error(error);
                return;
            }
        }

        getSquadsAndSquadCountOfUserAsync();

    }, [userName, navigate, searchParams, pageNumber, dispatch]);

    function formatDate(date: Date) {
        let day = date.getDate().toString();
        if (day.length === 1) {
            day = "0" + day;
        }
        let month = (date.getMonth() + 1).toString();
        if (month.length === 1) {
            month = "0" + month;
        }
        const year = date.getFullYear();
        let hour = date.getHours().toString();
        if (hour.length === 1) {
            hour = "0" + hour;
        }
        let minute = date.getMinutes().toString();
        if (minute.length === 1) {
            minute = "0" + minute;
        }
        return day + "/" + month + "/" + year + " " + hour + ":" + minute;
    }

    function handlePageNumberChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setSearchParams({squadsPage: event.currentTarget.value});
    }

    return <div className={classes.UserPage + " common-container"}>
        <Link to="/account" className={classes.AccountSettings}>Account Settings</Link>
        <h1>{userName}'s Squads</h1>
        <ul>
            {squads.length > 0 &&
                squads.map(s =>
                    <li key={s.id} className={classes.ListSquad}>
                        <Link to={"/" + s.id}>
                            <span className={classes.SquadName}>{s.squadName}</span>
                            <br></br>
                            <span className={classes.SquadCreatedDate}>{formatDate(s.createdDate!)}</span>
                        </Link>
                    </li>)
            }
        </ul>
        {(totalPage > 0) && (
            <div>
                <select className={classes.PageNumbers} value={pageNumber} onChange={handlePageNumberChange}>
                    {
                        [...Array(totalPage)].map((_, i) => {
                            const pageNumber = searchParams.get("squadsPage") ? 
                                Number.parseInt(searchParams.get("squadsPage")!) : 1;
                            let min = pageNumber - 3;
                            let max = pageNumber + 3;
                            if (min < 0) {
                                max += Math.abs(min);
                                min = 0;
                            }
                            if (max > (totalPage - 1)) {  // totalPage is 9
                                min += (totalPage - 1 - max);
                                max = totalPage - 1; // 8
                            }

                            if ((i >= min) && (i <= max)) {
                                return <option key={i + 1} value={i + 1}>{i + 1}</option>
                            } else {
                                return undefined;
                            }
                        })
                    }
                </select>
                <span className={classes.TotalPages}>/ {totalPage}</span> 
            </div>
        )
        }
    </div>
}

export default UserPage;