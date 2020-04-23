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

