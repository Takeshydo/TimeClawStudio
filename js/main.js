(function() {
    emailjs.init("Qiw6gZb5Wmcnz17qA"); //Changer par la clé de email.js
}) ();

document.addEventListener("DOMContentLoaded", () =>{
    const form = document.getElementById('cc-form');
    const statusmsg = document.getElementById('status_message');

    if (!form) return;

    form.addEventListener('submit', function(event){
        event.preventDefault();

        const serviceID = "service_3gt3lcc";
        const templateID = "template_twv1v9l";

        statusmsg.style.color = "green";
        statusmsg.innerText = "Envoie en cours.....";

        emailjs.sendForm(serviceID, templateID, this).then (()=>{
            statusmsg.style.color = "green";
            statusmsg.innerText = "Message envoyé avec succès";
            form.reset();
        })
            .catch((error)=>{
                statusmsg.style.color = "red";
                statusmsg.innerText = "Echec de l'envoi : " + JSON.stringify(error);
            });
    });

});