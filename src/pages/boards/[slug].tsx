import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  resetServerContext,
} from 'react-beautiful-dnd';

import AddList from '../../components/BoardPage/AddList';
import Card from '../../components/BoardPage/Card';
import Column from '../../components/BoardPage/Column';
import ColumnHeader from '../../components/BoardPage/ColumnHeader';
import ModalPortal from '../../components/BoardPage/ModalPortal';
import { Board, useBoard } from '../../context/BoardContext';
import { Card as ICard, useCards } from '../../context/CardsContext';
import { useList } from '../../context/ListsContext';
import { useModal } from '../../context/ModalContext';
import styles from '../../styles/Board.module.css';
import ApiCall from '../../utils/API';
import { sessionReturn } from '../../utils/interfaces';

export default function BoardSlug({
  bId,
  bTitle,
  cards,
  lists,
  bColor,
  isPublic,
  isAuthorized,
}) {
  resetServerContext();

  const [session, loading] = useSession();

  const { putBoardData, changeBoard, title, bgColor, bgOptions } = useBoard();
  const { createList, putLists, currentList, moveList, getList } = useList();
  const {
    createInitialCard,
    putCards,
    currentCards,
    moveCard,
    getCard,
    updateCardData,
  } = useCards();
  const { showModal } = useModal();

  useEffect(() => {
    if (bTitle !== '' && bTitle !== undefined) {
      putBoardData(bTitle, bColor);
      putCards(cards);
      putLists(lists);
    }
  }, [cards, lists]);

  function updateCardHandler(cardData: ICard) {
    updateCardData(bId, cardData);
  }
  function createCard(name: string, list: string) {
    if (!String(name) || !String(list)) return;
    createInitialCard(bId, { name, list });
  }
  function dragEndHandle(e: any) {
    if (!e.destination) return;
    if (
      e.source.droppableId === e.destination.droppableId &&
      e.source.index === e.destination.index
    ) {
      return;
    }
    if (e.type === 'CARD') {
      moveCard(
        bId,
        e.draggableId,
        e.destination.droppableId,
        e.destination.index,
      );
    }
    if (e.type === 'COLUMN') {
      moveList(bId, e.draggableId, e.destination.index);
    }
  }
  function createListHandle(listData: string) {
    createList(bId, listData);
  }

  if (typeof window !== 'undefined' && loading) return null;
  if (typeof window !== 'undefined' && !isPublic && !isAuthorized) {
    const router = useRouter();
    router.push('/');
    return null;
  }
  return (
    <DragDropContext onDragEnd={dragEndHandle}>
      <Head>
        <title>{title} - Nello</title>
      </Head>
      <div
        className={styles.backgroundHolder}
        style={{ backgroundColor: bgColor }}
      />
      <ModalPortal
        getList={getList}
        getCard={getCard}
        updateCardData={updateCardHandler}
      />
      <ColumnHeader
        changeBgHandler={(value) => changeBoard(bId, 'background', value)}
        changeTitleHandler={(value) => changeBoard(bId, 'title', value)}
        title={bTitle}
        bgOptions={bgOptions}
      />
      <Droppable
        direction="horizontal"
        type="COLUMN"
        droppableId="board"
        isDropDisabled={!isAuthorized}>
        {(provided, snapshot) => (
          <div
            className={styles.BoardWrapper}
            ref={provided.innerRef}
            {...provided.droppableProps}>
            {currentList.map((column, index) => (
              <Column
                createCard={createCard}
                title={column.title}
                id={column.id}
                key={column.id}
                index={index}
                isDropDisabled={!isAuthorized}>
                {currentCards
                  .filter((item) => item.list === String(column.id))
                  .map((item, index) => (
                    <Draggable
                      isDragDisabled={!isAuthorized}
                      key={item.id}
                      draggableId={item.id}
                      index={index}>
                      {(provided, snapshot) => (
                        <div
                          id={item.id}
                          onClick={() => showModal(item.id)}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          draggable={true}>
                          <Card id={item.id}>{item.name}</Card>
                          {provided.placeholder}
                        </div>
                      )}
                    </Draggable>
                  ))}
              </Column>
            ))}
            {provided.placeholder}
            {isAuthorized && <AddList createList={createListHandle} />}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = (await getSession(ctx)) as unknown as sessionReturn;
  const { slug } = ctx.params;

  const data: Board = await ApiCall(`http://localhost:3000/api/boards/${slug}`);
  let isAuthorized = false;
  if (session) {
    isAuthorized =
      String(data.author) === String(session.user.userId) ||
      data.permissionList.includes(String(session.user.userId));
  }

  return {
    props: {
      bId: data.id,
      bTitle: data.title,
      cards: data.cards,
      lists: data.lists,
      bColor: data.bgcolor,
      isPublic: data.isPublic,
      isAuthorized,
      session,
    },
  };
};