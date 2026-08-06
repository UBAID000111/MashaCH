import {

watchLiveUsers

} from "../services/liveService.js";

export function loadLiveAnalytics(){

watchLiveUsers(users=>{

const list=

Object.values(users);

document.getElementById(

"onlineVisitors"

).textContent=list.length;

document.getElementById(

"activeSessions"

).textContent=list.length;

const viewing=

list.filter(

u=>u.page=="product.html"

).length;

document.getElementById(

"currentViews"

).textContent=viewing;

});

}