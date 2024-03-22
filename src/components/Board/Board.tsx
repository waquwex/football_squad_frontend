import {
    ChangeEvent, ReactNode, Ref, forwardRef, useCallback, useEffect,
    useImperativeHandle, useMemo, useRef, useState
} from "react";
import classes from "./Board.module.css";
import { useSelector } from "react-redux";
import { placeFootballer } from "../../store/footballersSlice";
import Footballer from "../../models/Footballer";
import { useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import PlayerMagnet from "../PlayerMagnet/PlayerMagnet";
import AbsoluteMargin from "../../utils/AbsoluteMargin";
import Dimension from "../../utils/Dimension";
import EmptyPosition from "../EmptyPosition/EmptyPosition";
import { Position } from "../../utils/Position";
import { setSelection } from "../../store/selectionSlice";
import { setTeamName } from "../../store/teamSlice";
import { setShowEditor } from "../../store/uiSlice";


const IMAGE_ORIGINAL_HEIGHT = 1200;
const IMAGE_ORIGINAL_WIDTH = 800;
const IMAGE_ORIGINAL_VERTICAL_MARGIN = 50;
const IMAGE_ORIGINAL_HORIZONTAL_MARGIN = 55;

function getHorizontalMargin(boardWidth: number) {
    return (boardWidth / IMAGE_ORIGINAL_WIDTH) * IMAGE_ORIGINAL_HORIZONTAL_MARGIN;
}

function getVerticalMargin(boardHeight: number) {
    return (boardHeight / IMAGE_ORIGINAL_HEIGHT) * IMAGE_ORIGINAL_VERTICAL_MARGIN;
}

function dimensionToNumber(dimension: string) {
    return dimension.slice(0, dimension.length - 2);
}

interface IProps {
}

const Board = forwardRef((props: IProps, forwardedRef: Ref<HTMLDivElement>) => {
    const players: (Footballer | null)[][][] = useSelector((state: RootState) => state.footballers.boardFootballers);
    const playerShirtNumbers: (number | null)[][][] = useSelector((state: RootState) => state.footballers.footballerShirtNumbers);
    const dispatch = useDispatch();
    const [boardDimension, setBoardDimension] = useState<Dimension>({ height: 0, width: 0 });
    const [draggingPlayer, setDraggingPlayer] = useState<Footballer | null>(null);
    const boardRef = useRef<HTMLDivElement>(null!);
    const teamName = useSelector((state: RootState) => state.team.name);
    const selection: (Position | null) = useSelector((state: RootState) => state.selection.position);
    const finalized = useSelector((state: RootState) => state.team.finalized);

    useImperativeHandle(forwardedRef, () => boardRef.current as HTMLInputElement);

    const verticalMargin = useCallback(() => {
        return getVerticalMargin(boardDimension.height);
    }, [boardDimension]);

    const horizontalMargin = useCallback(() => {
        return getHorizontalMargin(boardDimension.width);
    }, [boardDimension]);

    const playerMagnetSize = useCallback(() => {
        return boardDimension.height / 1200 * 120;
    }, [boardDimension]);

    useEffect(() => {
        const style = window.getComputedStyle(boardRef.current);
        const heightStr = dimensionToNumber(style.height);
        let height = Number.parseInt(heightStr);
        let calculatedWidth = height * (2 / 3);
        if (calculatedWidth > window.innerWidth) {
            calculatedWidth = window.innerWidth - 50;
            height = calculatedWidth * (3 / 2);
            boardRef.current.style.minHeight = height + "px";
            boardRef.current.style.maxHeight = height + "px";
        }

        boardRef.current.style.minWidth = calculatedWidth + "px";
        boardRef.current.style.maxWidth = calculatedWidth + "px";

        setBoardDimension({ width: calculatedWidth, height });

        function resizeHandler() {
            const style = window.getComputedStyle(boardRef.current);
            const heightStr = dimensionToNumber(style.height);
            let height = Number.parseInt(heightStr);
            let calculatedWidth = height * (2 / 3);
            if (calculatedWidth > window.innerWidth) {
                calculatedWidth = window.innerWidth - 50;
                height = calculatedWidth * (3 / 2);
                boardRef.current.style.minHeight = height + "px";
                boardRef.current.style.maxHeight = height + "px";
            }

            boardRef.current.style.minWidth = calculatedWidth + "px";
            boardRef.current.style.maxWidth = calculatedWidth + "px";

            setBoardDimension({ width: calculatedWidth, height })
        }

        window.addEventListener("resize", resizeHandler);

        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, []);

    const playersAbsolutePositions = useMemo(() => {
        let pixelMargins: (AbsoluteMargin | null)[][] = [];

        // Fill empty array: WTF IS THIS?
        for (let y = 0; y < 6; y++) {
            pixelMargins[y] = [];
            for (let x = 0; x < 5; x++) {
                pixelMargins[y][x] = null;
            }
        }

        if (players.length === 0) {
            return pixelMargins;
        }

        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 5; x++) {
                if (players[y][x][0]) {
                    const margin: AbsoluteMargin = {
                        left: horizontalMargin() +
                            ((boardDimension.width - playerMagnetSize() - (2 * horizontalMargin())) / 4) * x,
                        top: boardDimension.height - verticalMargin() - playerMagnetSize() -
                            (y * ((boardDimension.height - playerMagnetSize() - (2 * verticalMargin())) / 5))
                    }

                    // Adjust special case; if middle position is empty align them centrally
                    if (x === 1 && !players[y][2][0]) {
                        margin.left = horizontalMargin() +
                            ((boardDimension.width - playerMagnetSize() - (2 * horizontalMargin())) / 3);
                    }

                    if (x === 3 && !players[y][2][0]) {
                        margin.left = horizontalMargin() +
                            ((boardDimension.width - playerMagnetSize() - (2 * horizontalMargin())) / 3) * 2
                    }

                    pixelMargins[y][x] = margin;
                }
            }
        }

        return pixelMargins;
    }, [players, boardDimension, playerMagnetSize, verticalMargin, horizontalMargin]);

    const handleDrop = useCallback((position: Position | null) => {
        if (finalized) {
            return;
        }

        //event.stopPropagation();
        if (!draggingPlayer) {
            return;
        }

        if (!position) {
            setDraggingPlayer(null);
            return;
        }

        if (draggingPlayer.position!.y === position.y && draggingPlayer.position!.x === position.x) {
            console.log("Player placed to same place!");
            setDraggingPlayer(null);
            return;
        } else {
            // Update store
            dispatch(placeFootballer({
                source: draggingPlayer.position!,
                target: { y: position.y, x: position.x }
            }));
            dispatch(setSelection(position));
        }

        setDraggingPlayer(null);
    }, [draggingPlayer, dispatch, finalized]);

    const emptyPositionsAbsoluteMargins: (AbsoluteMargin | null)[][] | null  = useMemo(() => {
        if (players.length === 0) {
            return null;
        }

        if (!draggingPlayer) {
            return null;
        }


        let pixelMargins: (AbsoluteMargin | null)[][] = [];

        // Fill empty array: WTF IS THIS?
        for (let y = 0; y < 6; y++) {
            pixelMargins[y] = [];
            for (let x = 0; x < 5; x++) {
                pixelMargins[y][x] = null;
            }
        }

        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 5; x++) {
                if (players[y][x][0] === null) {
                    // goalkeeper side positions are not avaliable to place
                    if (y === 0 && x !== 2) {
                        continue;
                    }

                    // forward left and right are not available to place
                    if (y === 5 && (x === 0 || x === 4)) {
                        continue;
                    }

                    const margin: AbsoluteMargin = {
                        left: horizontalMargin() +
                            ((boardDimension.width - playerMagnetSize() - (2 * horizontalMargin())) / 4) * x,
                        top: boardDimension.height - verticalMargin() - playerMagnetSize() -
                            (y * ((boardDimension.height - playerMagnetSize() - (2 * verticalMargin())) / 5))
                    }

                    pixelMargins[y][x] = margin;
                }
            }
        }

        return pixelMargins;
    }, [draggingPlayer, players, playerMagnetSize, verticalMargin, horizontalMargin, boardDimension]);

    const emptyPositions: (ReactNode | null | undefined) = useMemo(() => {
        if (players.length === 0) {
            return null;
        }

        if (!draggingPlayer) {
            return null;
        }

        let nodes: ReactNode[] = [];

        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 5; x++) {
                if (players[y][x][0] === null) {
                    // goalkeeper side positions are not avaliable to place
                    if (y === 0 && x !== 2) {
                        continue;
                    }

                    // forward left and right are not available to place
                    if (y === 5 && (x === 0 || x === 4)) {
                        continue;
                    }

                    if (emptyPositionsAbsoluteMargins === null) {
                        return;
                    }

                    nodes.push(<EmptyPosition
                        position={{ x, y }}
                        key={(y * 5) + x} size={playerMagnetSize() - 10}
                        absoluteMargin={{ top: emptyPositionsAbsoluteMargins[y][x]!.top + 5,
                             left: emptyPositionsAbsoluteMargins[y][x]!.left + 5 }}
                        onDrop={handleDrop} data-pos={y + "," + x}
                    />)
                }
            }
        }

        return <>{nodes}</>;
    }, [draggingPlayer, players, playerMagnetSize, handleDrop, emptyPositionsAbsoluteMargins]);

    const handlePlayerOnClick = useCallback((position: Position) => {
        dispatch(setSelection(position));
        dispatch(setShowEditor(true));
    }, [dispatch]);

    const handlePlayerDragStart = useCallback((player: Footballer) => {
        setDraggingPlayer(player);
    }, []);

    const handleOnTouchDraggingStart = useCallback((player: Footballer) => {
        handlePlayerDragStart(player);
    }, [handlePlayerDragStart]);

    const handleOnTouchDrop = useCallback((position: Position) => {
        // Gather tactic position from dropped client position
        const rect = boardRef.current.getBoundingClientRect();
        let droppedPosition: Position | null = null;

        // Is dropped on footballer?
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 5; x++) {
                if (playersAbsolutePositions[y][x] === null) {
                    continue;
                }
                const left = rect.left + playersAbsolutePositions[y][x]!.left;
                const top = rect.top + playersAbsolutePositions[y][x]!.top;
                if (position.x > left && position.x < left + playerMagnetSize()
                    && position.y > top && position.y < top + playerMagnetSize()) {
                    droppedPosition = { y: y, x: x };
                }
            }
        }

        if (!droppedPosition) {
            // Is droppen on empty position?
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 5; x++) {
                    if (emptyPositionsAbsoluteMargins![y][x] === null) {
                        continue;
                    }
                    const left = rect.left + emptyPositionsAbsoluteMargins![y][x]!.left;
                    const top = rect.top + emptyPositionsAbsoluteMargins![y][x]!.top;
                    if (position.x > left && position.x < left + playerMagnetSize()
                        && position.y > top && position.y < top + playerMagnetSize()) {
                        droppedPosition = { y: y, x: x };
                    }
                }
            }
        }
        handleDrop(droppedPosition);
    }, [playerMagnetSize, playersAbsolutePositions, handleDrop, emptyPositionsAbsoluteMargins]);

    const handlePlayerDragEnd = useCallback(() => {
        if (draggingPlayer) {
            setDraggingPlayer(null);
        }
    }, [draggingPlayer]);

    const board: (ReactNode | null | undefined) = useMemo(() => {
        if (players.length === 0) {
            return null;
        }

        let nodes: ReactNode[] = [];

        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 5; x++) {
                if (players[y][x][0] !== null) {
                    nodes.push(<PlayerMagnet
                        onTouchDraggingStart={handleOnTouchDraggingStart}
                        onTouchDrop={handleOnTouchDrop}
                        finalized={finalized}
                        absoluteMargin={playersAbsolutePositions[y][x]!}
                        onDragEnd={handlePlayerDragEnd}
                        isDragging={(draggingPlayer?.position?.y === y) && (draggingPlayer?.position?.x === x)}
                        isSelected={(selection?.y === y) && (selection?.x === x)}
                        position={{ x, y }}
                        onClick={() => handlePlayerOnClick({ y, x })}
                        height={playerMagnetSize()} width={playerMagnetSize()}
                        pixelPosition={playersAbsolutePositions[y][x]!}
                        onDragStart={handlePlayerDragStart}
                        onDrop={handleDrop}
                        footballer={players[y][x][0]!}
                        shirtNumber={playerShirtNumbers[y][x][0]}
                        key={players[y][x][0]?.id}
                    />)
                }
            }
        }

        return <>{nodes}</>;
    }, [playersAbsolutePositions, players, playerMagnetSize, handleDrop, handlePlayerOnClick,
        playerShirtNumbers, draggingPlayer, selection, handlePlayerDragStart, handlePlayerDragEnd,
        finalized, handleOnTouchDraggingStart, handleOnTouchDrop]);


    function handleTeamNameChange(event: ChangeEvent<HTMLInputElement>) {
        if (finalized) {
            return;
        }
        dispatch(setTeamName(event.target.value));
    }

    // If player is dropped outside set null dragging player
    useEffect(() => {
        if (draggingPlayer) {
            dispatch(setShowEditor(false));
        }

        window.ondragover = (event) => {
            event.preventDefault();
            if (draggingPlayer) {
                // Detect if dragging players moves outside of Browser window
                const mouseX = event.clientX;
                const mouseY = event.clientY;
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                const nearWindowEdge = mouseX < 10 || mouseY < 10 || mouseX > windowWidth - 10
                    || mouseY > windowHeight - 10;

                if (nearWindowEdge) {
                    setDraggingPlayer(null);
                }
            }
        }

        window.ondrop = (event) => {
            if (draggingPlayer) {
                setDraggingPlayer(null);
            }
        }

        window.addEventListener("blur", () => {
            if (draggingPlayer) {
                setDraggingPlayer(null);
            }
        });
    }, [draggingPlayer, dispatch]);

    return <div className={classes.Board} ref={boardRef}>
        <input type="text" id="teamName" placeholder="Team Name" className={classes.TeamName} max={60}
            disabled={finalized} onChange={handleTeamNameChange} value={teamName} />
        {board}
        {emptyPositions}
    </div>
});

export default Board;