import React from 'react';
import './App.css';

const apiURL = "http://localhost:3030/janki/bucataj/Japanese%201/profile.json";

// To ignore warnings about unused function:
// eslint-disable-next-line
function TODO() {
  //console.log('TODO');
  alert('TODO');
}

function flattenArray(a) {
  // from StackOverflow https://tinyurl.com/y8zcwsut
  return [].concat(...a);
}

// sort an array leaving the original alone
function sorted(a, f) {
  // sort function "undefined" means use built-in default comparator
  return [...a].sort(f);
}

/***********************************************/

function getAPI(getURL, setReturnValue, setErrorMessage) {
  let xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    //console.log("readyState " + xhr.readyState + " " + xhr.status)
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        setReturnValue(JSON.parse(xhr.response))
      } else {
        setErrorMessage("getAPI got HTTP status " + xhr.status)
      }
    }
  }
  xhr.open("GET", getURL)
  xhr.send()
}

function postAPI(postURL, sendJSONDocument, setReturnValue, setErrorMessage) {
  let xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    console.log("POST readyState " + xhr.readyState + " " + xhr.status)
    if (xhr.readyState === 4) {
      if (xhr.status === 201) {
        setReturnValue()
      } else {
        setErrorMessage("postAPI got HTTP status " + xhr.status)
      }
    }
  }
  xhr.open("POST", postURL, true)
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.send(JSON.stringify(sendJSONDocument))
}

/***********************************************/

function useModal(
  {
    boxId = "w3modal-box",
    inputId = "w3modal-input",
  } = {}
) {
  const [ callbackProps, setCallbackProps ] = React.useState();

  function openModal(props) { setCallbackProps(props); }

  function closeModal() { setCallbackProps(undefined); }

  function runAcceptCallback() {
    let iv = document.getElementById(inputId).value;
    let ac = callbackProps.acceptCallback;
    ac(iv);

    closeModal();
  }

  function Modal(props) {
    function getProp(p) { return callbackProps[p] || props[p]; }

    return (
        callbackProps ?
        <div id={boxId} className="w3modal">
          <div className="w3modal-content">
            <span className="w3modal-close" onClick={closeModal}>&times;</span>
            <p>{getProp("promptText")}</p>
            <input type="text" id={inputId} defaultValue={() => getProp("inputDefaultValue")} />&nbsp;
            <button className="btn btn-info" onClick={runAcceptCallback}>{getProp("acceptButtonText")}</button>
          </div>
        </div>
        : ''
    );
  }

  return {...{ Modal, openModal, closeModal }};
}

/***********************************************/

function NavBar({
  activeTabName, setActiveTabName, tabPages
}) {
  function NavBarTab({ thisTab }) {
    let tabEnabled = ((x) => x instanceof Function ? x() : x)(thisTab.enabled);

    let tabClassName =
      activeTabName === thisTab.name ? "active" :
      !tabEnabled ? "disabled" :
      "";

    return (
      <li className={"nav-item " + tabClassName}>
        <button type="button" className="btn btn-link nav-link"
          disabled={!tabEnabled}
          onClick={() => setActiveTabName(thisTab.name)}
        >{thisTab.name}</button>
      </li>
    );
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
      <div className="navbar-brand">jAnki</div>

      <div className="collapse navbar-collapse" id="myNavbar">
        <ul className="navbar-nav">
          {tabPages.map(
            eachTab => <NavBarTab key={eachTab.name} thisTab={eachTab} />
          )}
        </ul>
      </div>
    </nav>
  );
}

/***********************************************/

