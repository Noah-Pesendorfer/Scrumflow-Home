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

// Authentifizierungsstatus beibehalten
onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in with UID:", user.uid);
      updateTotalTaskCount();
      updateTotalProjectCount();
      updateDaysSinceRegistration();
      loadCurrentProjects();
      loadCompletedProjects();
    } else {
      console.log("No user is signed in.");
    }
});

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

function loadCompletedProjects() {
    const user = auth.currentUser;
    if (user) {
        const projectsRef = collection(db, "users", user.uid, "projects");
        getDocs(projectsRef)
            .then(querySnapshot => {
                const ul = document.querySelector('.todo-list');
                ul.innerHTML = ''; // Clear existing content
                querySnapshot.forEach(doc => {
                    const project = doc.data();
                    if (project.status === 'completed') { // Nur abgeschlossene Projekte
                        const li = document.createElement('li');
                        li.className = 'completed';
                        li.innerHTML = `<p>${project.name} - ${doc.id}</p><i class='bx bx-dots-vertical-rounded'></i>`;
                        ul.appendChild(li);
                    }
                });
            })
            .catch(error => {
                console.error("Error loading completed projects: ", error);
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