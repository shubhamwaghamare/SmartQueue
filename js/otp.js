function clearErrors(){
  document.querySelectorAll(".error").forEach(e=>{
    e.style.display="none";
  });

  document.querySelectorAll(".input-box").forEach(i=>{
    i.classList.remove("error-input");
  });
}

function showError(input,id,msg){
  const err = document.getElementById(id);
  err.innerText = msg;
  err.style.display="block";
  input.classList.add("error-input");
}

/* SEND OTP */

function sendOTP(){

  clearErrors();

  const mobile = document.getElementById("mobile").value.trim();

  if(mobile===""){
    showError(document.getElementById("mobile"),"mobileError","Enter mobile number");
    return;
  }

  if(!/^[0-9]{10}$/.test(mobile)){
    showError(document.getElementById("mobile"),"mobileError","Enter valid 10 digit number");
    return;
  }

  socket.emit("sendOTP", mobile);
}

/* VERIFY OTP */

function verifyOTP(){

  clearErrors();

  const otp = document.getElementById("otp").value;
  const mobile = document.getElementById("mobile").value;

  if(otp===""){
    showError(document.getElementById("otp"),"otpError","Enter OTP");
    return;
  }

  socket.emit("verifyOTP",{
    mobile: mobile,
    otp: otp
  });
}


/* JOIN QUEUE */

function joinQueue(){

  clearErrors();

  const name = document.getElementById("name").value.trim();

  if(name===""){
    showError(document.getElementById("name"),"nameError","Enter name");
    return;
  }

  socket.emit("addUser", name);
  window.location="userStatus.html";
}

/* BACKEND RESPONSE HANDLERS */

socket.on("otpSent",()=>{
  showBox("otpBox");   // go to OTP screen
});

socket.on("otpVerified",(status)=>{

  if(status){
    showBox("nameBox");   // correct OTP
  }else{
    showError(document.getElementById("otp"),"otpError","Wrong OTP");
  }

});


socket.on("otpInvalid",()=>{
  showError(document.getElementById("otp"),"otpError","Wrong OTP");
});
