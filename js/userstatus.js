const user = localStorage.getItem("user");
let lastServing = null;


socket.on("queueUpdate",(data)=>{

  // ===== NOW SERVING =====

  nowServing.innerText = data.nowServing;

  if(data.nowServing !== "None" && data.nowServing !== lastServing){
    startServiceTimer();
  }

  if(data.nowServing === "None"){
    stopServiceTimer();
  }

  lastServing = data.nowServing;


  // ===== WAITING LIST (FIXED) =====

  const queueDiv = document.getElementById("queue");

  // CLEAR OLD LIST EVERY UPDATE
  queueDiv.innerHTML = "";

  if(data.waiting.length === 0){
    queueDiv.innerHTML = `<div class="empty">No users waiting</div>`;
    return;
  }

  data.waiting.forEach((user, index)=>{

    const estimated = (index + 1) * 10; // 10 min per user (you can change)

    queueDiv.innerHTML += `
      <div class="queue-row">
        <div class="queue-left">${index+1} ) ${user}</div>
        <div class="queue-time">Estimated: ${estimated} min</div>
      </div>
    `;

  });

});
