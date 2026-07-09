const popup = document.getElementById("anthemPopup");
const audio = document.getElementById("anthemAudio");
const closeBtn = document.getElementById("closeAnthem");
const playBtn = document.getElementById("playAnthem");

/* ===========================
OPEN POPUP
=========================== */

function openAnthem(){

    if(!popup || !audio) return;

    popup.classList.add("show");

    audio.currentTime = 0;

    audio.play().catch(err=>{
        console.log("Autoplay blocked:", err);
    });

}

/* ===========================
CLOSE POPUP
=========================== */

function closeAnthem(){

    if(!popup || !audio) return;

    audio.pause();

    audio.currentTime = 0;

    popup.classList.remove("show");

}

/* ===========================
ABOUT PAGE BUTTON
=========================== */

if(playBtn){

    playBtn.addEventListener("click",openAnthem);

}

/* ===========================
AFTER PAYMENT
=========================== */

const params = new URLSearchParams(window.location.search);

window.addEventListener("load",()=>{

    const params = new URLSearchParams(window.location.search);

    if(params.get("anthem")==="1"){

        console.log("Anthem Triggered");

        openAnthem();

    }

});

/* ===========================
CLOSE BUTTON
=========================== */

if(closeBtn){

    closeBtn.addEventListener("click",closeAnthem);

}

/* ===========================
AUTO CLOSE
=========================== */

if(audio){

    audio.addEventListener("ended",closeAnthem);

}