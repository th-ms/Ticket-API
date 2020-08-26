import { CountUp } from './countUp.min.js';

function getCookieCount(){
    var Http = new XMLHttpRequest();
    var url='https://th-mas-ticketapi.herokuapp.com/api/count';
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = (e) => {
    if(Http.readyState===4 && Http.status==200){
        var countUp = new CountUp('totalCookies', (JSON.parse(Http.responseText)['cookie_count']));
        countUp.start();
    }
    }
}

function loadClients(){
    var Http = new XMLHttpRequest();
    var url='https://th-mas-ticketapi.herokuapp.com/api/clients';
    Http.open("GET", url);
    Http.send();
    
    Http.onreadystatechange = (e) => {
    if(Http.readyState===4 && Http.status==200){
        var table = document.getElementById("clientTable")
        JSON.parse(Http.responseText)['clients'].forEach(i => {
            var row = table.insertRow(1)
            row.id = i['discord']
            var discord = row.insertCell(0);
            discord.innerHTML = i['discord'] + '<button class="btn btn-danger" type="button" style="height: 30px;margin-left:20px;padding-top: 3px;padding-bottom: 3px;" onclick="removeClient(\''+i['discord']+'\')">Remove</button>';
            var apikey = row.insertCell(1);
            apikey.innerHTML = i['api_key'];
            var email = row.insertCell(2);
            email.innerHTML = i['email'];
            var requests = row.insertCell(3);
            requests.innerHTML = i['requests'];
        });
    }
    }
}

getCookieCount()
loadClients()