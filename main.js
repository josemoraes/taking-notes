window.onload = () => {
  const form = document.getElementById("add-note-form");
  const board = document.getElementById("notes");
  NoteStorage.index().forEach((note) =>
    BoardManager.attachNoteOnBoard(board, note)
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let input = document.getElementById("note");
    let note = NoteStorage.store(input.value);
    BoardManager.attachNoteOnBoard(board, note);
    input.value = "";
  });

  document.addEventListener("click", (event) => {
    if (
      event.target &&
      event.target.dataset.id.includes("note") &&
      event.target.dataset.action === "delete"
    ) {
      let id = event.target.dataset.id;
      NoteStorage.delete(id);
      BoardManager.detachNoteFromBoard(board, id);
    }
  });
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
  update: (id, text) => {},
  index: () => {
    let noteKeys = Object.keys(localStorage).filter((key) =>
      key.includes("note")
    );
    let notes = noteKeys.map((key) => JSON.parse(localStorage.getItem(key)));
    return notes;
  },
};

const BoardManager = {
  attachNoteOnBoard: (board, note) => {
    let noteToAttach =
      '<div class="card" data-id="' +
      note.id +
      '">' +
      note.text +
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
