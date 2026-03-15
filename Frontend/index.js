const form = document.getElementById("loginForm");
const errorBox = document.getElementById("error");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    errorBox.style.display = "none";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(!email || !password){
        errorBox.innerText = "กรุณากรอกอีเมลและรหัสผ่าน";
        errorBox.style.display = "block";
        return;
    }

    try{

        const response = await fetch("http://localhost:8000/login",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if(!response.ok){
            errorBox.innerText = data.message;
            errorBox.style.display = "block";
            return;
        }

        // login success
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "dashboard.html";

    }catch(error){

        errorBox.innerText = "ไม่สามารถเชื่อมต่อ Server";
        errorBox.style.display = "block";

    }

});