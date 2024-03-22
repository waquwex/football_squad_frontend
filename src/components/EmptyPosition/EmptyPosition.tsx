import AbsoluteMargin from "../../utils/AbsoluteMargin";
import { Position } from "../../utils/Position";
import classes from "./EmptyPosition.module.css";


interface Props {
    size: number,
    absoluteMargin: AbsoluteMargin,
    onDrop: (position: Position) => void,
    position: Position,
}

function EmptyPosition(props: Props) {
    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();       
    }

    function handleOnDrop(event: React.DragEvent<HTMLDivElement>) {
        props.onDrop(props.position);
    }

    return <div className={classes.EmptyPosition}
    onDragOver={handleDragOver}
    onDrop={handleOnDrop}
        style={{ width: props.size, height: props.size,
            top: props.absoluteMargin.top, left: props.absoluteMargin.left}}>
    </div>
}

export default EmptyPosition;