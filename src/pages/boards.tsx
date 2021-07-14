import { useEffect, useState } from 'react';
import AddBoardModal from '../components/BoardListing/AddBoardModal';
import BoardsList from '../components/BoardListing/BoardsList';
import ProfileSideBar from '../components/BoardListing/ProfileSideBar';
import { Board, useBoard } from '../context/BoardContext';
import styles from '../styles/BoardListing.module.css';
import ApiCall from '../utils/API';

interface apiReturn {
  username: any;
  boards: Board[];
}

function BoardListing({ boards, username }) {
  const { bgOptions, myBoards, putMyBoards, createNewBoard } = useBoard();
  const [isCreateModal, setIsCreateModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(boards);
      putMyBoards(boards);
    }
  }, [boards]);

  function toggleModal() {
    setIsCreateModal(!isCreateModal);
  }

  function createBoardHandle(title, color) {
    createNewBoard(title, color);
  }

  return (
    <div className={styles.wrapper}>
      {isCreateModal ? (
        <AddBoardModal
          bgOptions={bgOptions}
          toggleModal={toggleModal}
          createBoard={createBoardHandle}
        />
      ) : (
        ''
      )}
      <ProfileSideBar username={'Rawallon Cardoso'} />
      <BoardsList boards={myBoards} showModal={toggleModal} />
    </div>
  );
}
export default BoardListing;

export const getStaticProps = async (ctx) => {
  const data: apiReturn = await ApiCall(
    `http://localhost:3000/api/boards?userid=60ee30ef2607d5dc5ddc6c8c`,
  );
  return {
    props: {
      boards: data,
      username: 'Rawallon',
    },
  };
};