function DeckPage({
  localJSON, rerenderJSON,
  setLearningDeckName,
  setActiveTabName,
  getAllCards,
  findCardsInDeck
}) {
  function calcDeckCounts() {
    let ac = getAllCards();

    let res = ac.reduce(
      (s, c) => {
        let deckName = c.card_status.deck;
        let cardState = c.card_status.state;
        let dueTime = c.card_status.due_time;

        if (cardState === "review" && dueTime < Date.now()) {
          cardState = "due";
        }

        s[deckName] = s[deckName] || {};
        s[deckName][cardState] = s[deckName][cardState] || 0;
        s[deckName][cardState]++;

        return s;
    }, {});

    return res;
  }

  let deckCounts = calcDeckCounts();

  function pickDeck(d) {
    setLearningDeckName(d);
    setActiveTabName("Learn");
  }

  let { Modal, openModal } = useModal();

  function createDeck(newDeckName) {
    localJSON.decks.push(newDeckName);
    rerenderJSON();
  }

  function deleteDeck(deckName) {
    // if any entries, at least one count is non-zero
    if (deckCounts[deckName]) {
      alert(`Deck ${deckName} not empty`);
    } else {
      localJSON.decks = localJSON.decks.filter(d => d !== deckName);
      rerenderJSON();
    }
  }

  function getDeckCount(deckName, stateName) {
    let x = deckCounts[deckName];
    if (!x) { return 0; }
    return x[stateName] || 0;
  }

  return (
    <>
      <h1>My Decks</h1>
      <table className="table table-bordered table-hover">
        <thead className="thead-light">
          <tr>
            <th className="col-sm-3"></th>
            <th className="col-sm-1">New Cards</th>
            <th className="col-sm-1">Reviews Due</th>
            <th className="col-sm-1">Reviews Later</th>
            <th className="col-sm-1"></th>
            <th className="col-sm-1"></th>
          </tr>
        </thead>
        <tbody>
          {sorted(localJSON.decks).map(d =>
              <tr key={d}>
                <td>{d}</td>
                <td>{getDeckCount(d, "new")}</td>
                <td>{getDeckCount(d, "due")}</td>
                <td>{getDeckCount(d, "review")}</td>
                <td><button className="btn btn-success" onClick={() => pickDeck(d)}>Learn</button></td>
                <td><button className="btn btn-danger" onClick={() => deleteDeck(d)}>Delete</button></td>
              </tr>
          )}
        </tbody>
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
}

/***********************************************/

function LearnPage({
  localJSON, rerenderJSON,
  learningDeckName,
  findCardsInDeck
}) {
  const [ displayState, setDisplayState ] = React.useState("front");

  function nextReviewTime(answer) {
    // If this were an actual Spaced-Repetition System,
    // we'd be doing some sophisticated math here to
    // determine when to show this card next.

    switch (answer) {
      case "again": return 1e3 * 10;       // 10 seconds
      case "hard":  return 1e3 * 90;       // 90 seconds
      case "easy":  return 1e3 * 4 * 3600; // 4 hours
      default: return 0;
    }
  }

  function nextCard() {
    // find the most due card
    // (for a real system this should be a heap or something)

    function state(c) { return c.card_status.state; }
    function due(c) { return c.card_status.due_time; }

    // To randomize new cards, give each one a random number
    // to be compared with others.  Memoize to a cache here
    // rather than trying to decorate the JSON entry with
    // the number which we'd just have to remove later
    // anyway before syncing.

    let randomCardCache = {};

    function randomizeNew(card) {
      let c = card.note_id + '-' + card.card_type_name;
      if (!(c in randomCardCache)) {
        randomCardCache[c] = Math.random();
      }
      return randomCardCache[c];
    }

    let res =
      findCardsInDeck(learningDeckName).filter(
        card =>
          state(card) === "new"
          ||
          ( state(card) === "review" && due(card) < Date.now() )
      ).reduce(
        (mostDue, considerCard) => {
          switch (state(mostDue) + '-' + state(considerCard)) {
            case 'new-review': return considerCard;
            case 'review-new': return mostDue;
            case 'review-review': return (due(considerCard) < due(mostDue) ? considerCard : mostDue);
            case 'new-new': return (randomizeNew(considerCard) < randomizeNew(mostDue) ? considerCard : mostDue);
            default: return undefined;
          }
        }
      );

    return res;
  }

  const [ currentCard, setCurrentCard ] = React.useState( () => nextCard() );

  function interpolateFields(card, cardSide) {
    // Regex replace help, see https://javascript.info/regexp-methods
    return card.card_template[cardSide].replace(
      /\{([^{}]+)\}/g,
      (fullMatch, parenMatch) => card.note_fields[parenMatch]
    );
  }

  let frontSubbed = interpolateFields(currentCard, "front");
  let backSubbed = interpolateFields(currentCard, "back");

  function rescheduleCard(answer) {
    currentCard.card_status.state = "review";
    currentCard.card_status.due_time = Date.now() + nextReviewTime(answer);
    setCurrentCard(nextCard());
    setDisplayState("front");
    rerenderJSON();
  }

  return (
    <>
    <div id="front_side" dangerouslySetInnerHTML={{__html: frontSubbed}} />
    <hr />
    { displayState === "front" ?
      <button className="btn btn-primary btn-lg" onClick={() => setDisplayState("back")} >Show Answer</button>
      :
      <>
      <div id="back_side" dangerouslySetInnerHTML={{__html: backSubbed}} />
      <br/>
      <div className="btn-group btn-group-lg">
        <button type="button" className="btn btn-danger" onClick={() => rescheduleCard("again")}>Again</button>
        <button type="button" className="btn btn-secondary" onClick={() => rescheduleCard("hard")}>Hard</button>
        <button type="button" className="btn btn-success" onClick={() => rescheduleCard("easy")}>Easy</button>
      </div>

      </>
    }
    </>
  );
}

/***********************************************/

function EditPage({
  localJSON, rerenderJSON
}) {
  const [ editingNoteId, setEditingNoteId ] = React.useState();

  function BrowserPage() {
    function BrowserLine({ thisNote, thisNoteId }) {
      return (
        <tr>
          <td>{thisNote.note_fields[localJSON.note_types[thisNote.note_type].key_field]}</td>
          <td>{thisNote.note_type}</td>
          <td><button className="btn btn-primary" onClick={() => setEditingNoteId(thisNoteId)}>Edit</button></td>
          <td><button className="btn btn-danger" onClick={() => setEditingNoteId(thisNoteId)}>Delete</button></td>
        </tr>
      );
    }

    return (
      <table className="table table-bordered table-hover">
        <thead className="thead-light">
          <tr>
            <th className="col-sm-4">Key Field</th>
            <th className="col-sm-2">Note Type</th>
            <th className="col-sm-1"></th>
            <th className="col-sm-1"></th>
          </tr>
        </thead>
        <tbody>
          {localJSON.notes.map(
            (eachNote, eachNoteId) => <BrowserLine key={eachNoteId} thisNote={eachNote} thisNoteId={eachNoteId} />
          )}
        </tbody>
      </table>
    );
  }

  function EditingNotePage() {
    let note = localJSON.notes[editingNoteId];
    let noteType = localJSON.note_types[note.note_type];

    function EditingNoteField({ thisField }) {
      return (
        <tr>
          <td className="col-sm-1"><label
            htmlFor={thisField.field_name}
          />{thisField.field_name}</td>
          <td className="col-sm-6">
            { thisField.field_type === "textarea" ?
              <textarea
                name={thisField.field_name}
                defaultValue={note.note_fields[thisField.field_name]}
              />
              :
              <input
                type="text"
                name={thisField.field_name}
                defaultValue={note.note_fields[thisField.field_name]}
              />
            }
          </td>
        </tr>
      );
    }

    function saveNote() {
      for (let thisField of noteType.fields) {
        note.note_fields[thisField.field_name] =
          document.getElementsByName(thisField.field_name)[0].value;
      }

      setEditingNoteId(undefined);
      rerenderJSON();
    }

    return (
      <>
      <table className="table table-bordered table-hover note-edit">
        <tbody>
          {noteType.fields.map(
            (eachField, eachFieldId) => <EditingNoteField key={eachFieldId} thisField={eachField} />
          )}
        </tbody>
      </table>
      <button id="save" className="btn btn-info" onClick={saveNote}>Save</button>&nbsp;
      <button id="cancel" className="btn btn-danger" onClick={() => setEditingNoteId(undefined)}>Cancel</button>
      </>
    );
  }

  return (
    editingNoteId === undefined ?
    <BrowserPage /> :
    <EditingNotePage />
  );
}

/***********************************************/

function DesignPage({
  localJSON, rerenderJSON
}) {
  const [ designingNoteType, setDesigningNoteType ] = React.useState();
  const [ designingCardType, setDesigningCardType ] = React.useState();

  function designIt(noteType, cardType) {
    setDesigningNoteType(noteType);
    setDesigningCardType(cardType);
  }

  function backToDesignBrowser() {
    setDesigningNoteType(undefined);
    setDesigningCardType(undefined);
  }

  function BrowserPage(props) {
    let { Modal, openModal } = useModal();

    return (
      <>

      <table className="table table-bordered table-hover">
        <thead className="thead-light">
          <tr>
            <th className="col-sm-2">Note Type</th>
            <th className="col-sm-2">Card Type</th>
            <th className="col-sm-1"></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(localJSON.note_types).map(
            ([eachNoteType, eachNoteTypeData]) => (
              // using JSX fragment gives React key prop warnings,
              // returning an explicit array fixes this
              [
                <tr key={eachNoteType}>
                  <td>{eachNoteType}</td>
                  <td><button className="btn btn-success btn-sm"
                          onClick={() => openModal({ acceptCallback: TODO })
                        }>&#x25BC; New Card Type &#x25BC;</button></td>
                  <td><button className="btn btn-primary"
                    onClick={() => designIt(eachNoteType)}
                  >Edit</button></td>
                </tr>
              ].concat(
                Object.entries(eachNoteTypeData.card_types).map(
                  ([eachCardType, eachCardTypeData]) => (
                    <tr key={eachNoteType + '-' + eachCardType}>
                      <td></td>
                      <td>{eachCardType}</td>
                      <td><button className="btn btn-primary"
                        onClick={() => designIt(eachNoteType, eachCardType)}
                      >Edit</button></td>
                    </tr>
                  )
                )
              )
            )
          )}
        </tbody>
      </table>

      <Modal
        promptText="Name your new card type"
        acceptButtonText="Create"
      />

      </>
    );
  }

  function DesigningNoteTypePage() {
    let noteType = localJSON.note_types[designingNoteType];

    let { Modal, openModal } = useModal();

    function doCreateField(newName) {
      alert(`TODO create ${newName}`);
    }

    function DesigningNoteTypeField({ thisFieldId, thisField }) {
      function doRename(newName) {
        alert(`TODO rename ${thisField.field_name} to ${newName}`);
      }

      return (
        <tr>
          <td>
            <div className="btn-group btn-group-sm">
              <button type="button" className="btn btn-secondary" onClick={TODO}>&#x25B2;</button>
              <button type="button" className="btn btn-secondary" onClick={TODO}>&#x25BC;</button>
            </div>
          </td>
          <td>
            <input type="text" id={`field_name_${thisFieldId}`} defaultValue={thisField.field_name} readOnly={true} />
          </td>
          <td>
            <button
              id={`rename_field_${thisFieldId}`}
              className="btn btn-primary"
              onClick={() =>
                openModal({
                  promptText: "Rename your field",
                  inputDefaultValue: thisField.field_name,
                  acceptButtonText: "Rename",
                  acceptCallback: doRename
                })}
            >Rename</button>&nbsp;
          </td>
          <td>
            <select id={`field_type_${thisFieldId}`} selected={thisField.field_type}>
              <option value="string">String</option>
              <option value="textarea">Textarea</option>
            </select>
          </td>
        </tr>
      );
    }

    return (
      <>
      <table className="table table-bordered table-hover note-edit">
        <thead className="thead-light">
          <tr>
            <th className="col-sm-1">Move</th>
            <th className="col-sm-2">Field Name</th>
            <th className="col-sm-1"></th>
            <th className="col-sm-1">Field Type</th>
          </tr>
        </thead>
        <tbody>
          {noteType.fields.map(
            (eachField, eachFieldId) => <DesigningNoteTypeField key={eachFieldId} thisFieldId={eachFieldId} thisField={eachField} />
          )}
        </tbody>
      </table>

      <button id="create"
        className="btn btn-secondary"
        onClick={() =>
          openModal({
            promptText: "Name your new field",
            acceptButtonText: "Create",
            acceptCallback: doCreateField
          })}
      >Create Field</button>&nbsp;
      <button id="save" className="btn btn-info" onClick={TODO}>Save</button>&nbsp;
      <button id="cancel" className="btn btn-danger" onClick={backToDesignBrowser}>Cancel</button>

      <Modal />

      </>
    );
  }

  function DesigningCardTypePage() {
    let noteType = localJSON.note_types[designingNoteType];
    let cardType = noteType.card_types[designingCardType];

    function saveLayout() {
      cardType.front = document.getElementById("layout_front").value;
      cardType.back = document.getElementById("layout_back").value;
      setDesigningNoteType(undefined);
      setDesigningCardType(undefined);
    }

    return (
      <>

      <h2>{designingCardType}</h2>

      <h3>Front</h3>
      <textarea id="layout_front" className="layout-edit-field" defaultValue={cardType.front} />
      <h3>Back</h3>
      <textarea id="layout_back" className="layout-edit-field" defaultValue={cardType.back} />

      <button id="save" className="btn btn-info" onClick={saveLayout}>Save</button>&nbsp;
      <button id="cancel" className="btn btn-danger" onClick={backToDesignBrowser}>Cancel</button>
      </>
    );
  }

  return (
    designingCardType !== undefined ?
    <DesigningCardTypePage /> :
    designingNoteType !== undefined ?
    <DesigningNoteTypePage /> :
    <BrowserPage />
  );
}

