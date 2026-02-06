const nowServingDiv = document.getElementById("nowServing");
const waitingDiv = document.getElementById("waiting");
const completedDiv = document.getElementById("completed");
const absentDiv = document.getElementById("absent");

const completeBtn = document.getElementById("completeBtn");
const absentBtn = document.getElementById("absentBtn");

socket.on("queueUpdate",(data)=>{

  if(data.nowServing === "None"){
    nowServingDiv.innerText = "No users in queue";
  } else {
    nowServingDiv.innerText = data.nowServing;
  }


  // Clear lists
  waitingDiv.innerHTML="";
  completedDiv.innerHTML="";
  absentDiv.innerHTML="";

  // Fill lists
  data.waiting.forEach(u=>{
    waitingDiv.innerHTML += `<div>${u}</div>`;
  });

  data.completed.forEach(u=>{
    completedDiv.innerHTML += `<div>${u}</div>`;
  });

  data.absent.forEach(u=>{
    absentDiv.innerHTML += `<div>${u}</div>`;
  });

  // BUTTON CONTROL LOGIC

  if(data.nowServing === "None"){
    completeBtn.disabled = true;
    absentBtn.disabled = true;

    completeBtn.style.opacity = "0.5";
    absentBtn.style.opacity = "0.5";
  }
  else{
    completeBtn.disabled = false;
    absentBtn.disabled = false;

    completeBtn.style.opacity = "1";
    absentBtn.style.opacity = "1";
  }

});

function markCompleted(){

  if(completeBtn.disabled) return; 

  socket.emit("markCompleted");
}

function markAbsent(){

  if(absentBtn.disabled) return; 

  socket.emit("markAbsent");
}
