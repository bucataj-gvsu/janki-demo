  let { Modal, openModal } = useModal();

  /* ... */

  return (
    <>
      <h1>My Decks</h1>
      <table className="table table-bordered table-hover">
      	...
      </table>

      <button id="create_deck_open"
        className="btn btn-info"
        onClick={() => openModal({ acceptCallback: createDeck })}
      >Create Deck</button>

      <Modal
            promptText="Name your new deck"
            acceptButtonText="Create Deck"
      />

    </>
  );

