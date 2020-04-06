window.onload = () => {
  const form = document.getElementById("add-note-form");
  const board = document.getElementById("notes");
  const cancelButton = document.getElementById("cancel");

  NoteStorage.index().forEach((note) =>
    BoardManager.attachNoteOnBoard(board, note)
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let input = document.getElementById("note");
    if (event.target.dataset.action === "store") {
      storeNote(input.value);
    } else {
      updateNote(event.target.dataset.id, input.value);
    }
    clearNoteInputAndResetForm();
  });
  cancelButton.addEventListener("click", (event) => {
    clearNoteInputAndResetForm();
  });
  document.addEventListener("click", (event) => {
    deleteNote(event);
    prepareEdit(event);
  });

  function clearNoteInputAndResetForm() {
    let input = document.getElementById("note");
    let form = document.getElementById("add-note-form");
    form.dataset.id = "";
    form.dataset.action = "store";
    input.value = "";
  }
  function deleteNote(event) {
    if (
      event.target.dataset.id &&
      event.target.dataset.id.includes("note") &&
      event.target.dataset.action === "delete"
    ) {
      let id = event.target.dataset.id;
      NoteStorage.delete(id);
      BoardManager.detachNoteFromBoard(board, id);
    }
  }
  function prepareEdit(event) {
    if (
      event.target.dataset.id &&
      event.target.dataset.id.includes("note") &&
      event.target.dataset.action === "edit"
    ) {
      let form = document.getElementById("add-note-form");
      let input = document.getElementById("note");
      form.dataset.id = event.target.dataset.id;
      form.dataset.action = "update";
      input.value = NoteStorage.view(event.target.dataset.id).text;
      input.focus();
    }
  }
  function updateNote(id, value) {
    if (value.trim().length > 0) {
      BoardManager.detachNoteFromBoard(board, id);
      let note = NoteStorage.update(id, value);
      BoardManager.attachNoteOnBoard(board, note);
    }
  }
  function storeNote(value) {
    if (value.trim().length > 0) {
      let note = NoteStorage.store(value);
      BoardManager.attachNoteOnBoard(board, note);
    }
  }
};

const NoteStorage = {
  store: (text) => {
    let id = Utils.generateID();
    let note = { id, text };
    localStorage.setItem(id, JSON.stringify(note));
    return note;
  },
  delete: (id) => {
    localStorage.removeItem(id);
  },
  update: (id, text) => {
    let note = { id, text };
    localStorage.setItem(id, JSON.stringify(note));
    return note;
  },
  index: () => {
    let noteKeys = Object.keys(localStorage).filter((key) =>
      key.includes("note")
    );
    let notes = noteKeys.map((key) => JSON.parse(localStorage.getItem(key)));
    return notes;
  },
  view: (id) => {
    return JSON.parse(localStorage.getItem(id));
  },
};

const BoardManager = {
  getConfig: () => {
    const config = {};
    if (!config.converter) {
      config.converter = new showdown.Converter();
    }
    return config;
  },
  attachNoteOnBoard: (board, note) => {
    let markdownTextToHtml = BoardManager.getConfig().converter.makeHtml(
      note.text
    );
    let noteToAttach =
      '<div class="card" data-id="' +
      note.id +
      '">' +
      markdownTextToHtml +
      '<div class="actions"><button type="button" data-id="' +
      note.id +
      '" data-action="edit" class="edit">Edit</button> <button type="button" data-id="' +
      note.id +
      '" data-action="delete" class="delete">Delete</button> </div></div>';
    Utils.appendHtml(board, noteToAttach);
  },
  detachNoteFromBoard: (board, id) => {
    let noteToDetach = document.querySelector(`div[data-id="${id}"]`);
    board.removeChild(noteToDetach);
  },
};

const Utils = {
  generateID: () => `note_${Math.random().toString(36).substr(2, 9)}`,
  appendHtml: (el, str) => {
    let div = document.createElement("div");
    div.innerHTML = str;
    while (div.children.length > 0) {
      el.appendChild(div.children[0]);
    }
  },
};
