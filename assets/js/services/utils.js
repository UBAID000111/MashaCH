/* ===========================
FORMAT PRICE
=========================== */

export function formatPrice(price){

    return "₹" + Number(price).toLocaleString("en-IN");

}

/* ===========================
DISCOUNT %
=========================== */

export function getDiscount(oldPrice,price){

    if(!oldPrice || oldPrice<=price) return 0;

    return Math.round(
        ((oldPrice-price)/oldPrice)*100
    );

}

/* ===========================
SAVE AMOUNT
=========================== */

export function getSaving(oldPrice,price){

    return oldPrice-price;

}

/* ===========================
STOCK
=========================== */

export function stockText(stock){

    if(stock<=0) return "Out of Stock";

    if(stock<5) return `${stock} Left`;

    return `${stock} Available`;

}