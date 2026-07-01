export function optimizeImage(url,width=500){

    if(!url || !url.includes("/upload/")){
        return url;
    }

    return url.replace(
        "/upload/",
        `/upload/f_auto,q_auto,dpr_auto,w_${width},c_limit/`
    );

}