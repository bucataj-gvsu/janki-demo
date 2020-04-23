    let { Modal, openModal } = useModal();

    return (
          /* ... */
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
        /* ... */
    );

    /* ... */

    return (
      ...
      <button id="create"
        className="btn btn-secondary"
        onClick={() =>
          openModal({
            promptText: "Name your new field",
            acceptButtonText: "Create",
            acceptCallback: doCreateField
          })}
      >Create Field</button>

      /* ... */

      <Modal />

      </>
    );
  }
