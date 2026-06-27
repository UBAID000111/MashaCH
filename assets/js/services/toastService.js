let toast;

export function showToast(message,type="success"){

    if(toast){

        toast.remove();

    }

    toast=document.createElement("div");

    toast.className=`toast ${type}`;

    toast.innerText=message;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },20);

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>{

            toast.remove();

        },300);

    },2500);

}