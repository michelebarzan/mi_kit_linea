var numbers_utenti=[];
var focused;
var focused2;
var utenti=[];
var linee;
var stazioni;

window.addEventListener("load", async function(event)
{
    linee=await getAnagraficaLinee();
    stazioni=await getAnagraficaStazioni();

    var container=document.getElementById("loginUsersContainer");
    utenti=await getUtentiStazioni();
    utenti.forEach(utente => 
    {
        numbers_utenti.push(utente.number);

        var item=document.createElement("button");
        item.setAttribute("class","login-user-item");
        item.setAttribute("id","loginUserItem"+utente.number);
        item.setAttribute("onclick","login("+utente.number+")");

        var i=document.createElement("i");
        i.setAttribute("class","fad fa-user");
        item.appendChild(i);

        var span=document.createElement("span");
        span.innerHTML=utente.number;
        item.appendChild(span);
        
        var span=document.createElement("span");
        span.innerHTML=utente.username;
        item.appendChild(span);

        var div=document.createElement("div");
        div.setAttribute("id","progressContainerLoginUserItem"+utente.number);
        item.appendChild(div);

        container.appendChild(item);
    });
});
function getAnagraficaLinee()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getAnagraficaLinee.php",
        function(response, status)
        {
            if(status=="success")
            {
                resolve(JSON.parse(response));
            }
            else
                reject({status});
        });
    });
}
function getAnagraficaStazioni()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getAnagraficaStazioni.php",
        function(response, status)
        {
            if(status=="success")
            {
                resolve(JSON.parse(response));
            }
            else
                reject({status});
        });
    });
}
function getUtentiStazioni()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getUtentiStazioni.php",
        function(response, status)
        {
            if(status=="success")
            {
                resolve(JSON.parse(response));
            }
            else
                reject({status});
        });
    });
}
async function login(number)
{
    var button=document.getElementById("progressContainerLoginUserItem"+number);

    button.innerHTML="";

    var utente=await getFirstObjByPropValue(utenti,"number",number);
    var username=utente.username;
    var stazione=document.getElementById("loginStazioneContainer").value;
    var linea=document.getElementById("loginLineaContainer").value;

    button.innerHTML='<i class="fad fa-spinner-third fa-spin"></i>';
    $.post("login.php",
    {
        username,
        stazione,
        linea
    },
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                button.innerHTML='<i class="fal fa-exclamation-triangle" style="color:#DA6969">';
                Swal.fire
                ({
                    icon: 'error',
                    title: 'Errore',
                    text: "Se il problema persiste contatta l' amministratore",
                    confirmButtonText:"Chiudi"
                });
                console.log(response);
            }
            else
            {
                button.innerHTML='<i class="far fa-check-circle" style="color:#70B085"></i>';
                window.location = 'index.html';
            }
        }
        else
        {
            button.innerHTML='<i class="fal fa-exclamation-triangle" style="color:#DA6969">';
            Swal.fire
            ({
                icon: 'error',
                title: 'Errore',
                text: "Se il problema persiste contatta l' amministratore",
                confirmButtonText:"Chiudi"
            });
            console.log(status);
        }
    });
}
window.addEventListener("keydown", function(event)
{
    var keyCode=event.keyCode;
    switch (keyCode) 
    {
        case 13:
            event.preventDefault();
            if(focused!=null)
            {
                login(focused);
            }
        break;
        case 48:setNumber(event.key);break;
        case 49:setNumber(event.key);break;
        case 50:setNumber(event.key);break;
        case 51:setNumber(event.key);break;
        case 52:setNumber(event.key);break;
        case 53:setNumber(event.key);break;
        case 54:setNumber(event.key);break;
        case 55:setNumber(event.key);break;
        case 56:setNumber(event.key);break;
        case 57:setNumber(event.key);break;
        case 37:
            event.preventDefault();
            if(focused2==null)
            {
                document.getElementById("loginLineaContainer").focus();
                focused2="loginLineaContainer";
            }
            if(focused2=="loginLineaContainer")
            {
                document.getElementById("loginLineaContainer").focus();
                focused2="loginLineaContainer";
                if(linee.length>0)
                {
                    var nome=document.getElementById("loginLineaContainer").value;
                    var linea=getFirstObjByPropValue(linee,"nome",nome);

                    var index=linee.indexOf(linea);
                    var new_index=index-1;
                    if(linee.indexOf(new_index)==-1)
                        var new_index=index+1;
                    if(new_index==linee.length)
                        var new_index=0;
                    //console.log(new_index)
                    var new_linea=linee[new_index];

                    document.getElementById("loginLineaContainer").value=new_linea.nome;
                    document.getElementById("loginLineaContainer").innerHTML=new_linea.label;
                }
            }
            else
            {
                document.getElementById("loginStazioneContainer").focus();
                focused2="loginStazioneContainer";
                if(stazioni.length>0)
                {
                    var nome=document.getElementById("loginStazioneContainer").value;
                    var stazione=getFirstObjByPropValue(stazioni,"nome",nome);

                    var index=stazioni.indexOf(stazione);
                    var new_index=index-1;
                    if(stazioni.indexOf(new_index)==-1)
                        var new_index=index+1;
                    if(new_index==stazioni.length)
                        var new_index=0;
                    //console.log(new_index)
                    var new_stazione=stazioni[new_index];

                    document.getElementById("loginStazioneContainer").value=new_stazione.nome;
                    document.getElementById("loginStazioneContainer").innerHTML=new_stazione.label;
                }
            }
        break;
        case 39:
            event.preventDefault();
            if(focused2==null)
            {
                document.getElementById("loginLineaContainer").focus();
                focused2="loginLineaContainer";
            }
            if(focused2=="loginLineaContainer")
            {
                document.getElementById("loginLineaContainer").focus();
                focused2="loginLineaContainer";
                if(linee.length>0)
                {
                    var nome=document.getElementById("loginLineaContainer").value;
                    var linea=getFirstObjByPropValue(linee,"nome",nome);

                    var index=linee.indexOf(linea);
                    var new_index=index-1;
                    if(linee.indexOf(new_index)==-1)
                        var new_index=index+1;
                    if(new_index==linee.length)
                        var new_index=0;
                    //console.log(new_index)
                    var new_linea=linee[new_index];

                    document.getElementById("loginLineaContainer").value=new_linea.nome;
                    document.getElementById("loginLineaContainer").innerHTML=new_linea.label;
                }
            }
            else
            {
                document.getElementById("loginStazioneContainer").focus();
                focused2="loginStazioneContainer";
                if(stazioni.length>0)
                {
                    var nome=document.getElementById("loginStazioneContainer").value;
                    var stazione=getFirstObjByPropValue(stazioni,"nome",nome);

                    var index=stazioni.indexOf(stazione);
                    var new_index=index-1;
                    if(stazioni.indexOf(new_index)==-1)
                        var new_index=index+1;
                    if(new_index==stazioni.length)
                        var new_index=0;
                    //console.log(new_index)
                    var new_stazione=stazioni[new_index];

                    document.getElementById("loginStazioneContainer").value=new_stazione.nome;
                    document.getElementById("loginStazioneContainer").innerHTML=new_stazione.label;
                }
            }
        break;
        case 9:
            event.preventDefault();
            setFocusLineaStazione();
        break;
        case 8:
            document.getElementById("loginInputNumber").value= document.getElementById("loginInputNumber").value.substring(0, document.getElementById("loginInputNumber").value.length - 1);
        break;
        case 40:
            event.preventDefault();
            if(focused==null)
                focused=numbers_utenti[0];
            else
            {
                focused=numbers_utenti[(numbers_utenti.indexOf(focused))+1];
                if(focused==undefined)
                    focused=numbers_utenti[0];
            }
            document.getElementById("loginUserItem"+focused).focus();   
            document.getElementById("loginInputNumber").value=focused;           
        break;
        case 38:
            event.preventDefault();
            if(focused==null)
                focused=numbers_utenti[numbers_utenti.length-1];
            else
            {
                focused=numbers_utenti[(numbers_utenti.indexOf(focused))-1];
                if(focused==undefined)
                    focused=numbers_utenti[numbers_utenti.length-1];
            }
            document.getElementById("loginUserItem"+focused).focus();
            document.getElementById("loginInputNumber").value=focused;           
        break;
        case 66:
            event.preventDefault();
            if(focused!=null)
            {
                login(focused);
            }
        break;
        default:break;
    }
    console.log(keyCode);
});
function setFocusLineaStazione()
{
    if(focused2==null)
    {
        document.getElementById("loginLineaContainer").focus();
        focused2="loginLineaContainer";
    }
    else
    {
        if(focused2=="loginLineaContainer")
        {
            document.getElementById("loginStazioneContainer").focus();
            focused2="loginStazioneContainer";
        }
        else
        {
            document.getElementById("loginLineaContainer").focus();
            focused2="loginLineaContainer";
        }
    }
}
function setNumber(key)
{
    var checkLength=document.getElementById("loginInputNumber").value.length;
    if(checkLength==2)
        document.getElementById("loginInputNumber").value="";
    var oldValue=document.getElementById("loginInputNumber").value;
    var newValue=oldValue+key;
    document.getElementById("loginInputNumber").value=newValue;
    var length=document.getElementById("loginInputNumber").value.length;
    if(length==2)
    {
        if(document.getElementById("loginUserItem"+newValue)!=null)
        {
            document.getElementById("loginUserItem"+newValue).focus();
            focused=newValue;
        }
    }
}