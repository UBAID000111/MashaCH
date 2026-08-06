import { rtdb } from "../../firebase/firebase-config.js";

import {

ref,
set,
onDisconnect,
remove,
onValue

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const sessionId =

crypto.randomUUID();

const page =

window.location.pathname
.split("/")
.pop();

let device = "Desktop";

if(/Mobile/i.test(navigator.userAgent)){

device="Mobile";

}

if(/Tablet|iPad/i.test(navigator.userAgent)){

device="Tablet";

}

export async function startLiveSession(){

const sessionRef =

ref(

rtdb,

"liveUsers/"+sessionId

);

await set(sessionRef,{

page,

device,

startedAt:Date.now()

});

onDisconnect(sessionRef).remove();

}

export async function stopLiveSession(){

const sessionRef=

ref(

rtdb,

"liveUsers/"+sessionId

);

await remove(sessionRef);

}

export function watchLiveUsers(callback){

const liveRef=

ref(rtdb,"liveUsers");

onValue(liveRef,snap=>{

const data=snap.val()||{};

callback(data);

});

}