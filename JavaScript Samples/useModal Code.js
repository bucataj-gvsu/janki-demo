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

