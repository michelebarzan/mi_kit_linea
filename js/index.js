var lotti,cabine_corridoi,kit;
var lottoSelezionato,cabina_corridoioSelezionato,kitSelezionato;
var funzioniTasti;
var focused;
var numbers_array=
{
    "lotti":[]
};
var view;
var iframe;
var ordinamentoKit;
var mostraMisureTraversine;
var raggruppaKit;
var filtroAvanzamento;
var turno;
var linea;
var stazione;
var id_utente;
var dot;
var shownPdf;
var raggruppamentoTraversine="LUNG";
var popupRaggruppamentoTraversine=false;
var printList=[];
var mi_kit_linea_params;
var socket;
var items_transition_time = 150;

window.addEventListener("load", async function(event)
{
    Swal.fire
    ({
        width:"100%",
        background:"transparent",
        title:"Caricamento in corso...",
        html:'<i class="fad fa-spinner-third fa-spin fa-3x" style="color:white"></i>',
        allowOutsideClick:false,
        showCloseButton:false,
        showConfirmButton:false,
        allowEscapeKey:false,
        showCancelButton:false,
        onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="white";}
    });
 
    mi_kit_linea_params = await getMiKitLineaParams();

    id_utente=await getSessionValue("id_utente");

    var nome_turno=await getSessionValue("turno");
    var nome_linea=await getSessionValue("linea");
    var nome_stazione=await getSessionValue("stazione");

    var turni=await getAnagraficaTurni();
    var linee=await getAnagraficaLinee();
    var stazioni=await getAnagraficaStazioni();

    turno=getFirstObjByPropValue(turni,"nome",nome_turno);
    stazione=getFirstObjByPropValue(stazioni,"nome",nome_stazione);
    linea=getFirstObjByPropValue(linee,"nome",nome_linea);

    ordinamentoKit=await getCookie("ordinamentoKit");
    if(ordinamentoKit=="")
        ordinamentoKit="kit";

    if(stazione.nome=="traversine")
    {
        mostraMisureTraversine=await getCookie("mostraMisureTraversine");
        if(mostraMisureTraversine=="")
            mostraMisureTraversine="true";
    }

    if(stazione.nome=="traversine")
    {
        raggruppaKit=await getCookie("raggruppaKit");
        if(raggruppaKit=="")
            raggruppaKit="true";
    }

    filtroAvanzamento=await getCookie("filtroAvanzamento");
    if(filtroAvanzamento=="")
        filtroAvanzamento="inattivo";
    setFiltroAvanzamentoLabel();

    dot=document.title;
    document.title=linea.label + " " + dot + " " + stazione.label;

    document.getElementById("infoLineaContainer").innerHTML=linea.label;
    document.getElementById("infoLineaContainer").setAttribute("nome",linea.nome);
    document.getElementById("infoLineaContainer").setAttribute("id_linea",linea.id_linea);
    
    document.getElementById("infoStazioneContainer").innerHTML=stazione.label;
    document.getElementById("infoStazioneContainer").setAttribute("nome",stazione.nome);
    document.getElementById("infoStazioneContainer").setAttribute("id_stazione",stazione.id_stazione);

    var username=await getSessionValue("username");
    document.getElementById("usernameContainer").innerHTML=username+'<i class="fad fa-user" style="margin-left:10px"></i>';

    funzioniTasti=await getFunzioniTasti();

    socket = io(`${mi_kit_linea_params.node_websocket_server_info.protocol}://${mi_kit_linea_params.node_websocket_server_info.ip}:${mi_kit_linea_params.node_websocket_server_info.port}`);
    
    socket.on('message', message =>
    {
        if(stazione.nome=="montaggio" && message.linea == linea.nome)
        {
            stampaEtichettaKit(message.printList);
        }
    });

    Swal.close();

    getListLotti(true);
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
function setOrdinamentoKitLabel()
{
    if(ordinamentoKit=="kit")
        document.getElementById("ordinamentoContainer").innerHTML="Ordinati per codice";
    if(ordinamentoKit=="posizione")
        document.getElementById("ordinamentoContainer").innerHTML="Ordinati per posizione";
}
function setMostraMisureTraversineLabel()
{
    if(mostraMisureTraversine=="true")
        document.getElementById("mostraMisureTraversineContainer").innerHTML="Mostra misure traversine";
    if(mostraMisureTraversine=="false")
        document.getElementById("mostraMisureTraversineContainer").innerHTML="Nascondi misure traversine";
}
function setRaggruppaKitLabel()
{
    if(raggruppaKit=="true")
        document.getElementById("raggruppaKitContainer").innerHTML="Raggruppa kit uguali";
    if(raggruppaKit=="false")
        document.getElementById("raggruppaKitContainer").innerHTML="Esplodi kit";
}
function setFiltroAvanzamentoLabel()
{
    document.getElementById("filtroAvanzamentoContainer").innerHTML="Filtro avanzamento "+filtroAvanzamento;
    if(filtroAvanzamento=="attivo")
        document.getElementById("filtroAvanzamentoContainer").style.color="#548CFF";
    if(filtroAvanzamento=="inattivo")
        document.getElementById("filtroAvanzamentoContainer").style.color="#DA6969";
}
function toggleFiltroAvanzamento()
{
    if(filtroAvanzamento=="attivo")
        filtroAvanzamento="inattivo";
    else
        filtroAvanzamento="attivo";

    setCookie("filtroAvanzamento",filtroAvanzamento);
    setFiltroAvanzamentoLabel();

    if(view=="kit")
        getListKit(true);
    if(view=="cabine_corridoi")
        getListCabineECorridoi(true);
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
function getParametro(nome)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getParametro.php",
        {
            nome
        },
        function(response, status)
        {
            if(status=="success")
            {
                resolve(response);
            }
            else
                reject({status});
        });
    });
}
function setNumber(key)
{
    var checkLength=document.getElementById("inputNumber").value.length;
    if(checkLength==2)
        document.getElementById("inputNumber").value="";
    var oldValue=document.getElementById("inputNumber").value;
    var newValue=oldValue+key;
    document.getElementById("inputNumber").value=newValue;
    var length=document.getElementById("inputNumber").value.length;
    if(length==2)
    {
        if(document.getElementById(view+"Item"+newValue)!=null)
        {
            document.getElementById(view+"Item"+newValue).focus();
            focused=newValue;
        }
    }
}
window.addEventListener("keydown", async function(event)
{
    var keyCode=event.keyCode;
    /*console.log(keyCode);
    console.log(event.key);*/
    switch (keyCode) 
    {
        case 48:setNumber(event.key);break;//0
        case 49:setNumber(event.key);break;//1
        case 50:setNumber(event.key);break;//2
        case 51:setNumber(event.key);break;//3
        case 52:setNumber(event.key);break;//4
        case 53:setNumber(event.key);break;//5
        case 54:setNumber(event.key);break;//6
        case 55:setNumber(event.key);break;//7
        case 56:setNumber(event.key);break;//8
        case 57:setNumber(event.key);break;//9
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","stampa_etichetta_kit").valore):
            event.preventDefault();
            if(stazione.nome=="caricamento")
                sendStampaEtichettaKit();
            if(stazione.nome=="montaggio")
            {
                if(printList[(printList.length-1)] != undefined)
                    stampaEtichettaKit([printList[(printList.length-1)]]);
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","stampa_etichetta_carrello").valore):
            event.preventDefault();
            if(stazione.nome=="caricamento" && cabina_corridoioSelezionato != null)
                stampaEtichettaCarrello();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","apri_popup_raggruppamento_traversine").valore):
            event.preventDefault();
            if(view=="kit" && stazione.nome=="traversine")
            {
                getPopupRaggruppamentoTraversine();
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","elimina_registrazione_avanzamento_kit").valore):
            event.preventDefault();
            if(view=="kit")
            {
                eliminaRegistrazioneAvanzamentoKit(focused);
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_mostra_misure_traversine").valore):
            event.preventDefault();
            if(view=="kit" && stazione.nome=="traversine")
            {
                if(mostraMisureTraversine=="true")
                    mostraMisureTraversine="false";
                else
                    mostraMisureTraversine="true";
                getListKit(false);
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_raggruppa_kit").valore):
            event.preventDefault();
            if(view=="kit" && stazione.nome=="traversine")
            {
                if(raggruppaKit=="true")
                    raggruppaKit="false";
                else
                {
                    raggruppaKit="true";
                    ordinamentoKit="kit";
                }
                getListKit(false);
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_ordinamento").valore):
            event.preventDefault();
            if(view=="kit")
            {
                if(stazione.nome!="traversine")
                {
                    if(ordinamentoKit=="kit")
                        ordinamentoKit="posizione";
                    else
                        ordinamentoKit="kit";
                }
                else
                {
                    if(raggruppaKit=="false")
                    {
                        if(ordinamentoKit=="kit")
                            ordinamentoKit="posizione";
                        else
                            ordinamentoKit="kit";
                    }
                }
                getListKit(false);
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_filtro_linea").valore):
            event.preventDefault();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_filtro_stazione").valore):
            event.preventDefault();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_filtro_avanzamento").valore):
            event.preventDefault();
            toggleFiltroAvanzamento();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_giu_di_1").valore):
            event.preventDefault();
			scorri_giu_di_1();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_su_di_1").valore):
            event.preventDefault();
			scorri_su_di_1();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","conferma").valore):
            event.preventDefault();
            if(focused!=null)
            {
                switch (view)
                {
                    case "lotti":
                        selectLotto(focused);
                    break;
                    case "cabine_corridoi":
                        shownPdf=null;selectCabinaCorridoio(focused);
                    break;
                    case "kit":
                        shownPdf=null;
                        kitSelezionato=getFirstObjByPropValue(kit,"number",focused);
                        if(stazione.nome=="montaggio" && !kitSelezionato.registrato_caricamento)
                        {
                            Swal.fire
                            ({
                                icon:"warning",
                                title: 'Il kit '+kitSelezionato.kit+' non è stato registrato in tutte le stazioni precedenti',
                                showCloseButton: false,
                                showConfirmButton:true,
                                showCancelButton:true,
                                confirmButtonText:"Continua [INVIO]",
                                cancelButtonText:"Annulla [ESC]",
                                background:"#353535",
                                onOpen : function()
                                        {
                                            document.getElementsByClassName("swal2-close")[0].style.outline="none";
                                        },
                            }).then((result) => 
                            {
                                if(result.value)
                                    confermaKit(focused);
                            });
                        }
                        else
                            confermaKit(focused);
                    break;
                }
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","seleziona_lotto").valore):
            event.preventDefault();
            switch (view)
                {
                    case "lotti":
                        if(focused!=null)
                            selectLotto(focused);
                    break;
                    default:
                        getListLotti(true);
                    break;
                }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","seleziona_cabina_corridoio").valore):
            event.preventDefault();
            switch (view)
                {
                    case "cabine_corridoi":
                        if(focused!=null)
                        {
                            shownPdf=null;
                            selectCabinaCorridoio(focused);
                        }
                    break;
                    case "lotti":break;
                    default:
                        getListCabineECorridoi(true);
                    break;
                }
            
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","logout").valore):
            event.preventDefault();
            logout();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","zoom_+").valore):
            event.preventDefault();
            zoomin()
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","zoom_-").valore):
            event.preventDefault();
            zoomout()
        break;
        /*case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","zoom_+_2").valore):
            event.preventDefault();
            zoomin()
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","zoom_-_2").valore):
            event.preventDefault();
            zoomout()
        break;*/
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","muovi_su").valore):
            event.preventDefault();
            scrolltop();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","muovi_giu").valore):
            event.preventDefault();
            scrolldown();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","muovi_sinistra").valore):
            event.preventDefault();
            scrollleft();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","muovi_destra").valore):
            event.preventDefault();
            scrollright();
        break;
        default:
            event.preventDefault();
        break;
    }
});
function scorri_su_di_1()
{
	if(focused==null)
		focused=numbers_array[view][numbers_array[view].length-1];
	else
	{
		focused=numbers_array[view][(numbers_array[view].indexOf(focused))-1];
		if(focused==undefined)
			focused=numbers_array[view][numbers_array[view].length-1];
	}
	document.getElementById(view+"Item"+focused).focus();   
	document.getElementById("inputNumber").value=focused;
}
function timeout_scorri_su_di_1(time)
{
    setTimeout(() => {scorri_su_di_1();}, time);
}
function scorri_giu_di_1()
{
	if(focused==null)
		focused=numbers_array[view][0];
	else
	{
		focused=numbers_array[view][(numbers_array[view].indexOf(focused))+1];
		if(focused==undefined)
			focused=numbers_array[view][0];
	}
    document.getElementById(view+"Item"+focused).focus();   
	document.getElementById("inputNumber").value=focused;    
}
function timeout_scorri_giu_di_1(time)
{
    setTimeout(() => {scorri_giu_di_1();}, time);
}
function zoomin()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("zoomIn").click();
    } catch (error) {}
}
function zoomout()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("zoomOut").click();
    } catch (error) {}
}
function scrolltop()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollTop-=50;
    } catch (error) {}
}
function scrolldown()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollTop+=50;
    } catch (error) {}
}
function scrollleft()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollLeft-=50;
    } catch (error) {}
}
function scrollright()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollLeft+=50;
    } catch (error) {}
}
async function eliminaRegistrazioneAvanzamentoKit(number)
{
    kitSelezionato=getFirstObjByPropValue(kit,"number",number);

    var lotto=lottoSelezionato.lotto;
    var cabina=cabina_corridoioSelezionato.numero_cabina;
    var id_stazione=stazione.id_stazione;
    var id_linea=linea.id_linea;

    $.get("eliminaRegistrazioneAvanzamentoKit.php",
    {
        lotto,
        cabina,
        posizione:kitSelezionato.posizione,
        id_stazione,
        id_linea
    },
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                Swal.fire
                ({
                    background:"#404040",
                    icon: 'error',
                    title: "Errore. Se il problema persiste contatta l' amministratore",
                    showConfirmButton:false,
                    showCloseButton:true
                });
                console.log(response);
            }
            else
            {
                if(filtroAvanzamento=="inattivo")
                    getListKit(false,timeout_scorri_giu_di_1(300));
                else
                    getListKit(false);
            }
        }
        else
        {
            Swal.fire
            ({
                background:"#404040",
                icon: 'error',
                title: "Errore. Se il problema persiste contatta l' amministratore",
                showConfirmButton:false,
                showCloseButton:true
            });
            console.log(status);
        }
    });
}
async function confermaKit(number)
{
    Swal.fire
    ({
        width:"100%",
        background:"transparent",
        title:"Caricamento in corso...",
        html:'<i class="fad fa-spinner-third fa-spin fa-3x" style="color:white"></i>',
        allowOutsideClick:false,
        showCloseButton:false,
        showConfirmButton:false,
        allowEscapeKey:false,
        showCancelButton:false,
        onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="white";}
    });

    var lotto=lottoSelezionato.lotto;
    var cabina=cabina_corridoioSelezionato.numero_cabina;
    var id_stazione=stazione.id_stazione;
    var id_linea=linea.id_linea;

    $.get("registraAvanzamentoKit.php",
    {
        lotto,
        cabina,
        kit:kitSelezionato.kit,
        posizione:kitSelezionato.posizione,
        id_stazione,
        id_linea,
        id_utente
    },
    function(response, status)
    {
        if(status=="success")
        {
            Swal.close();
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                Swal.fire
                ({
                    background:"#404040",
                    icon: 'error',
                    title: "Errore. Se il problema persiste contatta l' amministratore",
                    showConfirmButton:false,
                    showCloseButton:true
                });
                console.log(response);
            }
            else
            {
                if(stazione.nome=="caricamento" || stazione.nome=="montaggio")
                {
                    var printObj=
                    {
                        kit:kitSelezionato.kit,
                        numero_cabina:cabina_corridoioSelezionato.numero_cabina,
                        posizione:kitSelezionato.posizione
                    }
                    printList.push(printObj);
                    if(stazione.nome=="caricamento" && printList.length==3)
                        sendStampaEtichettaKit();
                }
                if(filtroAvanzamento=="inattivo")
                    getListKit(false,timeout_scorri_giu_di_1(300));
                else
                    getListKit(false);
            }
        }
        else
        {
            Swal.fire
            ({
                background:"#404040",
                icon: 'error',
                title: "Errore. Se il problema persiste contatta l' amministratore",
                showConfirmButton:false,
                showCloseButton:true
            });
            console.log(status);
        }
    });
}
function selectCabinaCorridoio(number)
{
    cabina_corridoioSelezionato=getFirstObjByPropValue(cabine_corridoi,"number",number);
    if(cabina_corridoioSelezionato.tipo=="cabina")
        document.getElementById("labelCabinaCorridoioSelezionato").innerHTML=cabina_corridoioSelezionato.tipo.charAt(0).toUpperCase() + cabina_corridoioSelezionato.tipo.slice(1)+` <b>`+cabina_corridoioSelezionato.numero_cabina+` ${dot} `+cabina_corridoioSelezionato.disegno_cabina+`</b>`;
    else
        document.getElementById("labelCabinaCorridoioSelezionato").innerHTML=cabina_corridoioSelezionato.tipo.charAt(0).toUpperCase() + cabina_corridoioSelezionato.tipo.slice(1)+` <b>`+cabina_corridoioSelezionato.numero_cabina+`</b>`;

    getListKit(true);
}
async function getListKit(cleanFocused,callback)
{
    Swal.fire
    ({
        width:"100%",
        background:"transparent",
        title:"Caricamento in corso...",
        html:'<i class="fad fa-spinner-third fa-spin fa-3x" style="color:white"></i>',
        allowOutsideClick:false,
        showCloseButton:false,
        showConfirmButton:false,
        allowEscapeKey:false,
        showCancelButton:false,
        onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="white";}
    });

    view="kit";

    if(stazione.nome=="traversine")
    {
        document.getElementById("mostraMisureTraversineContainer").style.display="";
        setMostraMisureTraversineLabel();

        setCookie("mostraMisureTraversine",mostraMisureTraversine);

        document.getElementById("raggruppaKitContainer").style.display="";
        setRaggruppaKitLabel();

        setCookie("raggruppaKit",raggruppaKit);

        if(raggruppaKit=="true")
            ordinamentoKit="kit";
    }
    else
    {
        document.getElementById("raggruppaKitContainer").style.display="none";
        document.getElementById("mostraMisureTraversineContainer").style.display="none";
    }

    document.getElementById("ordinamentoContainer").style.display="";
    setOrdinamentoKitLabel();

    setCookie("ordinamentoKit",ordinamentoKit);
    
    if(cleanFocused)
    {
        numbers_array[view]=[];
        focused=null;
        document.getElementById("inputNumber").value="";
        document.getElementById("pdfContainer").innerHTML="";
        iframe=null;
    }

    kitSelezionato=null;

    var container=document.getElementById("listInnerContainer");

    var oldScrollTop;
    try
    {
        oldScrollTop = container.scrollTop;
    } catch (error) {
        oldScrollTop = 0;
    }

    container.innerHTML="";

    var i=1;
    kit=await getKit(lottoSelezionato.lotto,lottoSelezionato.commessa,cabina_corridoioSelezionato.numero_cabina);

    kit.forEach(function (kitItem)
    {
        if(i<10)
            var number="0" + i.toString();
        else
            var number=i.toString();
        
        kit[i-1].number=number;

        var codiceKit=kitItem["kit"];

        var item=document.createElement("button");
        item.setAttribute("class","kit-item");
        item.setAttribute("onfocus","checkItemScroll(event,this);getPdf('kit','"+codiceKit+"')");
        item.setAttribute("id","kitItem"+kitItem.number);

        var div=document.createElement("div");
        div.innerHTML=number;
        item.appendChild(div);

        var span=document.createElement("span");
        span.innerHTML=kitItem["kit"];
        item.appendChild(span);

        if(stazione.nome=="traversine")
        {
            if(raggruppaKit=="true")
            {
                var span=document.createElement("span");
                span.innerHTML="<u>Qnt:</u> "+kitItem["n"];
                item.appendChild(span);

                var span=document.createElement("span");
                span.setAttribute("style","width: calc(100% - 80px);margin-right: 40px;margin-left: 40px;margin-top: 5px;text-align:left;height:auto");
                span.setAttribute("class","container-posizioni-kit-raggruppato");
                span.innerHTML="<u>Pos:</u> ";
                kitItem.posizioni.forEach(posizione =>
                {
                    span.innerHTML += posizione.posizione + ", ";
                });
                item.appendChild(span);
            }
            if(mostraMisureTraversine=="true")
            {
                var table=document.createElement("table");
                table.setAttribute("class","misure-traversine-table");
    
                var tr=document.createElement("tr");
    
                var th=document.createElement("th");
                th.innerHTML="CODMAT";
                tr.appendChild(th);
    
                var th=document.createElement("th");
                th.innerHTML="LUNG";
                tr.appendChild(th);
    
                var th=document.createElement("th");
                th.innerHTML="POS";
                tr.appendChild(th);
    
                table.appendChild(tr);
    
                var j=0;
                kitItem.traversine.forEach(traversina => 
                {
                    var tr=document.createElement("tr");
                    
                    var td=document.createElement("td");
                    if(j==kitItem.traversine.length-1)
                        td.setAttribute("style","border-bottom:none");
                    td.innerHTML=traversina.CODMAT;
                    tr.appendChild(td);
    
                    var td=document.createElement("td");
                    if(j==kitItem.traversine.length-1)
                        td.setAttribute("style","border-bottom:none");
                    td.innerHTML=traversina.LUNG;
                    tr.appendChild(td);
    
                    var td=document.createElement("td");
                    if(j==kitItem.traversine.length-1)
                        td.setAttribute("style","border-bottom:none");
                    td.innerHTML=traversina.posizione_traversina;
                    tr.appendChild(td);
    
                    table.appendChild(tr);
                    j++;
                });
    
                item.appendChild(table);
            }
        }
        else
        {
            var span=document.createElement("span");
            span.innerHTML="<u>Pos:</u> "+kitItem["posizione"];
            item.appendChild(span);
    
            if(filtroAvanzamento=="inattivo")
            {
                if(kitItem.registrato)
                {
                    var fa=document.createElement("i");
                    fa.setAttribute("class","fad fa-check-circle");
                    fa.setAttribute("id","iconCheckKit"+kitItem.number);
                    fa.setAttribute("style","color:#70B085;margin-left:auto;margin-top:5px;margin-right:5px;font-size:15px");
                    item.appendChild(fa);
                }
            }
        }

        container.appendChild(item);

        numbers_array[view].push(number);

        i++;
    });

    if(stazione.nome=="traversine" && (mostraMisureTraversine=="true" || raggruppaKit=="true"))
    {
        var kitItems=document.getElementsByClassName("kit-item");
        for (let index = 0; index < kitItems.length; index++)
        {
            const kitItem = kitItems[index];
            var height=kitItem.offsetHeight;
            if(mostraMisureTraversine=="true")
                height+=kitItem.getElementsByClassName("misure-traversine-table")[0].offsetHeight+10;
            if(raggruppaKit=="true")
                height+=kitItem.getElementsByClassName("container-posizioni-kit-raggruppato")[0].offsetHeight+5;
            kitItem.style.minHeight=height+"px";
            kitItem.style.height=height+"px";
            kitItem.style.maxHeight=height+"px";
        }
    }

    if(!cleanFocused && focused!=null)
    {
        try {
            document.getElementById(view+"Item"+focused).focus();   
        } catch (error) {}
    }
    else
        container.scrollTop = oldScrollTop;

    Swal.close();

    if(callback!=null && callback!=undefined)
    {
        callback();
    }
}
function getKit(lotto,commessa,numero_cabina)
{
    return new Promise(function (resolve, reject) 
    {
        var id_linea=linea.id_linea;
        var id_stazione=stazione.id_stazione;

        var url;
        if(stazione.nome=="traversine")
            url = "getkitTraversine.php";
        else
            url = "getKit.php";
        $.get(url,
        {
            lotto,
            commessa,
            numero_cabina,
            id_linea,
            id_stazione,
            filtroAvanzamento,
            ordinamentoKit,
            mostraMisureTraversine,
            raggruppaKit
        },
        function(response, status)
        {
            if(status=="success")
            {
                try {
                    resolve(JSON.parse(response));
                } catch (error) {
                    console.log(response);
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
function logout()
{
    $.get("logout.php",
    function(response, status)
    {
        window.location = 'login.html';
    });
}
async function getListLotti(cleanFocused)
{
    Swal.fire
    ({
        width:"100%",
        background:"transparent",
        title:"Caricamento in corso...",
        html:'<i class="fad fa-spinner-third fa-spin fa-3x" style="color:white"></i>',
        allowOutsideClick:false,
        showCloseButton:false,
        showConfirmButton:false,
        allowEscapeKey:false,
        showCancelButton:false,
        onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="white";}
    });

    view="lotti";

    document.getElementById("ordinamentoContainer").style.display="none";
    document.getElementById("mostraMisureTraversineContainer").style.display="none";
    document.getElementById("raggruppaKitContainer").style.display="none";
    
    if(cleanFocused)
    {
        numbers_array[view]=[];
        focused=null;
        document.getElementById("inputNumber").value="";
    }

    lottoSelezionato=null;
    document.getElementById("labelLottoSelezionato").innerHTML="Scegli un lotto";
    cabina_corridoioSelezionato=null;
    document.getElementById("labelCabinaCorridoioSelezionato").innerHTML="Scegli una cabina / un corridoio";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    var container=document.getElementById("listInnerContainer");
    container.innerHTML="";

    var i=1;
    lotti=await getLotti();
    lotti.forEach(function (lotto)
    {
        if(i<10)
            var number="0" + i.toString();
        else
            var number=i.toString();
        
        lotti[i-1].number=number;

        var item=document.createElement("button");
        item.setAttribute("class","lotti-item");
        item.setAttribute("id","lottiItem"+lotto.number);
        item.setAttribute("onfocus","checkItemScroll(event,this);");

        var div=document.createElement("div");
        div.innerHTML=number;
        item.appendChild(div);

        var span=document.createElement("span");
        span.innerHTML=lotto.lotto;
        item.appendChild(span);

        container.appendChild(item);

        numbers_array[view].push(number);

        i++;
    });
    if(!cleanFocused && focused!=null)
    {
        try {
            document.getElementById(view+"Item"+focused).focus();
        } catch (error) {}
    }

    Swal.close();
}
function selectLotto(number)
{
    lottoSelezionato=getFirstObjByPropValue(lotti,"number",number);
    document.getElementById("labelLottoSelezionato").innerHTML="Lotto <b>"+lottoSelezionato.lotto+"</b>";

    getListCabineECorridoi(true);
}
async function getListCabineECorridoi(cleanFocused)
{
    Swal.fire
    ({
        width:"100%",
        background:"transparent",
        title:"Caricamento in corso...",
        html:'<i class="fad fa-spinner-third fa-spin fa-3x" style="color:white"></i>',
        allowOutsideClick:false,
        showCloseButton:false,
        showConfirmButton:false,
        allowEscapeKey:false,
        showCancelButton:false,
        onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="white";}
    });

    view="cabine_corridoi";

    document.getElementById("ordinamentoContainer").style.display="none";
    document.getElementById("mostraMisureTraversineContainer").style.display="none";
    document.getElementById("raggruppaKitContainer").style.display="none";

    if(cleanFocused)
    {
        numbers_array[view]=[];
        focused=null;
        document.getElementById("inputNumber").value="";
        document.getElementById("pdfContainer").innerHTML="";
        iframe=null;
    }

    cabina_corridoioSelezionato=null;
    document.getElementById("labelCabinaCorridoioSelezionato").innerHTML="Scegli una cabina / un corridoio";

    /*document.getElementById("pdfContainer").innerHTML="";
    iframe=null;*/

    var container=document.getElementById("listInnerContainer");
    container.innerHTML="";

    var i=1;
    cabine_corridoi=await getCabineECorridoi(lottoSelezionato.lotto,lottoSelezionato.commessa);
    cabine_corridoi.forEach(function (cabina_corridoio)
    {
        if(i<10)
            var number="0" + i.toString();
        else
            var number=i.toString();
        
            cabine_corridoi[i-1].number=number;

        var item=document.createElement("button");
        item.setAttribute("class","cabine_corridoi-item");
        if(cabina_corridoio.tipo=="cabina")
            item.setAttribute("onfocus","checkItemScroll(event,this);getPdf('cabine_corridoi','"+cabina_corridoio.disegno_cabina+"')");
        item.setAttribute("id","cabine_corridoiItem"+cabina_corridoio.number);

        var div=document.createElement("div");
        div.innerHTML=number;
        item.appendChild(div);

        var span=document.createElement("span");
        span.innerHTML=cabina_corridoio.numero_cabina;
        item.appendChild(span);

        if(cabina_corridoio.tipo=="cabina")
        {
            var span=document.createElement("span");
            span.innerHTML=cabina_corridoio.disegno_cabina;
            item.appendChild(span);
        }

        container.appendChild(item);

        numbers_array[view].push(number);

        i++;
    });
    if(!cleanFocused && focused!=null)
    {
        document.getElementById(view+"Item"+focused).focus();   
    }

    Swal.close();
}
async function getPdf(folder,fileName)
{
    /*if(fileName != shownPdf)//delete
    {
        shownPdf=fileName;
        var container=document.getElementById("pdfContainer");
        container.innerHTML="";

        iframe=document.createElement("iframe");
        iframe.setAttribute("id","");
        iframe.setAttribute("class","");
        iframe.setAttribute("onload","fixPdf(this);shownPdf='"+fileName+"';");
        var server_adress=await getServerValue("SERVER_ADDR");
        var server_port=await getServerValue("SERVER_PORT");
        iframe.setAttribute("src","http://"+server_adress+":"+server_port+"/mi_kit_pdf/pdf.js/web/viewer.html?file=pdf/"+folder+"/"+fileName+".pdf");
        container.appendChild(iframe);
    }*/
}
function fixPdf(iframe)
{
    var scrollbarIframe = document.createElement("link");
    scrollbarIframe.href = "css/scrollbarIframe.css"; 
    scrollbarIframe.rel = "stylesheet"; 
    scrollbarIframe.type = "text/css"; 
    iframe.contentWindow.document.head.appendChild(scrollbarIframe);

    iframe.contentWindow.document.body.style.backgroundColor="transparent";
    iframe.contentWindow.document.body.style.backgroundImage="none";

    iframe.contentWindow.document.getElementById("sidebarContainer").style.display="none";
    iframe.contentWindow.document.getElementById("secondaryToolbar").style.display="none";
    iframe.contentWindow.document.getElementsByClassName("toolbar")[0].style.display="none";

    iframe.contentWindow.document.getElementById("viewerContainer").style.top="0px";
    iframe.contentWindow.document.getElementById("viewerContainer").style.bottom="0px";
    iframe.contentWindow.document.getElementById("viewerContainer").style.left="0px";
    iframe.contentWindow.document.getElementById("viewerContainer").style.right="0px";

    iframe.contentWindow.document.getElementById("viewer").style.margin="10px";
    iframe.contentWindow.document.getElementById("viewer").style.width="calc(100% - 40px)";
    iframe.contentWindow.document.getElementById("viewer").style.height="calc(100% - 40px)";
}
function getCabineECorridoi(lotto,commessa)
{
    return new Promise(function (resolve, reject) 
    {
        var id_turno=turno.id_turno;
        var id_linea=linea.id_linea;
        $.get("getCabineECorridoi.php",
        {
            lotto,
            commessa,
            id_turno,
            id_linea,
            filtroAvanzamento
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
function getLotti()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getLotti.php",
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
async function stampaEtichettaCarrello()
{
    Swal.fire
    ({
        title: "Caricamento in corso... ",
        background:"transparent",
        html: '<i style="color:white" class="fad fa-spinner-third fa-spin fa-4x"></i>',
        showConfirmButton:false,
        showCloseButton:false,
        allowEscapeKey:false,
        allowOutsideClick:false,
        onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="white";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";document.getElementsByClassName("swal2-close")[0].style.outline="none";}
    });

    var server_adress=await getServerValue("SERVER_ADDR");
    var server_port=await getServerValue("SERVER_PORT");
    
    var testiEtichette=await getTestiEtichetta();
    const carrello = await getCarrelloCabinaCommessa(cabina_corridoioSelezionato.numero_cabina,lottoSelezionato.commessa.substring(2, 6));
    var commessa_breve=carrello.substring(0, 4);
    var descrizioneCarrello=await getDescrizioniCarrelli(commessa_breve);
    if(descrizioneCarrello.length==0)
    {
        Swal.fire
        ({
            icon:"error",
            title: "Errore. Descrizioni commessa "+commessa_breve+" mancanti",
            onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}
        });
    }
    else
    {
        var height = 14.5;
        var width = 10
        var body_vertical_padding = 0.15;
        var body_horizontal_padding = 0.35;
        var pages_space = 10;
    
        var printWindow = window.open('', '_blank', 'height=1080,width=1920');
    
        printWindow.document.body.setAttribute("onafterprint","window.close();");
    
        printWindow.document.body.style.backgroundColor="white";
        printWindow.document.body.style.overflow="hidden";
        printWindow.document.body.style.paddingTop=body_vertical_padding+"cm";
        printWindow.document.body.style.paddingLeft=body_horizontal_padding+"cm";
        printWindow.document.body.style.boxSizing="border-box";
    
        var link=document.createElement("link");
        link.setAttribute("href","http://"+server_adress+":"+server_port+"/mi_kit_linea/css/etichettaCarrello.css");
        link.setAttribute("rel","stylesheet");
        printWindow.document.head.appendChild(link);
    
        var link=document.createElement("link");
        link.setAttribute("href","http://"+server_adress+":"+server_port+"/mi_kit_linea/css/fonts.css");
        link.setAttribute("rel","stylesheet");
        printWindow.document.head.appendChild(link);
    
        var testo_cantiere=getFirstObjByPropValue(testiEtichette,"nome","testo_cantiere");
        var testo_costruzione=getFirstObjByPropValue(testiEtichette,"nome","testo_costruzione");
        var testo_carrello=getFirstObjByPropValue(testiEtichette,"nome","testo_carrello");
        var testo_descrizione_carrello=getFirstObjByPropValue(testiEtichette,"nome","testo_descrizione_carrello");
        var testo_colonna_quantita=getFirstObjByPropValue(testiEtichette,"nome","testo_colonna_quantita");
        var testo_misure_carrello=getFirstObjByPropValue(testiEtichette,"nome","testo_misure_carrello");
        var testo_colonna_numero=getFirstObjByPropValue(testiEtichette,"nome","testo_colonna_numero");
        var testo_colonna_codice=getFirstObjByPropValue(testiEtichette,"nome","testo_colonna_codice");
        var testo_apertura_carrelli=getFirstObjByPropValue(testiEtichette,"nome","testo_apertura_carrelli");
        var testo_indicazioni=getFirstObjByPropValue(testiEtichette,"nome","testo_indicazioni");
    
        var cantiere=getFirstObjByPropValue(descrizioneCarrello,"nome","cantiere");
        cantiere.descrizione.replace(/\r?\n/g, "<br />");
        var costruzione=getFirstObjByPropValue(descrizioneCarrello,"nome","costruzione");
        var misure=getFirstObjByPropValue(descrizioneCarrello,"nome","misure");
    
        var outerContainer=document.createElement("div");
        outerContainer.setAttribute("class","etichetta-outer-container");
        outerContainer.setAttribute("style","height: "+height+"cm;width: "+width+"cm;");
        var id_carrello=carrello.replace("+","");
        outerContainer.setAttribute("id","outerContainer"+id_carrello);
    
        var logoContainer=document.createElement("div");
        logoContainer.setAttribute("style","display:flex;align-items:center;justify-content:center;width:100%;height: 13%;max-height: 13%;min-height: 13%");
        var logo=document.createElement("img");
        logo.setAttribute("src","http://"+server_adress+":"+server_port+"/mi_kit_linea/images/logoCabins.png");
        logoContainer.appendChild(logo);
        outerContainer.appendChild(logoContainer);
    
        var div=document.createElement("div");
        div.setAttribute("style","height:7%;max-height: 7%;min-height: 7%;width:100%;overflow:hidden;display:flex;align-items:center;justify-content:center");
        var barcode=document.createElement("span");
        barcode.setAttribute("class","etichetta-barcode");
        barcode.setAttribute("style","");
        barcode.innerHTML="*"+carrello+"*";
        div.appendChild(barcode);
        outerContainer.appendChild(div);
    
        var div=document.createElement("div");
        div.setAttribute("class","etichetta-column");
        div.setAttribute("style","height:8%;max-height: 8%;min-height: 8%;width:100%");
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","height:45%;font-size:18px;width:100%;border-top:1px solid black;border-left:1px solid black;border-right:1px solid black;display:flex;align-items:center;justify-content:center");
        span.innerHTML=testo_misure_carrello.testo;
        div.appendChild(span);
        
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","height:55%;font-size:24px;font-weight:bold;width:100%;border-top:1px solid black;border-bottom:1px solid black;border-left:1px solid black;border-right:1px solid black;display:flex;align-items:center;justify-content:center");
        span.innerHTML=misure.descrizione;
        div.appendChild(span);
    
        outerContainer.appendChild(div);
    
        var spanRow=document.createElement("div");
        spanRow.setAttribute("class","etichetta-row");
        spanRow.setAttribute("style","height:15%;max-height: 15%;min-height: 15%;border-top:1px solid black;border-bottom:1px solid black;border-left:1px solid black;border-right:1px solid black;align-items:center;justify-content:flex-start;flex-direction:column");
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","border-bottom:1px solid black;font-size:18px;width:100%;box-sizing:border-box");
        span.innerHTML=testo_cantiere.testo;
        spanRow.appendChild(span);
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","font-size:15px;font-weight:bold;width:100%;box-sizing:border-box");
        span.innerHTML=cantiere.descrizione;
        spanRow.appendChild(span);
    
        outerContainer.appendChild(spanRow);
    
        var spanRow=document.createElement("div");
        spanRow.setAttribute("class","etichetta-row");
        spanRow.setAttribute("style","height:7%;max-height: 7%;min-height: 7%;border-bottom:1px solid black;border-left:1px solid black;border-right:1px solid black;align-items:center;justify-content:space-evenly;box-sizing:border-box;");
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","font-size:18px;");
        span.innerHTML=testo_costruzione.testo;
        spanRow.appendChild(span);
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","font-size:30px;font-weight:bold;");
        span.innerHTML=costruzione.descrizione;
        spanRow.appendChild(span);
    
        outerContainer.appendChild(spanRow);
    
        var spanRow=document.createElement("div");
        spanRow.setAttribute("class","etichetta-row");
        spanRow.setAttribute("style","height:7%;max-height: 7%;min-height: 7%;border-bottom:1px solid black;border-left:1px solid black;border-right:1px solid black;align-items:center;justify-content:space-evenly;box-sizing:border-box;");
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","font-size:18px;");
        span.innerHTML=testo_carrello.testo;
        spanRow.appendChild(span);
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","font-size:30px;font-weight:bold;");
        span.innerHTML=carrello;
        spanRow.appendChild(span);
    
        outerContainer.appendChild(spanRow);
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","height:4%;max-height: 4%;min-height: 4%;font-size:18px;width:100%;border-top:1px solid black;border-left:1px solid black;border-right:1px solid black;align-items:center;justify-content:center;box-sizing:border-box;");
        span.innerHTML=testo_descrizione_carrello.testo;
        outerContainer.appendChild(span);
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","height:7%;max-height: 7%;min-height: 7%;font-size:30px;font-weight:bold;width:100%;border-top:1px solid black;border-bottom:1px solid black;border-left:1px solid black;border-right:1px solid black;align-items:center;justify-content:center;box-sizing:border-box;");
        var descrizioneCarrelloEng=await getDescrizioneCarrello(carrello);
        descrizioneCarrelloEng=descrizioneCarrelloEng.replace("Carrello","Trolley");
        descrizioneCarrelloEng=descrizioneCarrelloEng.replace("Carello","Trolley");
        descrizioneCarrelloEng=descrizioneCarrelloEng.replace("Ponte","Deck");
        descrizioneCarrelloEng=descrizioneCarrelloEng.replace("Corridoio","Corridor");
        descrizioneCarrelloEng=descrizioneCarrelloEng.replace("corridoio","Corridor");
        descrizioneCarrelloEng=descrizioneCarrelloEng.replace("cabine","cabins");
        descrizioneCarrelloEng=descrizioneCarrelloEng.replace("Pref","PRF");
        span.innerHTML=descrizioneCarrelloEng;
        outerContainer.appendChild(span);
    
        var tableCabine=document.createElement("table");
        tableCabine.setAttribute("class","etichetta-table-cabine");
        tableCabine.setAttribute("style","max-height: 45%;");
    
        var tr=document.createElement("tr");
    
        var th=document.createElement("th");
        th.innerHTML=testo_colonna_quantita.testo;
        tr.appendChild(th);
    
        var th=document.createElement("th");
        th.innerHTML=testo_colonna_numero.testo;
        tr.appendChild(th);
    
        var th=document.createElement("th");
        th.innerHTML=testo_colonna_codice.testo;
        tr.appendChild(th);
    
        tableCabine.appendChild(tr);
    
        var cabine=await getCabineCarrello(carrello);
    
        var i=0;
        
        cabine.forEach(function(cabina)
        {
            if(i<3)
            {
                var tr=document.createElement("tr");
    
                var td=document.createElement("td");
                td.innerHTML=cabina.QNT;
                tr.appendChild(td);
    
                var td=document.createElement("td");
                td.innerHTML=cabina.NCAB;
                tr.appendChild(td);
    
                var td=document.createElement("td");
                td.innerHTML=cabina.CODCAB;
                tr.appendChild(td);
    
                tableCabine.appendChild(tr);
            }
            
            i++;
        });
    
        outerContainer.appendChild(tableCabine);
    
        printWindow.document.body.appendChild(outerContainer);
    
        var outerContainer=document.createElement("div");
        outerContainer.setAttribute("class","etichetta-outer-container");
        outerContainer.setAttribute("style","height: "+height+"cm;width: "+width+"cm;margin-top:"+pages_space+"mm");
    
        var row=document.createElement("div");
        row.setAttribute("class","etichetta-row");
        row.setAttribute("style","box-sizing:border-box;padding:5mm");
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","font-size:24px;text-align:left;font-weight:bold;box-sizing:border-box");
        span.innerHTML = testo_indicazioni.testo.replace(/\r?\n/g, "<br />");
        row.appendChild(span);
    
        outerContainer.appendChild(row);
    
        var row=document.createElement("div");
        row.setAttribute("class","etichetta-row");
        row.setAttribute("style","box-sizing:border-box;padding:5mm;border-top:1px solid black;box-sizing:border-box;");
    
        var span=document.createElement("span");
        span.setAttribute("class","etichetta-span");
        span.setAttribute("style","font-size:13px;text-align:left;font-weight:bold");
        span.innerHTML = testo_apertura_carrelli.testo.replace(/\r?\n/g, "<br />");
        row.appendChild(span);
    
        outerContainer.appendChild(row);

        var script=document.createElement("script");
        script.innerHTML="setTimeout(function(){window.print();}, 800);";
        outerContainer.appendChild(script);
    
        printWindow.document.body.appendChild(outerContainer);
    
        Swal.close();
    }
}
async function stampaEtichettaKit(printListLcl)
{
    if(printListLcl.length>0)
    {
        var server_adress=await getServerValue("SERVER_ADDR");
        var server_port=await getServerValue("SERVER_PORT");

        var height = 8.5;
        var width = 13.5;
        var item_height = 2.5;
        var item_margin_bottom = 0.5;
        var body_vertical_padding = 0.15;
        var body_horizontal_padding = 0.35;

		var printWindow = window.open('', '_blank', 'height=1080,width=1920');

        printWindow.document.body.setAttribute("onafterprint","window.close();");

        printWindow.document.body.style.backgroundColor="white";
        printWindow.document.body.style.overflow="hidden";
        printWindow.document.body.style.paddingTop=body_vertical_padding+"cm";
        printWindow.document.body.style.paddingLeft=body_horizontal_padding+"cm";
        printWindow.document.body.style.boxSizing="border-box";

        var link=document.createElement("link");
        link.setAttribute("href","http://"+server_adress+":"+server_port+"/mi_kit_linea/css/fonts.css");
        link.setAttribute("rel","stylesheet");
        printWindow.document.head.appendChild(link);
        
        printListLcl.forEach(printObj =>
        {
            var outerContainer=document.createElement("div");
            outerContainer.setAttribute("style","display: flex;flex-direction: row;align-items: flex-start;justify-content: flex-start;height: "+item_height+"cm;width: "+width+"cm;border:.5mm solid black;box-sizing:border-box;margin-bottom:"+item_margin_bottom+"cm");

            var img=document.createElement("img");
            img.setAttribute("style","min-height:100%;max-height:100%;height:100%;box-sizing:border-box;transform: rotate(270deg) translate(0cm,5mm);object-fit: contain;margin-left: -7%;min-width: 2cm;max-width: 2cm;width: 2cm;");
            img.setAttribute("src","http://"+server_adress+":"+server_port+"/mi_kit_linea/images/logo_cabins.jpg");
            outerContainer.appendChild(img);

            var column=document.createElement("div");
            column.setAttribute("style","min-width:53%;max-width:53%;width:53%;min-height:100%;max-height:100%;height:100%;display: flex;flex-direction: column;align-items: center;justify-content: flex-start;border-right:.5mm solid black;border-left: .5mm solid black;box-sizing:border-box");
            
            var div=document.createElement("div");
            div.setAttribute("style","overflow:hidden;min-width:100%;max-width:100%;width:100%;min-height:60%;max-height:60%;height:60%;border-bottom:.5mm solid black;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","text-align:center;font-family: 'Libre Barcode 39', cursive;font-size: 11mm;padding-top: 1mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML="*"+printObj.kit+"*";
            div.appendChild(span);
            var span=document.createElement("span");
            span.setAttribute("style","text-align:center;font-family: 'Questrial', sans-serif;font-size:5mm;margin-top:-3mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML="<b>"+printObj.kit+"</b>";
            div.appendChild(span);
            column.appendChild(div);

            var div=document.createElement("div");
            div.setAttribute("style","overflow:hidden;min-width:100%;max-width:100%;width:100%;min-height:40%;max-height:40%;height:40%;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","text-align:center;font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML="cab <b>"+printObj.numero_cabina+"</b>";
            div.appendChild(span);
            column.appendChild(div);
            
            outerContainer.appendChild(column);
            
            var column=document.createElement("div");
            column.setAttribute("style","min-width:16%;max-width:16%;width:16%;min-height:100%;max-height:100%;height:100%;display: flex;flex-direction: column;align-items: center;justify-content: flex-start;border-right:.5mm solid black;box-sizing:border-box");
            
            var div=document.createElement("div");
            div.setAttribute("style","overflow:hidden;min-width:100%;max-width:100%;width:100%;min-height:20%;max-height:20%;height:20%;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","text-align:center;font-family: 'Questrial', sans-serif;font-size:2.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML="pos. montaggio";
            div.appendChild(span);
            column.appendChild(div);

            var div=document.createElement("div");
            div.setAttribute("style","overflow:hidden;min-width:100%;max-width:100%;width:100%;min-height:80%;max-height:80%;height:80%;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","text-align:center;font-family: 'Questrial', sans-serif;font-size:9mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=printObj.posizione;
            div.appendChild(span);
            column.appendChild(div);
            
            outerContainer.appendChild(column);
            
            var column=document.createElement("div");
            column.setAttribute("style","min-width:18%;max-width:18%;width:18%;min-height:100%;max-height:100%;height:100%;display: flex;flex-direction: column;align-items: center;justify-content: flex-start;border-right:.5mm solid black;box-sizing:border-box");
            
            var div=document.createElement("div");
            div.setAttribute("style","overflow:hidden;min-width:100%;max-width:100%;width:100%;min-height:30%;max-height:30%;height:30%;border-bottom:.5mm solid black;display:flex;flex-direction:row;align-items:flex-start;justify-content:flex-start;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","min-height:100%;max-height:100%;height:100%;min-width:50%;max-width:50%;width:50%;text-align:left;font-family: 'Questrial', sans-serif;font-size:6mm;white-space: nowrap;overflow: hidden;text-overflow: clip;border-right:.5mm solid black;");
            span.innerHTML="B0";
            div.appendChild(span);
            var span=document.createElement("span");
            span.setAttribute("style","min-height:100%;max-height:100%;height:100%;min-width:50%;max-width:50%;width:50%;text-align:left;font-family: 'Questrial', sans-serif;font-size:6mm;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML="B15";
            div.appendChild(span);
            column.appendChild(div);

            var div=document.createElement("div");
            div.setAttribute("style","overflow:hidden;min-width:100%;max-width:100%;width:100%;min-height:70%;max-height:70%;height:70%;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box");
            var img=document.createElement("img");
            img.setAttribute("style","min-width:60%;max-width:60%;width:60%;min-height:80%;max-height:80%;height:80%;box-sizing:border-box;object-fit: cover");
            img.setAttribute("src","http://"+server_adress+":"+server_port+"/mi_kit_linea/images/timone.png");
            div.appendChild(img);
            column.appendChild(div);

            outerContainer.appendChild(column);
            
            var column=document.createElement("div");
            column.setAttribute("style","min-width:5%;max-width:5%;width:5%;min-height:100%;max-height:100%;height:100%;display: flex;flex-direction: column;align-items: center;justify-content: flex-start;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","text-align:center;font-family: 'Questrial', sans-serif;font-size:4mm;white-space: nowrap;overflow: hidden;text-overflow: clip;transform: rotate(270deg) translate(-50%);");
            var d = new Date();
            var n = d.getFullYear();
            span.innerHTML="0474/"+n;
            column.appendChild(span);
            outerContainer.appendChild(column);

            var script=document.createElement("script");
            script.innerHTML="setTimeout(function(){window.print();}, 800);";
            outerContainer.appendChild(script);
    
            printWindow.document.body.appendChild(outerContainer);
        });
    }
}
async function getPopupRaggruppamentoTraversine()
{
    popupRaggruppamentoTraversine=true;
    Swal.fire
    ({
        title: "Caricamento in corso... ",
        background:"transparent",
        html: '<i style="color:white" class="fad fa-spinner-third fa-spin fa-4x"></i>',
        showConfirmButton:false,
        showCloseButton:false,
        allowEscapeKey:false,
        allowOutsideClick:false,
        onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="white";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";document.getElementsByClassName("swal2-close")[0].style.outline="none";}
    });

    var data=await getRaggruppamentoTraversine(kit);

    var outerContainer=document.createElement("div");
    outerContainer.setAttribute("class","raggruppamento-traversine-outer-container");

    var tableContainer=document.createElement("div");
    tableContainer.setAttribute("class","raggruppamento-traversine-table-container");

    var headers=
    [
        {
            value:"LUNG",
            label:"LUNG"
        },
        {
            value:"CODMAT",
            label:"CODMAT"
        },
        {
            value:"n_kit",
            label:"N. kit"
        },
        {
            value:"kit",
            label:"Kit"
        }
    ];
    
    var raggruppamentoTraversineTable=document.createElement("table");
    raggruppamentoTraversineTable.setAttribute("id","raggruppamentoTraversineTable");

    var thead=document.createElement("thead");
    var tr=document.createElement("tr");
    headers.forEach(function (header)
    {
        var th=document.createElement("th");
        th.setAttribute("class","raggruppamentoTraversineTableCell"+header.value);
        th.innerHTML=header.label;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    raggruppamentoTraversineTable.appendChild(thead);

    var tbody=document.createElement("tbody");
    var i=0;
    data.forEach(function (row)
    {
        var tr=document.createElement("tr");
        headers.forEach(function (header)
        {
            var td=document.createElement("td");
            td.setAttribute("class","raggruppamentoTraversineTableCell"+header.value);
            if(raggruppamentoTraversine=="LUNG" && header.value=="LUNG")
                td.innerHTML=row[header.value].toFixed(2);
            else
            {
                if(header.value=="kit")
                    td.innerHTML=row[header.value].join(", ");
                else
                    td.innerHTML=row[header.value];
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
        i++;
    });
    raggruppamentoTraversineTable.appendChild(tbody);

    tableContainer.appendChild(raggruppamentoTraversineTable);

    outerContainer.appendChild(tableContainer);

    Swal.fire
    ({
        html: outerContainer.outerHTML,
        showConfirmButton:false,
        width:"70%",
        showCloseButton:false,
        allowEscapeKey:true,
        allowOutsideClick:true,
        onOpen : function()
                {
                    document.getElementsByClassName("swal2-title")[0].remove();
                    document.getElementsByClassName("swal2-popup")[0].style.padding="0px";
                    document.getElementsByClassName("swal2-popup")[0].style.borderRadius="4px";
					
					try
					{
						document.getElementsByClassName("swal2-popup")[0].addEventListener("keydown", async function(event)
						{
							var keyCode=event.keyCode;
							switch (keyCode) 
							{
								case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_giu_di_1").valore):
									event.preventDefault();
									document.getElementsByClassName("raggruppamento-traversine-table-container")[0].scroll(0,document.getElementsByClassName("raggruppamento-traversine-table-container")[0].scrollTop+50)
								break;
								case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_su_di_1").valore):
									event.preventDefault();
									document.getElementsByClassName("raggruppamento-traversine-table-container")[0].scroll(0,document.getElementsByClassName("raggruppamento-traversine-table-container")[0].scrollTop-50)
								break;
							}
						});
					} catch (error) {}
                }
    }).then((result) => 
    {
        popupRaggruppamentoTraversine=false;
    });
}
function fixTableRaggruppamentoTraversine()
{
    try
    {
        var tableWidth=document.getElementById("raggruppamentoTraversineTable").offsetWidth;
		var tableColWidth=tableWidth/document.getElementById("raggruppamentoTraversineTable").getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].childElementCount;
        
        $("#raggruppamentoTraversineTable th").css({"width":tableColWidth+"px"});
        $("#raggruppamentoTraversineTable td").css({"width":tableColWidth+"px"});
    } catch (error) {}
}
function getRaggruppamentoTraversine(kit)
{
    return new Promise(function (resolve, reject) 
    {
        var JSONkit=JSON.stringify(kit);
        $.post("getRaggruppamentoTraversine.php",
        {
            JSONkit/*,
            raggruppamentoTraversine*/
        },
        function(response, status)
        {
			//console.log(response);
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
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
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
                resolve([]);
            }
        });
    });
}
function checkRegistrazioniKitStazioni()
{
    return new Promise(function (resolve, reject) 
    {
        var JSONkit=JSON.stringify(kit);
        $.post("checkRegistrazioniKitStazioni.php",{lotto:lottoSelezionato.lotto,cabina:cabina_corridoioSelezionato.numero_cabina,kit:kitSelezionato.kit},
        function(response, status)
        {
			//console.log(response);
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
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
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
                resolve(false);
            }
        });
    });
}
function getTestiEtichetta()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getTestiEtichettaCarrello.php",
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    console.log(response);
                    resolve([]);
                }
                else
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
            }
            else
                resolve([]);
        });
    });
}
function getCarrelloCabinaCommessa(numero_cabina,commessa)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getCarrelloCabinaCommessa.php",{numero_cabina,commessa},
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    console.log(response);
                    resolve("");
                }
                else
                    resolve(response);
            }
        });
    });
}
function getDescrizioneCarrello(carrello)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getDescrizioneCarrelloStampaEtichetta.php",{carrello},
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    console.log(response);
                    resolve("");
                }
                else
                    resolve(response);
            }
        });
    });
}
function getDescrizioniCarrelli(commessa_breve)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getDescrizioniCarrelliStampaEtichetta.php",{commessa_breve},
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    console.log(response);
                    resolve([]);
                }
                else
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
            }
        });
    });
}
function getCabineCarrello(carrello)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getCabineCarrelloStampaEtichetta.php",{carrello},
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    console.log(response);
                    resolve([]);
                }
                else
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
            }
        });
    });
}
function sendStampaEtichettaKit()
{
    var message = 
    {
        linea:linea.nome,
        printList:printList
    }

    socket.emit('message', message);

    printList=[];
}
function checkItemScroll(event,item)
{
    /*event.preventDefault();

    var container = item.parentElement;

    var oldScroll = container.scrollTop;
    item.focus();
    container.oldScroll = oldScroll;

    console.log(isElementInViewport(item))*/
}
function isElementInViewport(el)
{
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}