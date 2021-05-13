import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBoard } from '../../../context/BoardContext';
import styles from './addboardmodal.module.css';

function AddBoardModal(props) {
  const { bgOptions } = useBoard();
  const ref = useRef();
  const [mounted, setMounted] = useState(false);
  const [currentColor, setCurrentColor] = useState(bgOptions[0]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    ref.current = document.querySelector('#modal');
    setMounted(true);
  }, []);

  if (!mounted) return null;

  function onChangeHandle(event) {
    setInputText(event.target.value);
  }
  return createPortal(
    <div className={styles.modalWrapper}>
      <div className={styles.background} />
      <div className={styles.modalBodyWrapper}>
        <div className={styles.modalBody}>
          <div className={styles.cardWrapper}>
            <div
              className={styles.fakeCard}
              style={{ backgroundColor: currentColor }}>
              <input
                type="text"
                value={inputText}
                onChange={onChangeHandle}
                placeholder="Add board title"
              />
            </div>
            <div className={styles.colorHolder}>
              {bgOptions.map((color) => (
                <div
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}></div>
              ))}
            </div>
          </div>
          <div>
            <button>Create board</button>
            <button className={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      </div>
    </div>,
    ref.current,
  );
}
export default AddBoardModal;
