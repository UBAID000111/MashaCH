import { faqData } from "./faqData.js";

/*==================================
DOM
==================================*/

const helpBtn=document.getElementById("helpBotBtn");

const helpWindow=document.getElementById("helpBotWindow");

const overlay=document.getElementById("helpBotOverlay");

const closeBtn=document.getElementById("closeHelpBot");

const chat=document.getElementById("chatMessages");

const input=document.getElementById("helpInput");

const sendBtn=document.getElementById("sendHelp");

const typing=document.getElementById("typingBox");

const quickButtons=document.querySelectorAll(".quick-chip");

const quickToggle=document.getElementById("quickToggle");

const quickDropdown=document.getElementById("quickDropdown");

quickToggle.onclick=()=>{

quickDropdown.classList.toggle("show");

};

/*==================================
OPEN
==================================*/

helpBtn.onclick=()=>{

overlay.classList.add("show");

helpWindow.classList.add("show");

input.focus();

};

/*==================================
CLOSE
==================================*/

function closeBot(){

overlay.classList.remove("show");

helpWindow.classList.remove("show");

}

closeBtn.onclick=closeBot;

overlay.onclick=closeBot;

/*==================================
SCROLL
==================================*/

function scrollBottom(){

chat.scrollTop=chat.scrollHeight;

}

/*==================================
USER MESSAGE
==================================*/

function addUserMessage(text){

chat.innerHTML+=`

<div class="user-message">

<div class="message">

${text}

</div>

</div>

`;

scrollBottom();

}

/*==================================
BOT MESSAGE
==================================*/

function addBotMessage(text){

chat.innerHTML+=`

<div class="bot-message">

<div class="bot-avatar">

M

</div>

<div class="message bot-text">

${text}

</div>

</div>

`;

scrollBottom();

}

/*==================================
THINKING
==================================*/

function showThinking(){

typing.style.display="flex";

scrollBottom();

}

function hideThinking(){

typing.style.display="none";

}

/*==================================
SEARCH FAQ
==================================*/

function searchAnswer(question){

question=question.toLowerCase();

for(const faq of faqData){

const found=faq.keywords.some(keyword=>

question.includes(keyword.toLowerCase())

);

if(found){

return faq;

}

}

return null;

}

/*==================================
SEND
==================================*/

function submitQuestion(){

const question=input.value.trim();

if(question==="") return;

input.value="";

addUserMessage(question);

showThinking();

setTimeout(()=>{

hideThinking();

const result=searchAnswer(question);

if(result){

typeAnswer(result.answer);

}else{

showWhatsapp(question);

}

},2500);

}

/*==================================
BUTTON
==================================*/

sendBtn.onclick=submitQuestion;

/*==================================
ENTER
==================================*/

input.addEventListener("keypress",e=>{

if(e.key==="Enter"){

submitQuestion();

}

});

/*==================================
QUICK CHIPS
==================================*/

quickButtons.forEach(button=>{

button.onclick=()=>{

quickDropdown.classList.remove("show");

input.value=button.innerText;

submitQuestion();

};

});

/*==================================
TYPEWRITER
==================================*/

function typeAnswer(text){

const wrapper=document.createElement("div");

wrapper.className="bot-message";

wrapper.innerHTML=`

<div class="bot-avatar">

M

</div>

<div class="message">

<div class="typing-answer"></div>

</div>

`;

chat.appendChild(wrapper);

scrollBottom();

const box=wrapper.querySelector(".typing-answer");

let i=0;

const speed=18;

function typing(){

if(i<text.length){

box.innerHTML+=text.charAt(i);

i++;

scrollBottom();

setTimeout(typing,speed);

}else{

appendHelpful(wrapper);

saveChat();

}

}

typing();

}

/*==================================
HELPFUL BUTTONS
==================================*/

function appendHelpful(message){

const div=document.createElement("div");

div.className="help-actions";

div.innerHTML=`

<button class="help-yes">

👍 Helpful

</button>

<button class="help-no">

Need More Help?

</button>

`;

message.querySelector(".message")

.appendChild(div);

div.querySelector(".help-yes")

.onclick=()=>{

div.innerHTML=`

<span class="thanks-msg">

❤️ Happy to help!

</span>

`;

};

div.querySelector(".help-no")

.onclick=()=>{

const lastUser=

document.querySelectorAll(".user-message");

let text="";

if(lastUser.length){

text=

lastUser[lastUser.length-1]

.innerText;

}

showWhatsapp(text);

};

}

/*==================================
WHATSAPP
==================================*/

function showWhatsapp(question){

const wrapper=document.createElement("div");

wrapper.className="bot-message";

wrapper.innerHTML=`

<div class="bot-avatar">

M

</div>

<div class="message">

<p>

I couldn't find the perfect answer.

</p>

<p>

Our Support Team will assist you personally.

</p>

<br>

<button class="wa-btn">

Continue on WhatsApp

</button>

</div>

`;

chat.appendChild(wrapper);

scrollBottom();

wrapper.querySelector(".wa-btn")

.onclick=()=>{

const msg=

`Hello MASHA Team,

I need help regarding:

${question}

Thank you.`;

window.open(

`https://wa.me/917827407735?text=${encodeURIComponent(msg)}`,

"_blank"

);

};

saveChat();

}

/*==================================
SAVE CHAT
==================================*/

function saveChat(){

localStorage.setItem(

"masha_help_chat",

chat.innerHTML

);

}

/*==================================
LOAD CHAT
==================================*/

function loadChat(){

const old=

localStorage.getItem(

"masha_help_chat"

);

if(old){

chat.innerHTML=old;

reBindButtons();

}

}

/*==================================
REBIND BUTTONS
==================================*/

function reBindButtons(){

document.querySelectorAll(".wa-btn")

.forEach(btn=>{

btn.onclick=()=>{

window.open(

"https://wa.me/917827407735",

"_blank"

);

};

});

}

/*==================================
CLEAR CHAT
==================================*/

function clearConversation(){

localStorage.removeItem(

"masha_help_chat"

);

chat.innerHTML=`

<div class="bot-message">

<div class="bot-avatar">

M

</div>

<div class="message">

<h4>

👋 Welcome Back

</h4>

<p>

How may I help you today?

</p>

</div>

</div>

`;

}

/*==================================
WELCOME ANIMATION
==================================*/

window.addEventListener(

"load",

()=>{

loadChat();

setTimeout(()=>{

helpBtn.classList.add("pulse");

},2500);

}

);

/*==================================
ESC CLOSE
==================================*/

document.addEventListener(

"keydown",

e=>{

if(

e.key==="Escape"

){

closeBot();

}

}

);

/*==================================
CLICK OUTSIDE
==================================*/

document.addEventListener(

"click",

e=>{

if(

helpWindow.classList.contains("show")

&&

!helpWindow.contains(e.target)

&&

!helpBtn.contains(e.target)

){

closeBot();

}

}

);