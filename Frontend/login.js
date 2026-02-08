function login(){
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    if(!email || !password){
        alert("Please enter email and password");
        return;
    }
    localStorage.setItem("loggedIn", "True");
    window.location.href="index.html";
}