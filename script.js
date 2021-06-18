const today = new Date().toISOString().split("T")[0];
document.getElementsByName("setTodaysDate")[0].setAttribute("min", today); //DATA MINIMA = HOJE

const dropzones = document.querySelectorAll(".dropzone");

let funcionarios = [
  { funcionario: "Guilherme", atividades: 0 },
  { funcionario: "Ronaldo", atividades: 0 },
  { funcionario: "Francyelle", atividades: 0 },
  { funcionario: "Daniel", atividades: 0 },
  { funcionario: "Rafael", atividades: 0 },
  { funcionario: "Janaina", atividades: 0 },
  { funcionario: "Daniela", atividades: 0 },
];

const postTodos = async (data) => {
  try {
    const response = await fetch("http://localhost:3000/todos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.log("deu ruim");
  }
};

function putTodos(data) {
  fetch(`http://localhost:3000/todos/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.status !== 200) {
        throw new Error("erro na api");
      }
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
      // toast
    });
}

function deleteTodos(id, index) {
  fetch("http://localhost:3000/todos/" + id, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((res) => console.log(res));
}

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

function closeButton(id) {
  let index = Todo.todos.findIndex((x) => x.id === id);
  // console.log(index);
  // Todo.todos.splice(index, 1);
  deleteTodos(id, index);
  manipuladorInterface.removeCard(id);
  contadorTarefas();
}

const App = {
  init() {
    fetch("http://localhost:3000/todos/")
      .then((response) => response.json())
      .then((data) => {
        Todo.todos = data;
        Todo.todos.forEach((itemDoArray, index) => {
          manipuladorInterface.addCard(itemDoArray, index);
        });
        contadorTarefas();
      });
  },
};

const Todo = {
  add(task) {
    postTodos(task);
  },
};

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
      const data = newTask.getValues();
      data.status = 0;
      data.id = uuid.v4();
      Todo.add(data);
      manipuladorInterface.addCard(data);
      Modal.close();
      newTask.clearFields();
      contadorTarefas();
    } catch (error) {
      toastr.info("Erro");
    }
  },
};

function formatedDate(dt) {
  let data = new Date(dt);
  let dataFormatada = data.getDate() + 1 + "/" + 0 + (data.getMonth() + 1) + "/" + data.getFullYear();
  return dataFormatada;
}

function dragStart() {
  dropzones.forEach((dropzone) => dropzone.classList.add("highlight"));
  this.classList.add("is-dragging");
}

function dragEnd(params, asd) {
  dropzones.forEach((dropzone) => dropzone.classList.remove("highlight"));
  this.classList.remove("is-dragging");

  let cardID = params.target.id;
  let vaiPraOnde = params.currentTarget.parentElement.id;
  const findIndex = Todo.todos.findIndex((x) => x.id === cardID);

  if (vaiPraOnde === "feito") {
    Todo.todos[findIndex].status = 2;
  }

  if (vaiPraOnde === "andamento") {
    Todo.todos[findIndex].status = 1;
  }

  if (vaiPraOnde === "pendente") {
    Todo.todos[findIndex].status = 0;
  }
  putTodos(Todo.todos[findIndex]);
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

App.init();
