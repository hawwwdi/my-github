// add event listener for enter button.
window.addEventListener("keypress", function(event) {
    if (event.key === 'Enter') {
        get_user_data()
    }
})

// The function for saving data as cookies.
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));

    let expires = "expires="+ d.toUTCString();

    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    document.getElementById("response").innerHTML = "";
}

// The function for reading data from cookies.
function getCookie(cname) {
    let name = cname + "=";

    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

// The function for saving data in local storage.
function save_to_local(username, data){
    localStorage.setItem(username, data);
}

function read_from_local(username){
    // The function for reading data from local storage.
    return localStorage.getItem(username);
}

// function to call for the user from either local_storage/cookies or github api.
async function get_user_data(){
    let username = document.getElementById("username").value

    if (document.getElementById("check_local").checked) {
        if (localStorage.getItem(username) == null) {
            let response = await fetch(`https://api.github.com/users/${username}`);
            var data = await response.json();
            let jsonObject = JSON.stringify(data);

            save_to_local(username, jsonObject);

            document.getElementById("response").innerHTML = "";
        } else {
            let jsonObject = read_from_local(username);
            var data = JSON.parse(jsonObject);

            document.getElementById("response").innerHTML = "Data Loaded from Local Storage";
        }
    } else {
        if (getCookie(username) == "") {
            let response = await fetch(`https://api.github.com/users/${username}`);
            var data = await response.json();
            let jsonObject = JSON.stringify(data);
    
            setCookie(username, jsonObject, 1);

            document.getElementById("response").innerHTML = "";
        } else {
            let jsonObject = getCookie(username);
            var data = JSON.parse(jsonObject);

            document.getElementById("response").innerHTML = "Data Loaded from Cookies";
        }
    }

    if (data.response) {
        document.getElementById("left-holder").style.opacity = 0.35;
        document.getElementById("response").innerHTML = "User Not Found";
    } else {
        if (document.getElementById("response").innerHTML == "User Not Found"){
            document.getElementById("response").innerHTML = "";
        }

        document.getElementById("left-holder").style.opacity = 1;

        if (data.avatar_url) {document.getElementById("avatar-img").src = data.avatar_url ;}
        if (data.name) {document.getElementById("account-name").innerHTML = data.name} else {document.getElementById("account-name").innerHTML = "unknown"}
        if (data.bio) {document.getElementById("bio").innerHTML = data.bio;} else {document.getElementById("bio").innerHTML = "No Bio"}
        if (data.blog) {document.getElementById("blog").innerHTML = data.blog.replace('https://','www.');} else {document.getElementById("blog").innerHTML = "No Blog"}

        if (data.location) {document.getElementById("loc").innerHTML = data.location} else {document.getElementById("loc").innerHTML = "location not specified"}
        if (data.followers) {document.getElementById("followers").innerHTML = data.followers} else {document.getElementById("followers").innerHTML = "unknown"}
        if (data.following) {document.getElementById("following").innerHTML = data.following} else {document.getElementById("following").innerHTML = "unknown"}
    }

    if (data.repos_url) {
        let langs = [];

        fetch(data.repos_url)
            .then((response) => response.json())
            .then((repos) => {
                for (let index = 0;  index < Math.min(5, repos.length); index++){
                    let repo = repos[index];
                    if (repo.language) {
                        langs.push(repo.language);
                    }
                }

                let fave_langa = {};

                langs.forEach(function(i) { fave_langa[i] = (fave_langa[i]||0) + 1;});

                let max = 0;
                let fav_lang = null;

                for (let lang in fave_langa) {
                    if (fave_langa[lang] > max) {
                        max = fave_langa[lang];
                        fav_lang = lang;
                    }
                }

                if (fav_lang) {
                    document.getElementById("fav_lang").innerHTML = fav_lang;
                } else {
                    document.getElementById("fav_lang").innerHTML = 'Not Specified';
                }
            });
    }
}