import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDoc, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDZJTH0Znyi13etPM6Ag5M-lQ_WeqXOIsU",
    authDomain: "scrumflow-6e479.firebaseapp.com",
    projectId: "scrumflow-6e479",
    storageBucket: "scrumflow-6e479.appspot.com",
    messagingSenderId: "828323679259",
    appId: "1:828323679259:web:6db3cfbf89942cc3d4fcbe",
    measurementId: "G-2427QNHC73"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentProject = null;

// Authentifizierungsstatus beibehalten
onAuthStateChanged(auth, (user) => {
    console.log("Jetzt sama im onauthchanged");
    if (user) {
      console.log("User is signed in with UID:", user.uid);
      loadTasksIntoHTML();
    } else {
      console.log("No user is signed in.");
    }
});

// Funktion zum Laden der Tasks aus Firestore und Anzeigen im Dashboard
function loadTasksIntoHTML() {
    const user = auth.currentUser;
    if (user) {
      // Stellen Sie sicher, dass 'currentProject' irgendwo gesetzt wird, bevor diese Funktion aufgerufen wird.
      const tasksRef = collection(db, "users", user.uid, "projects", currentProject, "tasks");
      getDocs(tasksRef)
        .then(querySnapshot => {
          const tasks = [];
          querySnapshot.forEach(doc => {
            const taskData = doc.data();
            const task = {id: doc.id, ...taskData};
            tasks.push(task);
          });
          updateTasksDisplay(tasks); // Update UI with tasks
          updateTaskCount(tasks.length); // Update task count
        })
        .catch(error => {
          console.error("Error loading tasks: ", error);
        });
    } else {
      // Optional: Handler, wenn kein Benutzer angemeldet ist. Zum Beispiel Weiterleitung zur Login-Seite.
      console.log("No user signed in.");
    }
  }  

// Funktion zum Aktualisieren der Task-Anzahl im Dashboard
function updateTaskCount(count) {
    // Zugriff auf das Element, das die Anzahl der Tasks anzeigt, und Aktualisierung seines Inhalts
    document.getElementById('task-count').innerText = count;
}

// Funktion zum Aktualisieren der Task-Liste im UI
function updateTasksDisplay(tasks) {
    const todoList = document.querySelector('.todo-list');
    todoList.innerHTML = ''; // Clear existing tasks
    tasks.forEach(task => {
        const taskElement = document.createElement('li');
        taskElement.className = task.completed ? 'completed' : 'not-completed';
        taskElement.innerHTML = `<p>${task.title}</p><i class='bx bx-dots-vertical-rounded' ></i>`;
        todoList.appendChild(taskElement);
    });
}

// SIDE MENU

const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});

// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})

window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})

const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', function () {
	if(this.checked) {
		document.body.classList.add('dark');
	} else {
		document.body.classList.remove('dark');
	}
})