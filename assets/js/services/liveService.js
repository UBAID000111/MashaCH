import { rtdb } from "../../firebase/firebase-config.js";

import {
  ref,
  set,
  update,
  onDisconnect,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";


const sessionId = crypto.randomUUID();

const page =
  window.location.pathname.split("/").pop();


let device = "Desktop";

if (/Tablet|iPad/i.test(navigator.userAgent)) {

  device = "Tablet";

}

else if (/Mobile/i.test(navigator.userAgent)) {

  device = "Mobile";

}


const sessionRef =
  ref(rtdb, "liveUsers/" + sessionId);


export async function startLiveSession() {

  const now = Date.now();

  await set(sessionRef, {

    page,

    device,

    startedAt: now,

    lastSeen: now

  });


  onDisconnect(sessionRef).remove();


  setInterval(async () => {

    try {

      await update(sessionRef, {

        lastSeen: Date.now()

      });

    }

    catch (error) {

      console.log(
        "Live heartbeat failed:",
        error
      );

    }

  }, 20000);

}


export async function stopLiveSession() {

  try {

    await remove(sessionRef);

  }

  catch (error) {

    console.log(
      "Stop live session error:",
      error
    );

  }

}


export function watchLiveUsers(callback) {

  const liveRef =
    ref(rtdb, "liveUsers");


  onValue(liveRef, snap => {

    const data =
      snap.val() || {};

    const now =
      Date.now();


    const activeUsers =
      Object.fromEntries(

        Object.entries(data)

          .filter(([id, user]) => {

            return (

              user.lastSeen &&

              now - user.lastSeen < 60000

            );

          })

      );


    callback(activeUsers);

  });

}