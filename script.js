// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaDVQx_MkV3KoEPIrxhk7ckrbn7oYqscM",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// -------------------- TOAST --------------------
export function showToast(msg){
    const toast = document.getElementById("toast");
    if(!toast) return;
    toast.innerText = msg;
    toast.style.display = "block";
    setTimeout(()=>{ toast.style.display = "none"; }, 2500);
}

// -------------------- DASHBOARD / UPDATE RESOURCES --------------------
export function loadResources(){
    const bedsCard = document.getElementById("bedsCard");
    const icuCard = document.getElementById("icuCard");
    const ambulanceCard = document.getElementById("ambulanceCard");
    const oxygenCard = document.getElementById("oxygenCard");

    const bedsInput = document.getElementById("bedsInput");
    const icuInput = document.getElementById("icuInput");
    const ambulanceInput = document.getElementById("ambulanceInput");
    const oxygenInput = document.getElementById("oxygenInput");

    const resRef = ref(db, 'resources');
    onValue(resRef, snapshot=>{
        const data = snapshot.val() || {beds:0, icu:0, ambulance:0, oxygen:0};

        // Update Dashboard Cards
        if(bedsCard) bedsCard.innerText = data.beds;
        if(icuCard) icuCard.innerText = data.icu;
        if(ambulanceCard) ambulanceCard.innerText = data.ambulance;
        if(oxygenCard) oxygenCard.innerText = data.oxygen;

        // Pre-fill inputs if on Update page
        if(bedsInput) bedsInput.value = data.beds;
        if(icuInput) icuInput.value = data.icu;
        if(ambulanceInput) ambulanceInput.value = data.ambulance;
        if(oxygenInput) oxygenInput.value = data.oxygen;
    });
}

export function updateResources(){
    const beds = parseInt(document.getElementById("bedsInput").value) || 0;
    const icu = parseInt(document.getElementById("icuInput").value) || 0;
    const ambulance = parseInt(document.getElementById("ambulanceInput").value) || 0;
    const oxygen = parseInt(document.getElementById("oxygenInput").value) || 0;

    const resRef = ref(db, 'resources');
    set(resRef, {beds, icu, ambulance, oxygen})
    .then(()=> showToast("Resources updated successfully"))
    .catch(err=> showToast(err.message));
}

// -------------------- STAFF --------------------
export function loadStaff(){
    const staffTable = document.getElementById("staffTable");
    if(!staffTable) return;
    const staffRef = ref(db, 'staff');
    onValue(staffRef, snapshot=>{
        staffTable.innerHTML = "";
        snapshot.forEach(childSnap=>{
            const s = childSnap.val();
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${s.name}</td><td>${s.role}</td><td>${s.department}</td>`;
            staffTable.appendChild(tr);
        });
    });
}

export function addStaff(event){
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value.trim();
    const department = document.getElementById("department").value.trim();
    if(name && role && department){
        const staffRef = ref(db, 'staff');
        push(staffRef, {name, role, department});
        document.getElementById("staffForm").reset();
        showToast("Staff added successfully");
    }
}

// -------------------- PATIENTS --------------------
export function loadPatients(){
    const patientTable = document.getElementById("patientTable");
    if(!patientTable) return;
    const patRef = ref(db, 'patients');
    onValue(patRef, snapshot=>{
        patientTable.innerHTML = "";
        snapshot.forEach(childSnap=>{
            const p = childSnap.val();
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${p.name}</td><td>${p.age}</td><td>${p.bed}</td><td>${p.doctor}</td>`;
            patientTable.appendChild(tr);
        });
    });
}

export function addPatient(event){
    event.preventDefault();
    const name = document.getElementById("pname").value.trim();
    const age = document.getElementById("age").value.trim();
    const bed = document.getElementById("bed").value.trim();
    const doctor = document.getElementById("doctor").value.trim();
    if(name && age && bed && doctor){
        const patRef = ref(db, 'patients');
        push(patRef, {name, age, bed, doctor});
        document.getElementById("patientForm").reset();
        showToast("Patient added successfully");

        // Decrement available beds
        const bedsRef = ref(db, 'resources/beds');
        onValue(bedsRef, snapshot=>{
            let bedsAvailable = snapshot.val() || 0;
            update(ref(db, 'resources'), {beds: Math.max(0, bedsAvailable - 1)});
        }, {onlyOnce:true});
    }
}