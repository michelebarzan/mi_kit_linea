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
var nZoomIn=
{
    "checklist":
    {
        "kit":0,
        "materie_prime":0
    }
}
var nScrolldown=
{
    "checklist":
    {
        "kit":0,
        "materie_prime":0
    }
}

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

    var adjustZoomHelp = await getParametriByHelp("adjustZoom");
    nZoomIn["checklist"]["kit"]=parseInt(adjustZoomHelp.filter(function (el) {return el.nome == 'nZoomIn.checklist.kit'})[0].valore);
    nScrolldown["checklist"]["kit"]=parseInt(adjustZoomHelp.filter(function (el) {return el.nome == 'nScrolldown.checklist.kit'})[0].valore);
    nZoomIn["checklist"]["materie_prime"]=parseInt(adjustZoomHelp.filter(function (el) {return el.nome == 'nZoomIn.checklist.materie_prime'})[0].valore);
    nScrolldown["checklist"]["materie_prime"]=parseInt(adjustZoomHelp.filter(function (el) {return el.nome == 'nScrolldown.checklist.materie_prime'})[0].valore);

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
	
	$.ajaxSetup({cache:false});
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
function checkLists()
{
    switch (view)
    {
        case "lotti":getListLotti();break;
        case "carrelli":getListCarrelli();break;
        case "componenti":getListComponenti();break;
        default:break;
    }
}
async function getListLotti()
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

    document.getElementById("messageContainer").style.display = "none";
    document.getElementById("messageContainer").innerHTML = "";

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

    Swal.close();
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
function selectLotto(id_lotto)
{
    lottoSelezionato=getFirstObjByPropValue(lotti,"id_lotto",id_lotto);
    document.getElementById("labelLottoSelezionato").innerHTML="Lotto <b>"+lottoSelezionato.lotto+"</b>";

    checkMessage(lottoSelezionato.commessa,lottoSelezionato.lotto,'','','',stazione.nome);

    getListCarrelli();
}
async function getListCarrelli()
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

    document.getElementById("messageContainer").style.display = "none";
    document.getElementById("messageContainer").innerHTML = "";

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
	
	for(var i=0;i<carrelli.length;i++)
    {
		var carrello = carrelli[i];
		
		carrello.id_CODCAR = carrello.id_CODCAR.replace(/(?:\r\n|\r|\n)/g,'');
		carrello.CODCAR = carrello.CODCAR.replace(/(?:\r\n|\r|\n)/g,'');
	}

    carrelli.forEach(function (carrello)
    {
		carrello.id_CODCAR = carrello.id_CODCAR.replace(/(?:\r\n|\r|\n)/g,'');
		carrello.CODCAR = carrello.CODCAR.replace(/(?:\r\n|\r|\n)/g,'');
		
        var item=document.createElement("button");
        item.setAttribute("class","carrelli-item");
        item.setAttribute("style","flex-direction: column;align-items: flex-start;justify-content: space-evenly;height: 50px;min-height: 50px;");
        item.setAttribute("onclick","selectCarrello('"+carrello.id_CODCAR+"')");
        item.setAttribute("id","carrelliItem"+carrello.id_CODCAR);

        var span=document.createElement("span");
        span.innerHTML=carrello.CODCAR;
        item.appendChild(span);

        var span=document.createElement("span");
        span.setAttribute("style","text-align:left;width:100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;font-weight:normal");
        span.innerHTML=carrello.cabine.join(",");
        item.appendChild(span);

        container.appendChild(item);

        i++;
    });

    Swal.close();
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
function selectCarrello(id_CODCAR)
{
    carrelloSelezionato=getFirstObjByPropValue(carrelli,"id_CODCAR",id_CODCAR);
        document.getElementById("labelCarrelloSelezionato").innerHTML=`Carrello <b>`+carrelloSelezionato.CODCAR+`</b>`;

    checkMessage(lottoSelezionato.commessa,lottoSelezionato.lotto,'%','%','%',stazione.nome);

    getListComponenti();
}
async function getListComponenti()
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

    document.getElementById("messageContainer").style.display = "none";
    document.getElementById("messageContainer").innerHTML = "";

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
        span.setAttribute("style","margin-right:10px");
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

    Swal.close();
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
    checkMessage(lottoSelezionato.commessa,lottoSelezionato.lotto,'%','%',fileName,stazione.nome);

    if(fileName != shownPdf)
    {
        //shownPdf=fileName;
        var container=document.getElementById("pdfContainer");
        container.innerHTML="";

        iframe=document.createElement("iframe");
        iframe.setAttribute("id","");
        iframe.setAttribute("class","");
        iframe.setAttribute("onload","fixPdf(this,'"+folder+"');shownPdf='"+fileName+"';");
        var server_adress=await getServerValue("SERVER_ADDR");
        var server_port=await getServerValue("SERVER_PORT");
        $.getJSON("http://"+server_adress+":"+server_port+"/mi_amministrazione_produzione_files/parameters.json", function(data){iframe.setAttribute("src","http://"+server_adress+":"+server_port+"/mi_kit_pdf/pdf.js/web/viewer.html?file=pdf/"+folder+data.linea_kit["pdf_"+folder+"_version"]+"/"+fileName+".pdf");container.appendChild(iframe);});
    }
}
function fixPdf(iframe,folder)
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

    resetPdfZoom(true,folder);
}
function resetPdfZoom(adjustZoom,folder)
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
                    {
                        clearInterval(intervalOverflowPdf2);
                        if(adjustZoom)
                        {
                            for (let index = 0; index < nZoomIn[stazione.nome][folder]; index++)
                            {
                                pdfZoomin();
                            }
                            for (let index = 0; index < nScrolldown[stazione.nome][folder]; index++)
                            {
                                pdfScrolldown();
                            }
                        }
                    }
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
function pdfRotate()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("pageRotateCcw").click();
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
function generaPdfChecklist()
{
    setTimeout(() =>
    {
        html2canvas(document.querySelector("#printOuterContainer")).then(canvas =>
        {
            document.getElementById("printCanvasContainer").appendChild(canvas);

            var canvasEl = document.getElementsByTagName('canvas')[0];

            var imgData = canvasEl.toDataURL("image/jpeg", 1.0);
            var pdf = new jsPDF();

            pdf.addImage(imgData, 'JPEG', 0, 0);
            //pdf.save("download.pdf");

            //--------------------------------------------------------------------------------

            function dataURLtoFile(dataurl, filename)
            {
                var arr = dataurl.split(','),
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]), 
                    n = bstr.length, 
                    u8arr = new Uint8Array(n);
                    
                while(n--){
                    u8arr[n] = bstr.charCodeAt(n);
                }
                
                return new File([u8arr], filename, {type:mime});
            }

            var currentdate = new Date(); 
            var datetime = currentdate.getDate() + "."
                            + (currentdate.getMonth()+1)  + "." 
                            + currentdate.getFullYear() + "-"  
                            + currentdate.getHours() + "."  
                            + currentdate.getMinutes() + "." 
                            + currentdate.getSeconds();
            
            var file = dataURLtoFile(pdf.output('datauristring'),'checklist_' + lottoSelezionato.lotto + '_' + carrelloSelezionato.CODCAR + '_' + datetime + '.pdf');

            //--------------------------------------------------------------------------------

            document.getElementById("printOuterContainer").style.display="none";
            document.getElementById("printCanvasContainer").style.display="none";

            var data= new FormData();
            data.append('file',file);
            $.ajax
            ({
                url:'uploadPdfChecklist.php',
                data:data,
                processData:false,
                contentType:false,
                type:'POST',
                success:function(response)
                    {
                        if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                        {
                            Swal.fire({icon:"error",title: "Errore. Impossibile salvare copia della checklist. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="16px";}});
                            console.log(response);
                        }
                    }
            });
        });
    }, 500);
}
async function stampaChecklist()
{
    if(lottoSelezionato != null && carrelloSelezionato != null)
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

        document.getElementById("printOuterContainer").style.display="";
        document.getElementById("printCanvasContainer").style.display="";

        document.getElementById("printOuterContainer").innerHTML="";
        document.getElementById("printCanvasContainer").innerHTML="";
        
        $(".print-container").remove();

        var componentiChecklist = await getComponentiStampaChecklist();
    
        var server_adress=await getServerValue("SERVER_ADDR");
        var server_port=await getServerValue("SERVER_PORT");
        
        var eight = 28.5;
        var width = 19;

        document.getElementsByClassName("structure-header")[0].style.display="none";
        document.getElementsByClassName("section-container")[0].style.display="none";
        document.getElementById("poweredBy").style.display="none";

        document.body.style.width = "revert";
        document.body.style.minWidth = "revert";
        document.body.style.maxWidth = "revert";
        document.body.style.height = "revert";
        document.body.style.minHeight = "revert";
        document.body.style.maxHeight = "revert";

        document.body.style.backgroundColor="white";
        document.body.style.overflow="hidden";

        var n_stampe_checklist = 2;
        for (let index2 = 0; index2 < n_stampe_checklist; index2++)
        {
            var marginTop;
            if(index2 == 0)
                marginTop = 5;
            else
                marginTop = 10;

            var outerContainer=document.createElement("div");
            //outerContainer.setAttribute("id","printContainer");
            outerContainer.setAttribute("class","print-container");
            outerContainer.setAttribute("style","display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;height: "+eight+"cm;width: "+width+"cm;border:.5mm solid black;box-sizing:border-box;margin-left:5mm;margin-right:5mm;margin-top:"+marginTop+"mm;margin-bottom:5mm");
        
            //---------Checklist Carrello
            var row=document.createElement("div");
            row.setAttribute("style","min-width:100%;max-width:100%;width:100%;min-height:5%;max-height:5%;height:5%;display: flex;flex-direction: row;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box;padding-left:10px;padding-right:10px");
            var div=document.createElement("div");
            div.setAttribute("style","min-width:80%;max-width:80%;width:80%;min-height:100%;max-height:100%;height:100%;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:100%;max-width:100%;width:100%;white-space: nowraptext-overflow: clip;");
            span.innerHTML="<b>Checklist Carrello</b>";
            div.appendChild(span);
            row.appendChild(div);
            //---------Logo
            var img=document.createElement("img");
            img.setAttribute("style","min-width:20%;max-width:20%;width:20%;min-height:100%;max-height:100%;height:100%;box-sizing:border-box");
            img.setAttribute("src","http://"+server_adress+":"+server_port+"/mi_kit_linea/images/logoCabins.png");
            row.appendChild(img);
            outerContainer.appendChild(row);
        
            //---------Lotto
            var row=document.createElement("div");
            row.setAttribute("style","min-width:100%;max-width:100%;width:100%;min-height:5%;max-height:5%;height:5%;display: flex;flex-direction: row;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
            var div=document.createElement("div");
            div.setAttribute("style","overflow:hidden;min-width:50%;max-width:50%;width:50%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box;padding-left:10px;padding-right:10px");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML="<b>Lotto: </b>"+lottoSelezionato.lotto;
            div.appendChild(span);
            row.appendChild(div);
            outerContainer.appendChild(row);
        
            //---------Carrello
            var div=document.createElement("div");
            div.setAttribute("style","overflow:hidden;min-width:50%;max-width:50%;width:50%;min-height:100%;max-height:100%;height:100%;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box;padding-left:10px;padding-right:10px");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML="<b>Carrello: </b>"+carrelloSelezionato.CODCAR;
            div.appendChild(span);
            row.appendChild(div);
            outerContainer.appendChild(row);
        
            //---------Contenitore tabelle pannelli
            var tablesContainer=document.createElement(`div`);
            tablesContainer.setAttribute(`style`,`min-height:90%;max-height:90%;height:90%;width: 100%;min-width:100%;max-width:100%;overflow:hidden;display:flex;flex-direction:row;align-items:flex-start;justify-content:flex-start`);

            var table1Container = document.createElement(`div`);
            table1Container.setAttribute(`style`, `min-height:100%;max-height:100%;height:100%;width: ${width/2}cm;min-width:${width/2}cm;max-width:${width/2}cm;overflow:hidden`);
            var table1=document.createElement(`table`);
            table1.setAttribute(`style`,`max-height:100%;width:${width/2}cm;min-width:${width/2}cm;max-width:${width/2}cm;overflow:hidden;border-collapse: collapse;border:none;box-sizing:border-box;border-right:.5mm solid black`);
            table1Container.appendChild(table1);
            tablesContainer.appendChild(table1Container);
        
            var table2Container = document.createElement(`div`);
            table2Container.setAttribute(`style`, `min-height:100%;max-height:100%;height:100%;width: ${width/2}cm;min-width:${width/2}cm;max-width:${width/2}cm;overflow:hidden`);
            var table2=document.createElement(`table`);
            table2.setAttribute(`style`,`max-height:100%;width:${width/2}cm;min-width:${width/2}cm;max-width:${width/2}cm;overflow:hidden;border-collapse: collapse;border:none;`);
            table2Container.appendChild(table2);
            if(componentiChecklist.length>40)
                tablesContainer.appendChild(table2Container);
        
            outerContainer.appendChild(tablesContainer);
        
            var nRows=53;
            var trHeight=((85*eight)/100)/nRows;
            var tr=document.createElement("tr");
            var th=document.createElement("th");
            th.setAttribute("style","box-sizing:border-box;min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;font-weight:bold");
            th.innerHTML=`<div style="display:block;max-width:${((width/2)*25)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;text-align:left">Codice</div>`;
            tr.appendChild(th);
            var th=document.createElement("th");
            th.setAttribute("style","box-sizing:border-box;min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;font-weight:bold");
            th.innerHTML=`<div style="display:block;max-width:${((width/2)*7)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;text-align:left">PZ</div>`;
            tr.appendChild(th);
            var th=document.createElement("th");
            th.setAttribute("style","box-sizing:border-box;min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;font-weight:bold");
            th.innerHTML=`<div style="display:block;max-width:${((width/2)*38)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;text-align:left">Descrizione</div>`;
            tr.appendChild(th);
            var th=document.createElement("th");
            th.setAttribute("style","box-sizing:border-box;min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;font-weight:bold");
            th.innerHTML=`<div style="display:block;max-width:${((width/2)*10)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;text-align:left">Fori</div>`;
            tr.appendChild(th);
            var th=document.createElement("th");
            th.setAttribute("style","box-sizing:border-box;min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;font-weight:bold");
            th.innerHTML=`<div style="display:block;max-width:${((width/2)*15)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;text-align:left">Lung</div>`;
            tr.appendChild(th);
            var th=document.createElement("th");
            th.setAttribute("style","border-left:1px solid black;box-sizing:border-box;min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;font-weight:bold");
            th.innerHTML=`<div style="display:block;max-width:${((width/2)*5)/100}cm;min-width:${((width/2)*5)/100}cm;width:${((width/2)*5)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;text-align:left"></div>`;
            tr.appendChild(th);

            table1.appendChild(tr);
            table2.appendChild(tr.cloneNode(true));
        
            var i=1;
            componentiChecklist.forEach(componente =>
            {
                var bg;
                if(i % 2)
                    bg="#ddd";
                else
                    bg="white";
                var tr=document.createElement("tr");
                var td=document.createElement("td");
                td.setAttribute("style","box-sizing:border-box;background-color:"+bg+";min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;");
                td.innerHTML=`<div style="display:block;max-width:${((width/2)*25)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${componente.codice_componente}</div>`;
                tr.appendChild(td);
                var td=document.createElement("td");
                td.setAttribute("style","box-sizing:border-box;background-color:"+bg+";min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;");
                td.innerHTML=`<div style="display:block;max-width:${((width/2)*7)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${componente.qnt}</div>`;
                tr.appendChild(td);
                var td=document.createElement("td");
                td.setAttribute("style","box-sizing:border-box;background-color:"+bg+";min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;");
                td.innerHTML=`<div style="display:block;max-width:${((width/2)*38)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${componente.descrizione}</div>`;
                tr.appendChild(td);
                var td=document.createElement("td");
                td.setAttribute("style","box-sizing:border-box;background-color:"+bg+";min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;");
                td.innerHTML=`<div style="display:block;max-width:${((width/2)*10)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${componente.fori}</div>`;
                tr.appendChild(td);
                var td=document.createElement("td");
                td.setAttribute("style","box-sizing:border-box;background-color:"+bg+";min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;");
                td.innerHTML=`<div style="display:block;max-width:${((width/2)*15)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${componente.lung}</div>`;
                tr.appendChild(td);
                var td=document.createElement("td");
                td.setAttribute("style","border-left:1px solid black;box-sizing:border-box;background-color:"+bg+";min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.8mm;");
                if(componente.checked)
                    td.innerHTML=`<div style="text-align:center;display:block;max-width:${((width/2)*5)/100}cm;min-width:${((width/2)*5)/100}cm;width:${((width/2)*5)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;font-weight:bold">X</div>`;
                else
                    td.innerHTML=`<div style="text-align:center;display:block;max-width:${((width/2)*5)/100}cm;min-width:${((width/2)*5)/100}cm;width:${((width/2)*5)/100}cm;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"></div>`;
                tr.appendChild(td);
        
                if(i<nRows)
                    table1.appendChild(tr);
                else
                    table2.appendChild(tr);
        
                i++;
            });

            document.body.appendChild(outerContainer);
        }

        Swal.close();

        setTimeout(() =>
        {
            window.print();

            const outerContainerClone = outerContainer.cloneNode(true);
            document.getElementById("printOuterContainer").appendChild(outerContainerClone);
            generaPdfChecklist();
            
            document.getElementsByClassName("structure-header")[0].style.display="";
            document.getElementsByClassName("section-container")[0].style.display="";
            document.getElementById("poweredBy").style.display="";

            document.body.style.width = "";
            document.body.style.minWidth = "";
            document.body.style.maxWidth = "";
            document.body.style.height = "";
            document.body.style.minHeight = "";
            document.body.style.maxHeight = "";
            document.body.style.backgroundColor="";
            document.body.style.overflow="";
        }, 1000);
    }
}
function getComponentiStampaChecklist()
{
    return new Promise(function (resolve, reject) 
    {
        $.post("getComponentiStampaChecklist.php",
        {
            lotto:lottoSelezionato.lotto,
            CODCAR:carrelloSelezionato.CODCAR
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