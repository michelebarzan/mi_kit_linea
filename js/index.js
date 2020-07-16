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
var filtroLinea;
var filtroStazione;
var filtroAvanzamento;
var turno;
var linea;
var stazione;
var id_utente;
var interval;
var frequenza_aggiornamento_dati_linea
var dot;
var shownPdf;

window.addEventListener("load", async function(event)
{
    id_utente=await getSessionValue("id_utente");

    frequenza_aggiornamento_dati_linea=await getParametro("frequenza_aggiornamento_dati_linea");
    frequenza_aggiornamento_dati_linea=parseInt(frequenza_aggiornamento_dati_linea);

    var nome_turno=await getSessionValue("turno");
    var nome_linea=await getSessionValue("linea");
    var nome_stazione=await getSessionValue("stazione");

    var turni=await getAnagraficaTurni();
    var linee=await getAnagraficaLinee();
    var stazioni=await getAnagraficaStazioni();

    turno=getFirstObjByPropValue(turni,"nome",nome_turno);
    stazione=getFirstObjByPropValue(stazioni,"nome",nome_stazione);
    linea=getFirstObjByPropValue(linee,"nome",nome_linea);

    console.log(turno);

    ordinamentoKit=await getCookie("ordinamentoKit");
    if(ordinamentoKit=="")
        ordinamentoKit="kit";
    //setOrdinamentoKitLabel();

    mostraMisureTraversine=await getCookie("mostraMisureTraversine");
    if(mostraMisureTraversine=="")
        mostraMisureTraversine="false";
    //setMostraMisureTraversineLabel();

    filtroLinea=await getCookie("filtroLinea");
    if(filtroLinea=="")
        filtroLinea="attivo";
    setFiltroLineaLabel();

    filtroStazione=await getCookie("filtroStazione");
    if(filtroStazione=="")
        filtroStazione="attivo";
    setFiltroStazioneLabel();

    filtroAvanzamento=await getCookie("filtroAvanzamento");
    if(filtroAvanzamento=="")
        filtroAvanzamento="attivo";
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

    getListLotti(true);

    funzioniTasti=await getFunzioniTasti();
    
    interval = setInterval(checkLists, frequenza_aggiornamento_dati_linea);

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
                resolve(JSON.parse(response));
            }
            else
                reject({status});
        });
    });
}
function checkLists()
{
    switch (view)
    {
        case "lotti":getListLotti(false);break;
        case "cabine_corridoi":getListCabineECorridoi(false);break;
        case "kit":if(mostraMisureTraversine=="false"){getListKit(false)};break;
        default:break;
    }
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
function setFiltroLineaLabel()
{
    document.getElementById("filtroLineaContainer").innerHTML="Filtro linea "+filtroLinea;
    if(filtroLinea=="attivo")
        document.getElementById("filtroLineaContainer").style.color="#4C91CB";
    if(filtroLinea=="inattivo")
        document.getElementById("filtroLineaContainer").style.color="#DA6969";
}
function setFiltroStazioneLabel()
{
    document.getElementById("filtroStazioneContainer").innerHTML="Filtro stazione "+filtroStazione;
    if(filtroStazione=="attivo")
        document.getElementById("filtroStazioneContainer").style.color="#4C91CB";
    if(filtroStazione=="inattivo")
        document.getElementById("filtroStazioneContainer").style.color="#DA6969";
}
function setFiltroAvanzamentoLabel()
{
    document.getElementById("filtroAvanzamentoContainer").innerHTML="Filtro avanzamento "+filtroAvanzamento;
    if(filtroAvanzamento=="attivo")
        document.getElementById("filtroAvanzamentoContainer").style.color="#4C91CB";
    if(filtroAvanzamento=="inattivo")
        document.getElementById("filtroAvanzamentoContainer").style.color="#DA6969";
}
function toggleFiltroLinea()
{
    if(filtroLinea=="attivo")
        filtroLinea="inattivo";
    else
        filtroLinea="attivo";

    setCookie("filtroLinea",filtroLinea);
    setFiltroLineaLabel();

    if(view=="cabine_corridoi" || view=="kit")
        getListCabineECorridoi(true);
}
function toggleFiltroStazione()
{
    if(filtroStazione=="attivo")
        filtroStazione="inattivo";
    else
        filtroStazione="attivo";

    setCookie("filtroStazione",filtroStazione);
    setFiltroStazioneLabel();

    if(view=="kit")
        getListKit(true);
    if(view=="cabine_corridoi")
        getListCabineECorridoi(true);
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
                resolve(JSON.parse(response));
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
window.addEventListener("keydown", function(event)
{
    clearInterval(interval);
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
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_ordinamento").valore):
            event.preventDefault();
            if(view=="kit")
            {
                if(ordinamentoKit=="kit")
                    ordinamentoKit="posizione";
                else
                    ordinamentoKit="kit";
                //setOrdinamentoKitLabel();
                getListKit(false);
            }
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_filtro_linea").valore):
            event.preventDefault();
            toggleFiltroLinea();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_filtro_stazione").valore):
            event.preventDefault();
            toggleFiltroStazione();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","cambia_filtro_avanzamento").valore):
            event.preventDefault();
            toggleFiltroAvanzamento();
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_giu_di_1").valore):
            event.preventDefault();
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
        break;
        case parseInt(getFirstObjByPropValue(funzioniTasti,"nome","scorri_su_di_1").valore):
            event.preventDefault();
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
                        shownPdf=null;confermaKit(focused);
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
        default:break;
    }
    interval = setInterval(checkLists, frequenza_aggiornamento_dati_linea);
});
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

    $.get("eliminaRegistrazioneAvanzamentoKit.php",
    {
        lotto,
        cabina,
        posizione:kitSelezionato.posizione,
        id_stazione
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
                getListKit(true);
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
    console.clear();

    kitSelezionato=getFirstObjByPropValue(kit,"number",number);

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
                getListKit(true);
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
async function getListKit(cleanFocused)
{
    view="kit";

    document.getElementById("ordinamentoContainer").style.display="";
    setOrdinamentoKitLabel();

    setCookie("ordinamentoKit",ordinamentoKit);

    if(stazione.nome=="traversine")
    {
        document.getElementById("mostraMisureTraversineContainer").style.display="";
        setMostraMisureTraversineLabel();

        setCookie("mostraMisureTraversine",mostraMisureTraversine);
    }
    else
        document.getElementById("mostraMisureTraversineContainer").style.display="none";
    
    if(cleanFocused)
    {
        numbers_array[view]=[];
        focused=null;
        document.getElementById("inputNumber").value="";
        document.getElementById("pdfContainer").innerHTML="";
        iframe=null;
    }

    kitSelezionato=null;

    /*document.getElementById("pdfContainer").innerHTML="";
    iframe=null;*/

    var container=document.getElementById("listInnerContainer");
    container.innerHTML="";

    if(mostraMisureTraversine=="true")
        container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>'

    var i=1;
    kit=await getKit(lottoSelezionato.lotto,lottoSelezionato.commessa,cabina_corridoioSelezionato.numero_cabina);

    if(mostraMisureTraversine=="true")
        container.innerHTML="";

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
        item.setAttribute("onfocus","getPdf('kit','"+codiceKit+"')");
        item.setAttribute("id","kitItem"+kitItem.number);

        var div=document.createElement("div");
        div.innerHTML=number;
        item.appendChild(div);

        var span=document.createElement("span");
        span.innerHTML=kitItem["kit"];
        item.appendChild(span);

        var span=document.createElement("span");
        span.innerHTML="<u>Pos:</u> "+kitItem["posizione"];
        item.appendChild(span);

        if(filtroAvanzamento=="inattivo")
        {
            if(kitItem.registrato)
            {
                var fa=document.createElement("i");
                fa.setAttribute("class","fad fa-check-circle");
                fa.setAttribute("style","color:#70B085;margin-left:auto;margin-top:5px;margin-right:5px;font-size:15px");
                item.appendChild(fa);
            }
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

        container.appendChild(item);

        numbers_array[view].push(number);

        i++;
    });
    if(mostraMisureTraversine=="true")
    {
        var kitItems=document.getElementsByClassName("kit-item");
        for (let index = 0; index < kitItems.length; index++)
        {
            const kitItem = kitItems[index];
            var table=kitItem.getElementsByTagName("table")[0];
            var height=table.offsetHeight+35;
            kitItem.style.minHeight=height+"px";
        }
    }

    if(!cleanFocused && focused!=null)
    {
        document.getElementById(view+"Item"+focused).focus();   
    }
}
function getKit(lotto,commessa,numero_cabina)
{
    return new Promise(function (resolve, reject) 
    {
        var id_linea=linea.id_linea;
        var id_stazione=stazione.id_stazione;
        var id_stazione_precedente=stazione.stazione_precedente;
        $.get("getKit.php",
        {
            lotto,
            commessa,
            numero_cabina,
            filtroStazione,
            id_linea,
            id_stazione,
            id_stazione_precedente,
            filtroAvanzamento,
            ordinamentoKit,
            mostraMisureTraversine
        },
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
    view="lotti";

    document.getElementById("ordinamentoContainer").style.display="none";
    document.getElementById("mostraMisureTraversineContainer").style.display="none";
    
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
        //item.setAttribute("onclick","selectLotto("+lotto.number+")");

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
        document.getElementById(view+"Item"+focused).focus();   
    }
}
function selectLotto(number)
{
    lottoSelezionato=getFirstObjByPropValue(lotti,"number",number);
    document.getElementById("labelLottoSelezionato").innerHTML="Lotto <b>"+lottoSelezionato.lotto+"</b>";

    getListCabineECorridoi(true);
}
async function getListCabineECorridoi(cleanFocused)
{
    view="cabine_corridoi";

    document.getElementById("ordinamentoContainer").style.display="none";
    document.getElementById("mostraMisureTraversineContainer").style.display="none";

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
        item.setAttribute("onfocus","getPdf('cabine_corridoi','"+cabina_corridoio.numero_cabina+"')");
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
}
async function getPdf(folder,fileName)
{
    /*if(fileName != shownPdf)
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
        var id_stazione_precedente=stazione.stazione_precedente;
        $.get("getCabineECorridoi.php",
        {
            lotto,
            commessa,
            filtroLinea,
            filtroStazione,
            id_turno,
            id_linea,
            id_stazione_precedente,
            filtroAvanzamento
        },
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
function getLotti()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getLotti.php",
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
                resolve(JSON.parse(response));
            }
            else
                reject({status});
        });
    });
}
function chiudiKit()
{
    var tmp = prompt("kit", "");
    
    var tmpKit=getFirstObjByPropValue(kit,"kit",tmp);

    var lotto=lottoSelezionato.lotto;
    var cabina=cabina_corridoioSelezionato.numero_cabina;

    $.get("chiudiKit.php",
    {
        lotto,
        cabina,
        kit:tmpKit.kit,
        posizione:tmpKit.posizione
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
                console.log("kit chiuso");
                getListKit(true);
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