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
var intervalOverflowPdf1;
var intervalOverflowPdf2;

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
    
    //interval = setInterval(checkLists, frequenza_aggiornamento_dati_linea);
    
    Swal.close();
    
    getListLotti();
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

    document.getElementById("totaliChecklistLabel").style.display="none";

    lottoSelezionato=null;
    document.getElementById("labelLottoSelezionato").innerHTML="Scegli un lotto";
    carrelloSelezionato=null;
    document.getElementById("labelCarrelloSelezionato").innerHTML="Scegli un carrello";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>';

    document.getElementById("listButtonIndietro").disabled=true;

    var i=1;
    lotti=await getLotti();

    document.getElementById("listButtonIndietro").disabled=false;

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

    document.getElementById("totaliChecklistLabel").style.display="none";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    carrelloSelezionato=null;
    document.getElementById("labelCarrelloSelezionato").innerHTML="Scegli un carrello";

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>';

    document.getElementById("listButtonIndietro").disabled=true;

    var i=1;
    carrelli=await getCarrelli(lottoSelezionato.lotto,lottoSelezionato.commessa);

    document.getElementById("listButtonIndietro").disabled=false;

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

    document.getElementById("totaliChecklistLabel").style.display="";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    componenteSelezionato=null;

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>';

    document.getElementById("listButtonIndietro").disabled=true;

    var i=1;
    componenti=await getComponenti(carrelloSelezionato.CODCAR,lottoSelezionato.lotto);
    console.log(componenti);

    document.getElementById("listButtonIndietro").disabled=false;

    container.innerHTML="";

    var nComponentiChecked=0;
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
        if(componente.checked)
        {
            checkbox.setAttribute("checked","checked");
            nComponentiChecked++;
        }
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

    document.getElementById("totaliChecklistLabel").innerHTML=nComponentiChecked+"/"+componenti.length;
}
function disableCheckboxComponente(event)
{
    event.stopPropagation();
}
function checkComponente(codice_componente,id_checklist)
{
    if(codice_componente.charAt(0)=="+" && codice_componente.substring(3, 5)=="KT")
        getPdf('kit',codice_componente);
    else
    {
        document.getElementById("pdfContainer").innerHTML="";
        iframe=null;
        shownPdf=null;
    }
    
    var nComponentiChecked=0;
    var componentiItems=document.getElementsByClassName("componenti-item");
    for (let index = 0; index < componentiItems.length; index++)
    {
        const componenteItem = componentiItems[index];
        if(componenteItem.getElementsByTagName("input")[0].checked)
            nComponentiChecked++;
    }
    document.getElementById("totaliChecklistLabel").innerHTML=nComponentiChecked+"/"+componentiItems.length;

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
        //shownPdf=fileName;
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

    resetPdfZoom();
}
function resetPdfZoom()
{
    if(iframe!=null)
    {
        try {
            clearInterval(intervalOverflowPdf1);
        } catch (error) {}
        try {
            clearInterval(intervalOverflowPdf2);
        } catch (error) {}

        intervalOverflowPdf1 = setInterval(() => 
        {
            try {
                overflow=checkOverflow(iframe.contentWindow.document.getElementById("viewerContainer"));
            } catch (error) {
                overflow=true;
            }
            if(!overflow)
                pdfZoomin();
            else
            {
                clearInterval(intervalOverflowPdf1);
                intervalOverflowPdf2 = setInterval(() => 
                {
                    try {
                        overflow=checkOverflow(iframe.contentWindow.document.getElementById("viewerContainer"));
                    } catch (error) {
                        overflow=true;
                    }
                    if(overflow)
                        pdfZoomout();
                    else
                        clearInterval(intervalOverflowPdf2);
                }, 10);
            }
        }, 10);
    }
}
function checkOverflow(el)
{
    try {
        var curOverflow = el.style.overflow;

        if ( !curOverflow || curOverflow === "visible" )
            el.style.overflow = "hidden";

        var isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

        el.style.overflow = curOverflow;

        return isOverflowing;
    } catch (error) {
        return true;
    }
}
function pdfZoomin()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("zoomIn").click();
    } catch (error) {}
}
function pdfZoomout()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("zoomOut").click();
    } catch (error) {}
}
function pdfScrolltop()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollTop-=50;
    } catch (error) {}
}
function pdfScrolldown()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollTop+=50;
    } catch (error) {}
}
function pdfScrollleft()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollLeft-=50;
    } catch (error) {}
}
function pdfScrollright()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollLeft+=50;
    } catch (error) {}
}
function listToTop()
{
    document.getElementById("listInnerContainer").scrollTop = 0;
}
function listToBottom()
{
    document.getElementById("listInnerContainer").scrollTo(0,document.getElementById("listInnerContainer").scrollHeight);
}
function listScrolltop()
{
    document.getElementById("listInnerContainer").scrollTop = document.getElementById("listInnerContainer").scrollTop-45;
}
function listScrolldown()
{
    document.getElementById("listInnerContainer").scrollTop = document.getElementById("listInnerContainer").scrollTop+45;
}