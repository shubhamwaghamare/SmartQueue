function loginAdmin(){

  socket.emit("adminLogin",{
    username: adminUser.value,
    password: adminPass.value
  });
}

socket.on("adminAuth",(ok)=>{
  if(ok){
    window.location="admin.html";
  } else {
    alert("Invalid admin credentials");
  }
});
