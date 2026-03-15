const form = document.getElementById("registerForm");
const errorBox = document.getElementById("error"); // ต้องตรงกับ HTML

form.addEventListener("submit", async function(e){

    e.preventDefault();

    errorBox.style.display = "none";

    const FirstName = document.getElementById("FirstName").value;
    const LastName = document.getElementById("LastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try{

        const response = await fetch("http://localhost:8000/users",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                FirstName,
                LastName,
                email,
                password
            })
        });

        const data = await response.json();

        if(!response.ok){
            errorBox.innerText = data.message;
            errorBox.style.display = "block";
            return;
        }

        alert("สมัครสมาชิกสำเร็จ");
        window.location.href="index.html";

    }catch(error){

        errorBox.innerText = "ไม่สามารถเชื่อมต่อ server";
        errorBox.style.display = "block";

    }

});