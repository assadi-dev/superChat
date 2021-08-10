const socket = io.connect("http://localhost:5000");
const myModalEl = document.querySelector("#welcome-modal");
const loginModal = bootstrap.Modal.getOrCreateInstance(myModalEl);

const myToastEl = document.getElementById("myToastEl");
const myLeavToast = document.querySelector("myToastLeave");

const pseudo = document.querySelector("#pseudo");

/*myModal = new bootstrap.Modal(myModalEl, {
  keyboard: false,
});*/

socket.on("message", (message) => {
  addElement(message);
});

if (sessionStorage.getItem("pseudo")) {
  socket.emit("visiteur", sessionStorage.getItem("pseudo"));
} else {
  loginModal.show();
}

document.querySelector("#getPseudo").addEventListener("submit", (e) => {
  e.preventDefault();
  let pseudoValue = pseudo.value;
  if (pseudoValue === "" || pseudoValue === null || pseudoValue === undefined) {
    document.querySelector("#pseudo").classList.add("is-invalid");
    return false;
  }
  sessionStorage.setItem("pseudo", pseudoValue);
  socket.emit("visiteur", sessionStorage.getItem("pseudo"));
  loginModal.hide();
});

socket.on("annonce", (annonce) => {
  const myToast = bootstrap.Toast.getOrCreateInstance(myToastEl);
  let target = document.querySelector("#annoce-visitor");
  target.innerHTML = annonce + " ";
  target.classList.add("fw-bold");
  myToast.show();
});

document.querySelector("#sendMessage").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.querySelector("#messageContent").value;
  socket.emit("message", message);
  let data = { author: sessionStorage.getItem("pseudo"), message: message };
  addElement(data);
});

const showMessage = (list) => {
  list = [...new Set(list)];
  console.log(list);
  list.forEach((element) => {
    addElement(element);
  });
};

const addElement = (list) => {
  const parent = document.querySelector("#messageListContainer");
  const li = document.createElement("li");
  const div = document.createElement("div");
  const span = document.createElement("span");
  const p = document.createElement("p");

  if (list.author === sessionStorage.getItem("pseudo")) {
    div.classList.add("bg-primary", "ms-auto", "me-0");
  }
  div.classList.add("col-10", "rounded", "p-2", "my-2", "ms-1", "message-text");
  span.classList.add("fw-bold");
  span.innerHTML =
    list.author === sessionStorage.getItem("pseudo")
      ? `Moi: `
      : `${list.author}: `;

  p.appendChild(span);
  p.append(list.message);
  li.appendChild(div).appendChild(p);
  parent.appendChild(li);
};

//logout

document.querySelector("#logout-btn").addEventListener("click", (e) => {
  e.preventDefault();

  let pseudo = sessionStorage.getItem("pseudo");

  socket.emit("logout", pseudo);
  sessionStorage.removeItem("pseudo");
  loginModal.show();
});
