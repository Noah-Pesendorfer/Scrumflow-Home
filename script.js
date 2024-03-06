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

//let currentProject = null;

// Authentifizierungsstatus beibehalten
onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in with UID:", user.uid);
      loadProjectsIntoHTML();
      updateTotalTaskCount();
      updateTotalProjectCount();
      updateDaysSinceRegistration();
      loadCurrentProjects();
    } else {
      console.log("No user is signed in.");
    }
});

// Funktion zum Laden der Projekte aus Firestore und Anzeigen im Dashboard
function loadProjectsIntoHTML() {
    const user = auth.currentUser;
    if (user) {
      // Referenz zur 'projects'-Sammlung für den aktuellen Benutzer
      const projectsRef = collection(db, "users", user.uid, "projects");
      getDocs(projectsRef)
        .then(querySnapshot => {
          const projects = [];
          querySnapshot.forEach(doc => {
            const projectData = doc.data();
            const project = {id: doc.id, ...projectData};
            projects.push(project);
          });
          updateProjectsDisplay(projects); // Update UI with projects
          updateProjectCount(projects.length); // Update project count
        })
        .catch(error => {
          console.error("Error loading projects: ", error);
        });
    } else {
      console.log("No user signed in.");
    }
}

// Funktion zum Aktualisieren der Projektanzahl im Dashboard
function updateProjectCount(count) {
    // Zugriff auf das Element, das die Anzahl der Projekte anzeigt, und Aktualisierung seines Inhalts
    document.getElementById('project-count').innerText = count; // Stelle sicher, dass ein Element mit der ID 'project-count' im HTML existiert
}

// Funktion zum Aktualisieren der Projekte-Liste im UI
function updateProjectsDisplay(projects) {
    const projectList = document.querySelector('.project-list'); // Stelle sicher, dass ein Container mit der Klasse 'project-list' im HTML existiert
    projectList.innerHTML = ''; // Clear existing projects
    projects.forEach(project => {
        const projectElement = document.createElement('li');
        projectElement.innerHTML = `<p>${project.name}</p><i class='bx bx-dots-vertical-rounded' ></i>`; // 'name' sollte durch ein tatsächliches Attribut des Projektobjekts ersetzt werden, das den Namen oder Titel des Projekts enthält
        projectList.appendChild(projectElement);
    });
}

// Funktion zum Aktualisieren der Gesamtanzahl der Tasks
function updateTotalTaskCount() {
    const user = auth.currentUser;
    if (user) {
        const projectsRef = collection(db, "users", user.uid, "projects");
        getDocs(projectsRef)
            .then(async querySnapshot => {
                let totalTaskCount = 0;
                for (let doc of querySnapshot.docs) {
                    const project = doc.id;
                    const tasksRef = collection(db, "users", user.uid, "projects", project, "tasks");
                    const tasksSnapshot = await getDocs(tasksRef);
                    totalTaskCount += tasksSnapshot.docs.length;
                }
                // Aktualisiere die Anzahl der Tasks im Dashboard
                document.getElementById('task-count').innerText = totalTaskCount;
            })
            .catch(error => {
                console.error("Error loading tasks: ", error);
            });
    } else {
        console.log("No user signed in.");
    }
}

// Funktion zum Aktualisieren der Gesamtanzahl der Projekte
function updateTotalProjectCount() {
    const user = auth.currentUser;
    if (user) {
        const projectsRef = collection(db, "users", user.uid, "projects");
        getDocs(projectsRef)
            .then(querySnapshot => {
                // Die Anzahl der Dokumente in der Abfrage entspricht der Anzahl der Projekte
                const projectCount = querySnapshot.docs.length;
                // Aktualisiere die Anzahl der Projekte im Dashboard
                document.getElementById('project-count').innerText = projectCount;
            })
            .catch(error => {
                console.error("Error loading projects: ", error);
            });
    } else {
        console.log("No user signed in.");
    }
}

function updateDaysSinceRegistration() {
    const user = auth.currentUser;
    if (user) {
        // Annahme: Das Registrierungsdatum ist im Benutzerprofil unter 'registrationDate' gespeichert
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef)
            .then(docSnapshot => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    const registrationDate = userData.registrationDate.toDate(); // Konvertiere Firestore Timestamp zu JavaScript Date
                    const currentDate = new Date();
                    const daysSinceRegistration = Math.floor((currentDate - registrationDate) / (1000 * 60 * 60 * 24));
                    
                    document.getElementById('days-since-registration').innerText = daysSinceRegistration;
                } else {
                    console.log("No user data found.");
                }
            })
            .catch(error => {
                console.error("Error getting user data: ", error);
            });
    } else {
        console.log("No user signed in.");
    }
}

function loadCurrentProjects() {
    const user = auth.currentUser;
    if (user) {
        const projectsRef = collection(db, "users", user.uid, "projects");
        getDocs(projectsRef)
            .then(querySnapshot => {
                const tbody = document.getElementById('current-projects-list');
                tbody.innerHTML = ''; // Clear existing content
                querySnapshot.forEach(doc => {
                    const project = doc.data();
                    if (project.status !== 'completed') { // Filter nicht abgeschlossene Projekte
                        const row = `<tr>
                                        <td><p>${project.title}</p></td>
                                        <td>${doc.id}</td> 
                                        <td><span class="status ${project.status}">${project.status}</span></td>
                                     </tr>`;
                        tbody.innerHTML += row;
                    }
                });
            })
            .catch(error => {
                console.error("Error loading current projects: ", error);
            });
    } else {
        console.log("No user signed in.");
    }
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

const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', function () {
	if(this.checked) {
		document.body.classList.add('dark');
	} else {
		document.body.classList.remove('dark');
	}
})