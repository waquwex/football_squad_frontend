import { useEffect, useRef, useState } from "react";
import classes from "./PlayerMagnet.module.css";
import Footballer from "../../models/Footballer";
import AbsoluteMargin from "../../utils/AbsoluteMargin";
import { Position } from "../../utils/Position";

const EMPTY_PHOTO = "url(images/unknown_person.jpg";

interface Props {
    footballer: Footballer,
    shirtNumber: number | null,
    width: number,
    height: number,
    pixelPosition: AbsoluteMargin,
    onDragStart: (footballer: Footballer) => void,
    onDrop: (position: Position) => void,
    onDragEnd: () => void
    position: Position,
    onClick: () => void,
    isDragging: boolean,
    isSelected: boolean,
    absoluteMargin: AbsoluteMargin,
    finalized: boolean,
    onTouchDraggingStart: (footballer: Footballer) => void,
    onTouchDrop: (position: Position) => void
}

function PlayerMagnet(props: Props) {
    const rootEl = useRef<HTMLDivElement>(null!);
    const [footballerPhoto, setFootballerPhoto] = useState<string | null>();
    const [touchStartPosition, setTouchStartPosition] = useState<(Position | null)>(null);
    const [lastTouchMovePosition, setLastTouchMovePosition] = useState<Position | null>(null);
    const [dragging, setDragging] = useState<boolean>(props.isDragging);

    function dragStartHandler(event: React.DragEvent<HTMLDivElement>) {
        if (props.finalized) {
            event.preventDefault();
            return;
        }
        props.onDragStart(props.footballer);
    }

    function touchStartHandler(event: React.TouchEvent<HTMLDivElement>) {
        setTouchStartPosition({x: event.touches[0].clientX, y: event.touches[0].clientY});
    }

    function touchMoveHandler(event: React.TouchEvent<HTMLDivElement>) {
        if (touchStartPosition === null) {
            return;
        }

        const touchY = event.touches[0].clientY;
        const touchX = event.touches[0].clientX;

        const delta = Math.sqrt(Math.pow(touchStartPosition.y - touchY, 2) + 
            Math.pow(touchStartPosition.x - touchX, 2));
        // draggin with touch started
        if (lastTouchMovePosition === null) {
            if (delta > 10 ) {
                setLastTouchMovePosition({ y: touchY, x: touchX });
                props.onTouchDraggingStart(props.footballer);
                setDragging(true);
                return;
            }
        } else {
            const deltaLeft = touchStartPosition.x - touchX;
            const deltaTop = touchStartPosition.y - touchY;

            rootEl.current.style.left = props.absoluteMargin.left - deltaLeft + "px";
            rootEl.current.style.top = props.absoluteMargin.top - deltaTop + "px";
            setLastTouchMovePosition({ y: touchY, x: touchX });
        }
    }

    function touchEndHandler(event: React.TouchEvent<HTMLDivElement>) {
        if (lastTouchMovePosition === null) {
            return;
        }
        rootEl.current.style.left = props.absoluteMargin.left + "px";
        rootEl.current.style.top = props.absoluteMargin.top + "px";
        props.onTouchDrop({y: lastTouchMovePosition!.y, x: lastTouchMovePosition!.x});
        setTouchStartPosition(null);
        setLastTouchMovePosition(null);
        setDragging(false);
    }

    function handleDragEnd(event: React.DragEvent<HTMLDivElement>) {
        if (props.finalized) {
            return;
        }
        props.onDragEnd();
    }

    function handleOnClick(event: React.SyntheticEvent) {
        props.onClick();
    }

    function shortenName(name: string) {
        let arr = name.split(" ");
        let newString = "";
        for (let i = 0; i < arr.length - 1; i++) {
            newString += arr[i][0] + ".";
        }
        newString += arr[arr.length - 1];
        if (newString.length >= 10) {
            newString = newString.substring(0, 9) + "\u2026";
        }
        return newString;
    }

    function handleOnDrop(event: React.DragEvent<HTMLDivElement>) {
        props.onDrop(props.position);
    }

    useEffect(() => {
        if (!props.footballer.imageUrl) {
            setFootballerPhoto(null);
            return;
        }

        let finalBase64Data = "url(data:image/webp?format=webp;base64,";
        // proxy with same backend
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/footballer/proxyImage?url=" + props.footballer.imageUrl)
            .then(response => response.text()).then(text => {
                finalBase64Data += text.substring(1, text.length - 1);
                finalBase64Data += ")";
                setFootballerPhoto(finalBase64Data);
            }).catch(error => {
                console.log(error);
            });
    }, [props.footballer.imageUrl]);

    return <div ref={rootEl} className={classes.PlayerMagnet +
        ((props.isSelected ? " " + classes.Selected : "") + (dragging ? " " + classes.Dragging : ""))} draggable
        onDragOver={(event) => {
            event.preventDefault();
            console.log("player magnet drag over");
        }}
        onDragEnd={handleDragEnd}
        onDragStart={dragStartHandler}
        onTouchStart={touchStartHandler}
        onTouchMove={touchMoveHandler}
        onTouchEnd={touchEndHandler}
        onDrop={handleOnDrop}
        onClick={handleOnClick}
        style={{
            top: props.pixelPosition.top, left: props.pixelPosition.left,
            width: props.width, height: props.height, fontSize: props.width / 5,
            backgroundImage: footballerPhoto || EMPTY_PHOTO
        }}>
        <div className={classes.PlayerPosition}>{props.footballer.positionName}</div>
        <div className={classes.ShirtNumber}>{props.shirtNumber}</div>
        <div className={classes.PlayerName}>{!props.footballer.name ? "???"
            : shortenName(props.footballer.name!)}</div>
    </div>
}

export default PlayerMagnet;