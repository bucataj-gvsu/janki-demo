function App() {
  const [ activeTabName, setActiveTabName ] = React.useState("Sync");

  /* ... */

  let tabProps = {...{
    setActiveTabName,
    localJSON, setLocalJSON, rerenderJSON,
    learningDeckName, setLearningDeckName,
    getAllCards, findCardsInDeck
  }};

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
