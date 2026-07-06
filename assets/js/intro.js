const intro = document.getElementById("introScreen");

const percent = document.getElementById("loadingPercent");

const message = document.getElementById("loadingMessage");

const logo = document.getElementById("mashaLogo");

const ring = document.getElementById("ringProgress");

const messages = [

"Crafting Luxury...",

"Preparing Collection...",

"Loading Premium Fashion...",

"Almost Ready..."

];

const radius = 135;

const circumference = 2 * Math.PI * radius;

ring.style.strokeDasharray = circumference;
ring.style.strokeDashoffset = circumference;

let progress = 0;

function updateLoader() {

    progress++;

    percent.textContent = progress + "%";

    ring.style.strokeDashoffset =
        circumference - (progress / 100) * circumference;

    if (progress < 25)
        message.textContent = messages[0];

    else if (progress < 50)
        message.textContent = messages[1];

    else if (progress < 80)
        message.textContent = messages[2];

    else
        message.textContent = messages[3];

    logo.style.transform =
        `scale(${1 + progress * 0.002})`;

    if (progress >= 100) {

        clearInterval(loader);

        gsap.to(intro, {

            opacity:0,

            duration:1,

            delay:0.5,

            onComplete(){

                intro.remove();

            }

        });

    }

}

const loader = setInterval(updateLoader,25);