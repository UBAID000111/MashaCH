const btn = document.getElementById("sendBtn");

btn.onclick = () => {

const name =
document.getElementById("name").value.trim();

const phone =
document.getElementById("phone").value.trim();

const message =
document.getElementById("message").value.trim();

if(!name || !phone || !message){

alert("Please fill all fields.");

return;

}

const text =

`*Masha Wear Contact Request*%0A%0A`+

`👤 Name: ${name}%0A`+

`📞 Phone: ${phone}%0A%0A`+

`📝 Issue:%0A${message}`;

window.open(

`https://wa.me/917827407735?text=${text}`,

"_blank"

);

};