/***********************************************/

function SyncPage({
  localJSON, setLocalJSON
}) {
  const [ isLoading, setLoading ] = React.useState(false);
  const [ loadingMessage, setLoadingMessage ] = React.useState();

  React.useEffect(() => {
    function gotJSON(ret) {
      setLocalJSON(ret);
      setLoading(false);
      setLoadingMessage( <span className="text-success">Sync successful!</span> );
    }

    function gotError(ret) {
      setLoading(false);
      setLoadingMessage( <span className="text-danger">{"Error: " + ret}</span> );
    }

    function toGetJSON() {
      getAPI(apiURL, gotJSON, gotError);
    }

    if (isLoading === "needed") {
      setLoading("running");
      setLoadingMessage("");

      if (localJSON) {
        postAPI(apiURL, localJSON,
          toGetJSON,
          gotError
        );
      } else {
        toGetJSON();
      }

    }

  }, [localJSON, setLocalJSON, isLoading, setLoading])
      // rerun whenever the flag variable tells us to reload
      // but it leaves the state untouched if nothing needed
      // (so no infinite loops of rerender events)

  return (
    <>
    <div>
      Click&nbsp;
      <button
        onClick={() => setLoading("needed")}
        disabled={isLoading}
      >{isLoading ? "..." : "Sync"}</button>
      &nbsp;to sync
    </div>
    <br />
    <div>{loadingMessage}</div>
    </>
  );
}

