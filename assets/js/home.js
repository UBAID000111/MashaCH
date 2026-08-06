import {
loadCategories,
loadNewArrival,
loadBestSeller,
loadAllProducts
} from "./services/homeService.js";

import {
startSession,
endSession
} from "./services/analyticsService.js";

import {

startLiveSession

} from "./services/liveService.js";

startLiveSession();

startSession();

window.addEventListener("beforeunload",()=>{

    endSession();

});

import {
trackVisitor,
trackDevice
} from "./services/analyticsService.js";

trackVisitor();
trackDevice();




async function initHome(){

    await loadCategories();
    await loadNewArrival();
    await loadBestSeller();
    await loadAllProducts();

    if(window.location.hash === "#bestSellerSection"){

        setTimeout(() => {

            document.getElementById("bestSellerSection")
                ?.scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                });

        },1200); // wait until products are rendered

    }

}

initHome();

