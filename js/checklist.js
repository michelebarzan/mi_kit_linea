var lotti,carrelli,componenti;
var lottoSelezionato,carrelloSelezionato;
var view;
var iframe;
var turno;
var linea;
var stazione;
var id_utente;
var interval;
var frequenza_aggiornamento_dati_linea;
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

    /*filtro=await getCookie("filtro");
    if(filtro=="")
        filtro="attivo";
    setFiltroLabel();*/

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

    getListLotti();
    
    //interval = setInterval(checkLists, frequenza_aggiornamento_dati_linea);

});
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
function checkLists()
{
    switch (view)
    {
        case "lotti":getListLotti();break;
        case "carrelli":getListCarrelli();break;
        /*case "kit":if(mostraMisureTraversine=="false"){getListKit(false)};break;*/
        default:break;
    }
}
async function getListLotti()
{
    view="lotti";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    lottoSelezionato=null;
    document.getElementById("labelLottoSelezionato").innerHTML="Scegli un lotto";
    carrelloSelezionato=null;
    document.getElementById("labelCarrelloSelezionato").innerHTML="Scegli un carrello";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>'

    var i=1;
    lotti=await getLotti();

    container.innerHTML="";

    lotti.forEach(function (lotto)
    {
        var item=document.createElement("button");
        item.setAttribute("class","lotti-item");
        item.setAttribute("id","lottiItem"+lotto.id_lotto);
        item.setAttribute("onclick","selectLotto("+lotto.id_lotto+")");

        var span=document.createElement("span");
        span.innerHTML=lotto.lotto;
        item.appendChild(span);

        container.appendChild(item);

        i++;
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
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
        });
    });
}
function selectLotto(id_lotto)
{
    lottoSelezionato=getFirstObjByPropValue(lotti,"id_lotto",id_lotto);
    document.getElementById("labelLottoSelezionato").innerHTML="Lotto <b>"+lottoSelezionato.lotto+"</b>";

    getListCarrelli();
}
async function getListCarrelli()
{
    view="carrelli";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    carrelloSelezionato=null;
    document.getElementById("labelCarrelloSelezionato").innerHTML="Scegli un carrello";

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>'

    var i=1;
    carrelli=await getCarrelli(lottoSelezionato.lotto,lottoSelezionato.commessa);

    container.innerHTML="";

    carrelli.forEach(function (carrello)
    {
        var item=document.createElement("button");
        item.setAttribute("class","carrelli-item");
        item.setAttribute("onclick","selectCarrello('"+carrello.id_CODCAR+"')");
        item.setAttribute("id","carrelliItem"+carrello.id_CODCAR);

        var span=document.createElement("span");
        span.innerHTML=carrello.CODCAR;
        item.appendChild(span);

        container.appendChild(item);

        i++;
    });
}
function getCarrelli(lotto,commessa)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getCarrelli.php",{lotto,commessa},
        function(response, status)
        {
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
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
        });
    });
}
function selectCarrello(id_CODCAR)
{
    carrelloSelezionato=getFirstObjByPropValue(carrelli,"id_CODCAR",id_CODCAR);
        document.getElementById("labelCarrelloSelezionato").innerHTML=`Carrello <b>`+carrelloSelezionato.CODCAR+`</b>`;

    getListComponenti();
}
async function getListComponenti()
{
    view="componenti";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    componenteSelezionato=null;

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>'

    var i=1;
    componenti=await getComponenti(carrelloSelezionato.CODCAR,lottoSelezionato.lotto);
    console.log(componenti);

    container.innerHTML="";

    componenti.forEach(function (componente)
    {
        var item=document.createElement("button");
        item.setAttribute("class","componenti-item");
        item.setAttribute("onclick","this.getElementsByTagName('input')[0].checked=!this.getElementsByTagName('input')[0].checked;checkComponente('"+componente.codice_componente+"',"+componente.id_checklist+")");
        item.setAttribute("id","componentiItem"+componente.id_checklist);

        var column=document.createElement("div");
        column.setAttribute("style","height:100%;display:flex;align-items:center;justify-content:center;width:50px");

        var checkbox=document.createElement("input");
        checkbox.setAttribute("type","checkbox");
        checkbox.setAttribute("id","checkboxComponente_"+componente.id_checklist);
        checkbox.setAttribute("onclick","disableCheckboxComponente(event);checkComponente('"+componente.codice_componente+"',"+componente.id_checklist+")");
        checkbox.setAttribute("style","margin:0px");
        column.appendChild(checkbox);

        item.appendChild(column);

        var column=document.createElement("div");
        column.setAttribute("style","height:100%;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;width:calc(100% - 100px)");

        var row=document.createElement("div");
        row.setAttribute("style","display:flex;flex-direction:row;align-items:center;justify-content:flex-start;width:100%;height:50%");

        var span=document.createElement("span");
        span.innerHTML=componente.codice_componente;
        row.appendChild(span);

        var span=document.createElement("span");
        span.setAttribute("style","margin-left:auto;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;margin-right:10px");
        span.innerHTML=componente.descrizione;
        row.appendChild(span);

        column.appendChild(row);

        var row=document.createElement("div");
        row.setAttribute("style","display:flex;flex-direction:row;align-items:center;justify-content:flex-start;width:100%;height:50%");

        var span=document.createElement("span");
        span.innerHTML=componente.numero_cabina;
        row.appendChild(span);

        var span=document.createElement("span");
        span.setAttribute("style","margin-left:auto;margin-right:10px");
        span.innerHTML=componente.posizione;
        row.appendChild(span);

        column.appendChild(row);

        item.appendChild(column);

        var column=document.createElement("div");
        column.setAttribute("style","width:50px;height:100%;display:flex;align-items:center;justify-content:center;background-color:#242424;border-top-right-radius:4px;border-bottom-right-radius:4px;");

        var span=document.createElement("span");
        span.innerHTML=componente.qnt;
        column.appendChild(span);

        item.appendChild(column);

        container.appendChild(item);

        i++;
    });
}
function disableCheckboxComponente(event)
{
    event.stopPropagation();
}
function checkComponente(codice_componente,id_checklist)
{
    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    if(codice_componente.charAt(0)=="+" && codice_componente.substring(3, 5)=="KT")
        getPdf('kit',codice_componente);
    
    var checked=document.getElementById("checkboxComponente_"+id_checklist).checked.toString();
    $.get("checkComponente.php",{id_checklist,checked,id_utente},
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
            }
        }
    });
}
function getComponenti(CODCAR,lotto)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getComponenti.php",{CODCAR,lotto},
        function(response, status)
        {
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
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
        });
    });
}
function indietro()
{
    switch (view)
    {
        case "lotti":logout();break;
        case "carrelli":getListLotti();break;
        case "componenti":getListCarrelli();break;
        default:break;
    }
}
function logout()
{
    $.get("logout.php",
    function(response, status)
    {
        window.location = 'login.html';
    });
}
async function getPdf(folder,fileName)
{
    if(fileName != shownPdf)
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
    }
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