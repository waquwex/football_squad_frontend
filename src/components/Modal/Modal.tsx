import { PropsWithChildren, forwardRef, useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";
import classes from "./Modal.module.css";

interface Props extends PropsWithChildren {
    onClose: () => void
}

interface ImperativeMethods {
  close: () => void
}

const Modal = forwardRef<ImperativeMethods, Props>((props: Props, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null!);

    let portalRoot = document.getElementById("portalRoot");
    if (portalRoot === null) {
        portalRoot = document.createElement("div");
        portalRoot.id = "portalRoot";
        document.body.appendChild(portalRoot);
    }

    useImperativeHandle(ref, () => {
      return {
        close: () => {
          dialogRef.current.close();
          props.onClose();
        }
      }
    });

    return createPortal(
      <dialog ref={dialogRef} open className={classes.Modal} onClose={props.onClose}>
        {props.children}
      </dialog>,
      portalRoot);
});


export default Modal;