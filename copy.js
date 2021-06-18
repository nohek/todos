const dropzones = document.querySelectorAll(".dropzone");
let addTask;

const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};
// function openClose() {
//   document.querySelector(".modal-overlay").classList.toggle("active");
// }

// const Modal = {
//   openClose() {
//     document.querySelector(".modal-overlay").classList.toggle("active");
//   },
// };

const manipuladorInterface = {
  boardPendente: document.getElementById("pendente"),
  boardAndamento: document.getElementById("andamento"),
  boardFeito: document.getElementById("feito"),

  addCard(dados) {
    const card = document.createElement("div");

    let dataDaTask = formatedDate(dados.date);

    card.innerHTML = `
          <div id=${dados.id} class='card' draggable="true">
            <div class='ohno'>
                <div>${dados.responsible} - ${dataDaTask} </div>
                <div>${dados.title}</div>
                <div>${dados.description}</div>
            </div>
            <button type="button" class="buttonClose" onclick="closeButton('${dados.id}')"> <i class="fas fa-times"></i> </button>
          </div>
        `;

    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);

    if (dados.status === 0) {
      manipuladorInterface.boardPendente.appendChild(card);
    } else if (dados.status === 1) {
      manipuladorInterface.boardAndamento.appendChild(card);
    } else if (dados.status === 2) {
      manipuladorInterface.boardFeito.appendChild(card);
    }
  },

  removeCard(id) {
    const div = document.getElementById(`${id}`);
    div.remove();
  },
};

let funcionarios = [
  { funcionario: "Guilherme", atividades: 0 },
  { funcionario: "Ronaldo", atividades: 0 },
  { funcionario: "Francyelle", atividades: 0 },
  { funcionario: "Daniel", atividades: 0 },
  { funcionario: "Rafael", atividades: 0 },
  { funcionario: "Janaina", atividades: 0 },
  { funcionario: "Daniela", atividades: 0 },
];

function contadorTarefas() {
  funcionarios.forEach((item) => {
    item.atividades = 0;
  });

  Todo.todos.forEach((item) => {
    let indexFuncionario = funcionarios.findIndex((i) => i.funcionario === `${item.responsible}`);

    if (item.status !== 2) {
      funcionarios[`${indexFuncionario}`].atividades += 1;
    }
  });

  document.getElementById("tarefas").innerHTML = "";
  funcionarios.forEach((item) => {
    li = document.createElement("li");
    li.innerHTML = item.funcionario + " - " + item.atividades;
    document.getElementById("tarefas").append(li);
  });
}

function closeButton(id) {
  let index = Todo.todos.findIndex((x) => x.id === id);
  Todo.todos.splice(index, 1);
  manipuladorInterface.removeCard(id);
  Storage.set(Todo.todos);
  contadorTarefas();
}

const Storage = {
  // get() {
  //   return JSON.parse(localStorage.getItem("LSTasks")) || [];
  // },
  set(newTask) {
    localStorage.setItem("LSTasks", JSON.stringify(newTask));
  },

  clear() {
    localStorage.removeItem("LSTasks");
  },
};

// const Todo = {
//   todos: Storage.get(),

//   add(task) {
//     Todo.todos.push(task);
//     Storage.set(Todo.todos);
//   },
// };

const Todo = {
  todos: [],

  add(task) {
    Todo.todos.push(task);
    Storage.set(Todo.todos);
  },
};

const App = {
  init() {
    fetch("http://localhost:3000/todos/")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        Todo.todos = data;
        Todo.todos.forEach((itemDoArray, index) => {
          manipuladorInterface.addCard(itemDoArray, index);
        });
        contadorTarefas();
      });
  },

  reload() {
    App.init();
  },
};
App.init();

const newTask = {
  responsible: document.querySelector("select#responsible"),
  title: document.querySelector("input#title"),
  date: document.querySelector("input#date"),
  description: document.querySelector("input#description"),

  getValues() {
    return {
      responsible: newTask.responsible.value,
      date: newTask.date.value,
      title: newTask.title.value,
      description: newTask.description.value,
    };
  },

  validateFields(event) {
    if (responsible.value === "" || date.value === "" || title.value === "") {
      toastr.info("Por favor, preencha todos os dados obrigatórios!");
      event.preventDefault();
    }
  },

  clearFields() {
    responsible.value = "";
    date.value = "";
    title.value = "";
    description.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      newTask.validateFields();
      const dados = newTask.getValues();
      dados.status = 0;
      dados.id = uuid.v4();
      Todo.add(dados);
      manipuladorInterface.addCard(dados);
      Modal.close();
      newTask.clearFields();
      contadorTarefas();
    } catch (error) {
      toastr.info("Erro");
    }
  },
};

const today = new Date().toISOString().split("T")[0];
document.getElementsByName("setTodaysDate")[0].setAttribute("min", today); //DATA MINIMA = HOJE

function formatedDate(dt) {
  let data = new Date(dt);
  let dataFormatada = data.getDate() + 1 + "/" + 0 + (data.getMonth() + 1) + "/" + data.getFullYear();
  return dataFormatada;
}

function dragStart() {
  dropzones.forEach((dropzone) => dropzone.classList.add("highlight"));
  this.classList.add("is-dragging");
}

function dragEnd(params) {
  dropzones.forEach((dropzone) => dropzone.classList.remove("highlight"));
  this.classList.remove("is-dragging");

  let cardID = params.target.id;
  let vaiPraOnde = params.currentTarget.parentElement.id;

  if (vaiPraOnde === "feito") {
    const findIndex = Todo.todos.findIndex((x) => x.id === cardID);
    Todo.todos[findIndex].status = 2;
    Storage.clear();
    Storage.set(Todo.todos);
  }

  if (vaiPraOnde === "andamento") {
    const findIndex = Todo.todos.findIndex((x) => x.id === cardID);
    Todo.todos[findIndex].status = 1;
    Storage.clear();
    Storage.set(Todo.todos);
  }

  if (vaiPraOnde === "pendente") {
    const findIndex = Todo.todos.findIndex((x) => x.id === cardID);
    Todo.todos[findIndex].status = 0;
    Storage.clear();
    Storage.set(Todo.todos);
  }

  contadorTarefas();
}

dropzones.forEach((dropzone) => /*place where i will drop the cards */ {
  dropzone.addEventListener("dragover", dragOver);
  dropzone.addEventListener("dragleave", dragLeave);
});

function dragOver() {
  this.classList.add("over");
  const cardBeingDragged = document.querySelector(".is-dragging");
  this.appendChild(cardBeingDragged);
}

function dragLeave() {
  this.classList.remove("over");
}
