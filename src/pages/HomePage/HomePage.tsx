import classes from './HomePage.module.css';
import Board from '../../components/Board/Board';
import Editor from '../../components/Editor/Editor';
import Actions from '../../components/Actions/Actions';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { useDispatch } from 'react-redux';
import { clearSelection } from '../../store/selectionSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { getSquad } from '../../utils/HttpRequests';
import Footballer from '../../models/Footballer';
import { setSquad } from '../../store/footballersSlice';
import { finalizeTeam, setTeamName } from '../../store/teamSlice';
import Modal from '../../components/Modal/Modal';
import { setShowEditor } from '../../store/uiSlice';


function HomePage() {
  const boardRef = useRef<HTMLDivElement>(null!);
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const teamName = useSelector((state: RootState) => state.team.name);
  const teamFinalized = useSelector((state: RootState) => state.team.finalized);
  const modalRef = useRef(null);
  const [haveSpaceForEditor, setHaveSpaceForEditor] = useState<boolean>();
  const showEditor = useSelector((state: RootState) => state.ui.showEditor);

  useEffect(() => {
    let guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!params.squadId || !guidPattern.test(params.squadId)) {
      console.log("No squad guid or guid is invalid");
      return;
    }

    // get squad from DB with its ID
    const getSquadAsync = async () => {
      try {
        const data = await getSquad(params.squadId!);
        if (data.squadName === null || data.footballers === null) {
          return;
        }
        const shirtNumbers: number[] = data.footballers.map((f: any) => {
          return f.shirtNumber !== 255 ? f.shirtNumber : null 
        });
        const footballers: Footballer[] = data.footballers.map((f: any) => {
          return {
            id: f.id,
            name: f.name,
            position: { y: f.positionY, x: f.positionX },
            imageUrl: f.imageUrl,
            shirtNumber: f.shirtNumber !== 255 ? f.shirtNumber : null
          }
        });

        dispatch(setSquad({ footballers, shirtNumbers }));
        dispatch(setTeamName(data.squadName));
        dispatch(finalizeTeam(true));
      } catch (error) {
        console.error(error);
        return;
      }
    }
    getSquadAsync();

  }, [params.squadId, dispatch, navigate, teamFinalized]);

  const handleSaveAsImage = useCallback(() => {
    dispatch(clearSelection());
    toPng(boardRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "Squad_" + teamName + ".png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch, teamName]);

  useEffect(() => {
    setHaveSpaceForEditor(window.innerWidth > 700);

    function resizeHandler() {
      setHaveSpaceForEditor(window.innerWidth > 700);
    }

    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  function handleCloseEditor() {
    dispatch(setShowEditor(false));
    dispatch(clearSelection());
  }

  return <div className={classes.HomePage}>
    <Actions onSaveAsImage={handleSaveAsImage} />
    <div className={classes.BoardAndEditor}>
      <Board ref={boardRef} />
      {haveSpaceForEditor &&
        <Editor />
      }
      {(showEditor && !haveSpaceForEditor) &&
        <Modal ref={modalRef} onClose={handleCloseEditor}>
          <Editor />
        </Modal>
      }
    </div>
  </div>
}

export default HomePage;