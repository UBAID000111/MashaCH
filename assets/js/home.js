import {
loadCategories,
loadNewArrival,
loadBestSeller,
loadAllProducts
} from "./services/homeService.js";




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

