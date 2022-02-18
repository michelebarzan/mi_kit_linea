var numbers_utenti=[];
var focused;
var focused2;
var utenti=[];
var turni;
var linee;
var stazioni;
var turno;
var linea;
var stazione;
var passwordCambiaLineaStazione=false;
var funzioniTasti;
var popupCheckPassword=false;
var nClickNumpadButtonPopupCheckPassword;
var codiceCambiaLineaStazione;

window.addEventListener("load", async function(event)
{
    turni=await getAnagraficaTurni();
    linee=await getAnagraficaLinee();
    stazioni=await getAnagraficaStazioni();

    turno=await getCookie("turno");
    if(turno=="")
        turno='{"id_turno":"*","nome":"*","label":"Tutti"}';
    linea=await getCookie("linea");
    if(linea=="")
        linea=JSON.stringify(linee[0]);
    stazione=await getCookie("stazione");
    if(stazione=="")
        stazione=JSON.stringify(stazioni[0]);

    funzioniTasti=await getFunzioniTasti();

    turno=JSON.parse(turno);
    linea=JSON.parse(linea);
    stazione=JSON.parse(stazione);

    document.getElementById("loginTurnoContainer").value=turno.nome;
    document.getElementById("loginTurnoContainer").innerHTML=turno.label;

    document.getElementById("loginLineaContainer").value=linea.nome;
    document.getElementById("loginLineaContainer").innerHTML=linea.label;

    document.getElementById("loginStazioneContainer").value=stazione.nome;
    document.getElementById("loginStazioneContainer").innerHTML=stazione.label;

    var container=document.getElementById("loginUsersContainer");
    utenti=await getUtentiStazioni();
    utenti.forEach(utente => 
    {
        numbers_utenti.push(utente.number);

        var item=document.createElement("button");
        item.setAttribute("class","login-user-item");
        item.setAttribute("id","loginUserItem"+utente.number);
        item.setAttribute("onclick","login('"+utente.number+"')");

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
function getFunzioniTasti()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getFunzioniTasti.php",
        function(response, status)
        {
            if(status=="success")
            {
                try {
                    resolve(JSON.parse(response));
                } catch (error) {
                    setTimeout(() => {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    }, 500);
                    resolve([]);
                }
            }
            else
                reject({status});
        });
    });
}
function getAnagraficaTurni()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getAnagraficaTurni.php",
        function(response, status)
        {
            if(status=="success")
            {
                var arrayRespone=JSON.parse(response);
                arrayRespone.push({"id_turno":"*","nome":"*","label":"Tutti"});
                resolve(arrayRespone);
            }
            else
                reject({status});
        });
    });
}
function getAnagraficaLinee()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getAnagraficaLinee.php",
        function(response, status)
        {
            if(status=="success")
            {
                try {
                    resolve(JSON.parse(response));
                } catch (error) {
                    setTimeout(() => {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    }, 500);
                    resolve([]);
                }
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
                try {
                    resolve(JSON.parse(response));
                } catch (error) {
                    setTimeout(() => {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    }, 500);
                    resolve([]);
                }
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
                try {
                    resolve(JSON.parse(response));
                } catch (error) {
                    setTimeout(() => {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    }, 500);
                    resolve([]);
                }
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
    var turno=document.getElementById("loginTurnoContainer").value;
    var nomeStazione=stazione.nome;
    var linea=document.getElementById("loginLineaContainer").value;

    button.innerHTML='<i class="fad fa-spinner-third fa-spin"></i>';
    $.post("login.php",
    {
        username,
        turno,
        stazione:nomeStazione,
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
                window.location = stazione.pagina;
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
function checkPasswordCambiaLineaStazione()
{
    popupCheckPassword=false;
    var password=codiceCambiaLineaStazione;
    $.post("checkPasswordCambiaLineaStazione.php",
    {
        password
    },
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                Swal.fire
                ({
                    icon: 'error',
                    title: 'Errore',
                    text: "Se il problema persiste contatta l' amministratore",
                    confirmButtonText:"Chiudi"
                });
            }
            else
            {
                if(response=="OK")
                {
                    Swal.close();
                    passwordCambiaLineaStazione=true;
                }
                else
                {
                    passwordCambiaLineaStazione=false;
                    Swal.fire
                    ({
                        icon: 'error',
                        background:"#353535",
                        title: 'Errore',
                        text: "Password errata",
                        confirmButtonText:"Chiudi"
                    });
                }
            }
        }
    });
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
window.addEventListener("keydown", function(event)
{
    var keyCode=event.keyCode;
    switch (keyCode) 
    {
        case 116:
            //F4
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","conferma").valore):
            event.preventDefault();
            if(focused!=null)
            {
                login(focused);
            }
        break;
        case 48:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("0")}else{setNumber(event.key)};break;
        case 49:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("1")}else{setNumber(event.key)};break;
        case 50:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("2")}else{setNumber(event.key)};break;
        case 51:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("3")}else{setNumber(event.key)};break;
        case 52:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("4")}else{setNumber(event.key)};break;
        case 53:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("5")}else{setNumber(event.key)};break;
        case 54:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("6")}else{setNumber(event.key)};break;
        case 55:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("7")}else{setNumber(event.key)};break;
        case 56:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("8")}else{setNumber(event.key)};break;
        case 57:if(popupCheckPassword){clickNumpadButtonPopupCheckPassword("9")}else{setNumber(event.key)};break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_sinistra_di_1").valore):
            event.preventDefault();
            if(passwordCambiaLineaStazione==false)
                getPopupCheckPassword();
            else
            {
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
                        setCookie("linea",JSON.stringify(new_linea));
                    }
                }
                else
                {
                    document.getElementById("loginStazioneContainer").focus();
                    focused2="loginStazioneContainer";
                    if(stazioni.length>0)
                    {
                        var nome=document.getElementById("loginStazioneContainer").value;
                        var stazioneLocal=getFirstObjByPropValue(stazioni,"nome",nome);

                        var index=stazioni.indexOf(stazioneLocal);
                        var new_index=index-1;
                        if(stazioni.indexOf(new_index)==-1)
                            var new_index=index+1;
                        if(new_index==stazioni.length)
                            var new_index=0;
                        //console.log(new_index)
                        var new_stazione=stazioni[new_index];
                        stazione=new_stazione;

                        document.getElementById("loginStazioneContainer").value=new_stazione.nome;
                        document.getElementById("loginStazioneContainer").innerHTML=new_stazione.label;
                        setCookie("stazione",JSON.stringify(new_stazione));
                    }
                }
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_destra_di_1").valore):
            event.preventDefault();
            if(passwordCambiaLineaStazione==false)
                getPopupCheckPassword();
            else
            {
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
                        setCookie("linea",JSON.stringify(new_linea));
                    }
                }
                else
                {
                    document.getElementById("loginStazioneContainer").focus();
                    focused2="loginStazioneContainer";
                    if(stazioni.length>0)
                    {
                        var nome=document.getElementById("loginStazioneContainer").value;
                        var stazioneLocal=getFirstObjByPropValue(stazioni,"nome",nome);

                        var index=stazioni.indexOf(stazioneLocal);
                        var new_index=index-1;
                        if(stazioni.indexOf(new_index)==-1)
                            var new_index=index+1;
                        if(new_index==stazioni.length)
                            var new_index=0;
                        //console.log(new_index)
                        var new_stazione=stazioni[new_index];
                        stazione=new_stazione;

                        document.getElementById("loginStazioneContainer").value=new_stazione.nome;
                        document.getElementById("loginStazioneContainer").innerHTML=new_stazione.label;
                        setCookie("stazione",JSON.stringify(new_stazione));
                    }
                }
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","sposta_focus").valore):
            event.preventDefault();
            setFocusLineaStazione();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_turno").valore):
            event.preventDefault();
            var nome=document.getElementById("loginTurnoContainer").value;
            var turno=getFirstObjByPropValue(turni,"nome",nome);

            var index=turni.indexOf(turno);
            var new_index=index-1;
            if(turni.indexOf(new_index)==-1)
                var new_index=index+1;
            if(new_index==turni.length)
                var new_index=0;
            //console.log(new_index)
            var new_turno=turni[new_index];

            document.getElementById("loginTurnoContainer").value=new_turno.nome;
            document.getElementById("loginTurnoContainer").innerHTML=new_turno.label;
            setCookie("turno",JSON.stringify(new_turno));
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_giu_di_1").valore):
            event.preventDefault();
            passwordCambiaLineaStazione=false;
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
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_su_di_1").valore):
            event.preventDefault();
            passwordCambiaLineaStazione=false;
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
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","seleziona_lotto").valore):
            event.preventDefault();
            if(focused!=null)
            {
                login(focused);
            }
        break;
        default:
            event.preventDefault();
        break;
    }
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
function getParametriByHelp(help)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getParametriByHelp.php",
        {
            help
        },
        function(response, status)
        {
            if(status=="success")
            {
                try {
                    resolve(JSON.parse(response));
                } catch (error) {
                    setTimeout(() => {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    }, 500);
                    resolve([]);
                }
            }
            else
                reject({status});
        });
    });
}
function clickCambiaTurno()
{
    var nome=document.getElementById("loginTurnoContainer").value;
    var turno=getFirstObjByPropValue(turni,"nome",nome);

    var index=turni.indexOf(turno);
    var new_index=index-1;
    if(turni.indexOf(new_index)==-1)
        var new_index=index+1;
    if(new_index==turni.length)
        var new_index=0;
    //console.log(new_index)
    var new_turno=turni[new_index];

    document.getElementById("loginTurnoContainer").value=new_turno.nome;
    document.getElementById("loginTurnoContainer").innerHTML=new_turno.label;
    setCookie("turno",JSON.stringify(new_turno));
}
function clickCambiaLinea()
{
    if(passwordCambiaLineaStazione==false)
        getPopupCheckPassword();
    else
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
            setCookie("linea",JSON.stringify(new_linea));
        }
    }
}
function clickCambiaStazione()
{
    if(passwordCambiaLineaStazione==false)
        getPopupCheckPassword();
    else
    {
        document.getElementById("loginStazioneContainer").focus();
        focused2="loginStazioneContainer";
        if(stazioni.length>0)
        {
            var nome=document.getElementById("loginStazioneContainer").value;
            var stazioneLocal=getFirstObjByPropValue(stazioni,"nome",nome);

            var index=stazioni.indexOf(stazioneLocal);
            var new_index=index-1;
            if(stazioni.indexOf(new_index)==-1)
                var new_index=index+1;
            if(new_index==stazioni.length)
                var new_index=0;
            //console.log(new_index)
            var new_stazione=stazioni[new_index];
            stazione=new_stazione;

            document.getElementById("loginStazioneContainer").value=new_stazione.nome;
            document.getElementById("loginStazioneContainer").innerHTML=new_stazione.label;
            setCookie("stazione",JSON.stringify(new_stazione));
        }
    }
}
function getPopupCheckPassword()
{
    popupCheckPassword=true;
    nClickNumpadButtonPopupCheckPassword=0;
    codiceCambiaLineaStazione="";

    var outerContainer=document.createElement("div");
    outerContainer.setAttribute("class","popup-cambia-linea-stazione-outer-container");

    var title=document.createElement("span");
    title.setAttribute("class","popup-cambia-linea-stazione-title");
    title.innerHTML="Inserisci il codice";
    outerContainer.appendChild(title);

    var fakeInputContainer=document.createElement("div");
    fakeInputContainer.setAttribute("class","popup-cambia-linea-stazione-fake-input-container");
    var i=document.createElement("i");i.setAttribute("class","fal fa-circle");fakeInputContainer.appendChild(i);
    var i=document.createElement("i");i.setAttribute("class","fal fa-circle");fakeInputContainer.appendChild(i);
    var i=document.createElement("i");i.setAttribute("class","fal fa-circle");fakeInputContainer.appendChild(i);
    var i=document.createElement("i");i.setAttribute("class","fal fa-circle");fakeInputContainer.appendChild(i);
    outerContainer.appendChild(fakeInputContainer);

    var numpad=document.createElement("div");
    numpad.setAttribute("class","popup-cambia-linea-stazione-numpad");
    var button=document.createElement("button");button.innerHTML="<span>1</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('1')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>2</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('2')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>3</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('3')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>4</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('4')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>5</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('5')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>6</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('6')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>7</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('7')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>8</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('8')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>9</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('9')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>0</span>";button.setAttribute("onclick","clickNumpadButtonPopupCheckPassword('0')");numpad.appendChild(button);
    outerContainer.appendChild(numpad);

    Swal.fire
    ({
        html:outerContainer.outerHTML,
        showCloseButton: false,
        showConfirmButton:false,
        showCancelButton:false,
        background:"#353535",
        onOpen : function()
                {
                    document.body.classList.remove("swal2-height-auto");
                    document.getElementsByClassName("swal2-content")[0].style.padding="0px";
                    document.getElementsByClassName("swal2-popup")[0].style.padding="0px";
                    document.getElementsByClassName("swal2-popup")[0].style.width="210px";
                    document.getElementsByClassName("swal2-content")[0].style.boxShadow="0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)";
                    document.activeElement.blur()
                },
    }).then((result) => 
    {
        popupCheckPassword=false;
    });
}
function clickNumpadButtonPopupCheckPassword(n)
{
    if(nClickNumpadButtonPopupCheckPassword<5)
    {
        nClickNumpadButtonPopupCheckPassword++;
        codiceCambiaLineaStazione+=n;
        try {
            document.getElementsByClassName("popup-cambia-linea-stazione-fake-input-container")[0].getElementsByTagName("i")[(nClickNumpadButtonPopupCheckPassword-1)].className="fas fa-circle";
        } catch (error) {}
    }
    if(nClickNumpadButtonPopupCheckPassword==4)
    {
        checkPasswordCambiaLineaStazione();
    }
}