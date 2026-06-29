const latestSnap = await getDoc(ref);

const latestUser = latestSnap.data();

if (result.user.email === ADMIN_EMAIL) {

    window.location.href = "admin-dashboard.html";

}
else if (!latestUser.phone) {

    window.location.href = "complete-profile.html";

}
else {

    window.location.href = "profile.html";

}