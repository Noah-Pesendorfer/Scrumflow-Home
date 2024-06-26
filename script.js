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
                    if (project.status !== 'Completed') { // Filter nicht abgeschlossene Projekte
                        const row = `<tr>
                                        <td><p>${project.title}</p></td>
                                        <td>${doc.id}</td> 
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
                    if (project.status === 'Completed') { // Nur abgeschlossene Projekte
                        const li = document.createElement('li');
                        li.className = 'completed';
                        li.innerHTML = `<p>${project.title} - ${doc.id}</p><i class='bx bx-dots-vertical-rounded'></i>`;
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

async function downloadDashboardAsPDF() {
    const element = document.querySelector('main'); // Wähle das main Element für die PDF-Erstellung
    const canvas = await html2canvas(element, {
        scale: 1, // Scale anpassen, um die Qualität zu verbessern, falls nötig
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight + 300
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Erstelle ein jsPDF-Dokument im passenden Format
    const pdf = new window.jspdf.jsPDF({
        orientation: 'landscape', // Wenn die Breite größer als die Höhe ist
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    
    console.log(pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('dashboard.pdf');
    
}

// Füge einen Event Listener zum Download-Button hinzu
document.querySelector('.btn-download').addEventListener('click', (e) => {
    console.log("addEventListener wird aufgerufen");
    e.preventDefault(); // Verhindere das Standardverhalten des Links
    downloadDashboardAsPDF();
});

//Navbar

const body = document.querySelector('body'),
      sidebar = body.querySelector('nav'),
      toggle = body.querySelector(".toggle"),
      modeSwitch = body.querySelector(".toggle-switch"),
      modeText = body.querySelector(".mode-text");


toggle.addEventListener("click" , () =>{
    sidebar.classList.toggle("close");
})

modeSwitch.addEventListener("click" , () =>{
    body.classList.toggle("dark");
    
    if(body.classList.contains("dark")){
        modeText.innerText = "Light mode";
    }else{
        modeText.innerText = "Dark mode";
        
    }
});