/***********************************************/

function App() {
  const [ activeTabName, setActiveTabName ] = React.useState("Sync");
  const [ localJSON, setLocalJSON ] = React.useState();
  const [ learningDeckName, setLearningDeckName ] = React.useState();

  function rerenderJSON() {
    // Force a rerender when changes made directly to JSON object
    // Must do at least a shallow copy or the reassignment will be a no-op
    setLocalJSON(Object.assign({}, localJSON));
  }

  function getAllCards() {
    let notes =
      localJSON.notes.map(
        (n, nid) => ({
          note_id: nid,
          note_type_name: n.note_type,
          note_type_data: localJSON.note_types[n.note_type],
          note_fields: n.note_fields,
          card_status: n.card_status
        })
      );

    let cards = flattenArray(
      notes.map(
        fn => Object.entries(fn.card_status).map(
          ([card_type_name, card_status]) => ({
            note_id: fn.note_id,
            note_type_name: fn.note_type_name,
            note_fields: fn.note_fields,
            card_type_name: card_type_name,
            card_template: fn.note_type_data.card_types[card_type_name],
            card_status: card_status
          })
        )
      )
    );

    return cards;
  }

  function findCardsInDeck(deckName) {
    return getAllCards().filter(c => c.card_status.deck === deckName);
  }

  let tabProps = {...{
    setActiveTabName,
    localJSON, setLocalJSON, rerenderJSON,
    learningDeckName, setLearningDeckName,
    getAllCards, findCardsInDeck
  }};

  function ifHaveJSON() { return !!localJSON; }
  function ifLearningADeck() { return !!learningDeckName; }

  const tabPages = [
    { name: "Decks",  page: <DeckPage   {...tabProps} />, enabled: ifHaveJSON },
    { name: "Learn",  page: <LearnPage  {...tabProps} />, enabled: ifLearningADeck },
    { name: "Edit",   page: <EditPage   {...tabProps} />, enabled: ifHaveJSON },
    { name: "Design", page: <DesignPage {...tabProps} />, enabled: ifHaveJSON },
    { name: "Sync",   page: <SyncPage   {...tabProps} />, enabled: true },
  ];

  function getPageByName(name) { return tabPages.filter(t=>t.name===name)[0]; }

  return (
    <div className="App page-beneath-navbar">
      <NavBar {...{activeTabName, setActiveTabName, tabPages}} />
      {getPageByName(activeTabName).page}
    </div>
  );
}

export default App;
