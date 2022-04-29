var lotti,cabine,kit_pannelli;
var lottoSelezionato,cabinaSelezionata;
var view;
var iframe;
var turno;
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
    "prelievo":
    {
        "kit":0
    }
}
var nScrolldown=
{
    "prelievo":
    {
        "kit":0
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
    nZoomIn["prelievo"]["kit"]=parseInt(adjustZoomHelp.filter(function (el) {return el.nome == 'nZoomIn.prelievo.kit'})[0].valore);
    nScrolldown["prelievo"]["kit"]=parseInt(adjustZoomHelp.filter(function (el) {return el.nome == 'nScrolldown.prelievo.kit'})[0].valore);

    id_utente=await getSessionValue("id_utente");

    frequenza_aggiornamento_dati_linea=await getParametro("frequenza_aggiornamento_dati_linea");
    frequenza_aggiornamento_dati_linea=parseInt(frequenza_aggiornamento_dati_linea);

    var nome_turno=await getSessionValue("turno");
    var nome_stazione=await getSessionValue("stazione");

    var turni=await getAnagraficaTurni();
    var stazioni=await getAnagraficaStazioni();

    turno=getFirstObjByPropValue(turni,"nome",nome_turno);
    stazione=getFirstObjByPropValue(stazioni,"nome",nome_stazione);

    /*filtro=await getCookie("filtro");
    if(filtro=="")
        filtro="attivo";
    setFiltroLabel();*/

    dot=document.title;
    document.title=stazione.label;
    
    document.getElementById("infoStazioneContainer").innerHTML=stazione.label;
    document.getElementById("infoStazioneContainer").setAttribute("nome",stazione.nome);
    document.getElementById("infoStazioneContainer").setAttribute("id_stazione",stazione.id_stazione);

    var username=await getSessionValue("username");
    document.getElementById("usernameContainer").innerHTML=username+'<i class="fad fa-user" style="margin-left:10px"></i>';
        
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

    view="lotti";

    document.getElementById("totaliPrelievoLabel").style.display="none";

    lottoSelezionato=null;
    document.getElementById("labelLottoSelezionato").innerHTML="Scegli un lotto";
    cabinaSelezionata=null;
    document.getElementById("labelCabinaSelezionato").innerHTML="Scegli un cabina";

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

    getListCabine();
}
async function getListCabine()
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

    view="cabine";

    document.getElementById("totaliPrelievoLabel").style.display="none";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    cabinaSelezionata=null;
    document.getElementById("labelCabinaSelezionato").innerHTML="Scegli un cabina";

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>';

    document.getElementById("listButtonIndietro").disabled=true;

    var i=1;
    cabine=await getCabine(lottoSelezionato.lotto,lottoSelezionato.commessa);

    document.getElementById("listButtonIndietro").disabled=false;

    container.innerHTML="";

    cabine.forEach(function (cabina)
    {
        var item=document.createElement("button");
        item.setAttribute("class","cabine-item");
        item.setAttribute("style","flex-direction: column;align-items: flex-start;justify-content: space-evenly;height: 50px;min-height: 50px;");
        item.setAttribute("onclick","selectCabina('"+cabina.disegno_cabina+"')");

        var span=document.createElement("span");
        span.innerHTML=cabina.disegno_cabina;
        item.appendChild(span);

        var span=document.createElement("span");
        span.setAttribute("style","text-align:left;width:100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;font-weight:normal");
        span.innerHTML=cabina.numeri_cabina.join(",");
        item.appendChild(span);

        container.appendChild(item);

        i++;
    });

    Swal.close();
}
function getCabine(lotto,commessa)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getCabinePrelievo.php",{lotto,commessa},
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
function selectCabina(disegno_cabina)
{
    cabinaSelezionata=getFirstObjByPropValue(cabine,"disegno_cabina",disegno_cabina);
    document.getElementById("labelCabinaSelezionato").innerHTML=`Cabina <b>`+cabinaSelezionata.disegno_cabina+`</b> ${dot} `+cabinaSelezionata.numeri_cabina.join(",");

    getListPannelli();
}
async function getListPannelli()
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

    view="pannelli";

    document.getElementById("totaliPrelievoLabel").innerHTML="";
    document.getElementById("totaliPrelievoLabel").style.display="";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>';

    document.getElementById("listButtonIndietro").disabled=true;

    kit_pannelli=await getPannelli(cabinaSelezionata.disegno_cabina,lottoSelezionato.lotto);

    var pannelli = [];

    document.getElementById("listButtonIndietro").disabled=false;

    container.innerHTML="";

    var i=1;
    var j=0;
    kit_pannelli.forEach(function (kit)
    {
        var kitContainer = document.createElement("div");
        kitContainer.setAttribute("class","pannelli-container");
        kitContainer.setAttribute("id","pannelliContainer"+kit.kit);
        if(j==0)
            kitContainer.setAttribute("style","margin-top:5px");
        if(j==(kit_pannelli.length-1))
            kitContainer.setAttribute("style","margin-bottom:5px");

        var div = document.createElement("div");
        div.setAttribute("class","pannelli-container-info-kit");
        div.setAttribute("id","pannelliContainerInfoKit"+kit.kit);
        div.setAttribute("role","button");
        div.setAttribute("onclick","getPdf('kit','"+kit.kit+"')");

        var span = document.createElement("span");
        span.setAttribute("style","font-size:24px;font-weight: bold;");
        span.innerHTML = kit.posizione;
        div.appendChild(span);

        var span = document.createElement("span");
        span.setAttribute("style","font-size:14px");
        span.innerHTML = kit.kit;
        div.appendChild(span);
        
        kitContainer.appendChild(div);

        var k=0;
        kit.pannelli.forEach(pannello =>
        {
            pannelli.push(pannello.codice_pannello);

            var pannelloContainer = document.createElement("div");
            pannelloContainer.setAttribute("class","pannelli-item");
            pannelloContainer.setAttribute("codice_pannello",pannello.codice_pannello);
            pannelloContainer.setAttribute("role","button");
            var backgroundColor="";
            if(pannello.prelevato)
            {
                pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit.kit+"');eliminaPannelloPrelievo(this,'"+lottoSelezionato.lotto+"','"+cabinaSelezionata.disegno_cabina+"','"+kit.kit+"','"+kit.posizione+"','"+pannello.codice_pannello+"',"+i+")");
                backgroundColor="#70B085";
            }
            else
            {
                pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit.kit+"');registraPannelloPrelievo(this,'"+lottoSelezionato.lotto+"','"+cabinaSelezionata.disegno_cabina+"','"+kit.kit+"','"+kit.posizione+"','"+pannello.codice_pannello+"',"+i+")");
                backgroundColor="#404040";
            }
            if(k>=5)
                pannelloContainer.setAttribute("style","display:none;background-color: "+backgroundColor+";");
            else
                pannelloContainer.setAttribute("style","background-color: "+backgroundColor+";");

            var div = document.createElement("div");
            div.setAttribute("class","pannelli-item-info-pannello");
            div.setAttribute("style","align-items:center;justify-content:center;margin-right:10px;box-sizing:border-box");

            var span = document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;letter-spacing: 2px;font-size:24px;font-weight: bold;");
            span.innerHTML = i;
            div.appendChild(span);
            
            pannelloContainer.appendChild(div);

            var div = document.createElement("div");
            div.setAttribute("class","pannelli-item-info-pannello");
    
            var span = document.createElement("span");
            span.setAttribute("style","font-weight:bold");
            span.innerHTML = pannello.codice_pannello;
            div.appendChild(span);
    
            var span = document.createElement("span");
            span.innerHTML = "Angolo "+pannello.ang;
            div.appendChild(span);
    
            var span = document.createElement("span");
            if(pannello.ang > 0)
                span.innerHTML = pannello.lung1 + " X " + pannello.lung2 + " X " + pannello.halt;
            else
                span.innerHTML = pannello.lung1 + " X " + pannello.halt;
            div.appendChild(span);
            
            pannelloContainer.appendChild(div);

            kitContainer.appendChild(pannelloContainer);

            i++;
            k++;
        });

        var scrollButtonsContainer = document.createElement("div");
        scrollButtonsContainer.setAttribute("class","pannelli-item-scroll-buttons-container");
        if(kit.pannelli.length>5)
        {
            var button = document.createElement("button");
            button.setAttribute("onclick","scrollPannelliContainer('right','"+kit.kit+"',"+kit.pannelli.length+")");
            button.setAttribute("class","action-button");
            button.setAttribute("style","height:calc(50% - 5px);margin-left:0px");
            button.innerHTML='<i class="far fa-angle-right"></i>';
            scrollButtonsContainer.appendChild(button);
            var button = document.createElement("button");
            button.setAttribute("onclick","scrollPannelliContainer('left','"+kit.kit+"',"+kit.pannelli.length+")");
            button.setAttribute("class","action-button");
            button.setAttribute("style","height:calc(50% - 5px);margin-left:0px");
            button.innerHTML='<i class="far fa-angle-left"></i>';
            scrollButtonsContainer.appendChild(button);
        }
        kitContainer.appendChild(scrollButtonsContainer);

        container.appendChild(kitContainer);

        j++;
    });

    if(kit_pannelli.length>0)
    {
        document.getElementById("pannelliContainerInfoKit"+kit_pannelli[0].kit).click();
    }

    const findDuplicates = (arr) =>
    {
        let sorted_arr = arr.slice().sort();
        let results = [];
        for (let i = 0; i < sorted_arr.length - 1; i++)
        {
            if(sorted_arr[i + 1] == sorted_arr[i])
                results.push(sorted_arr[i]);
        }
        return results;
    }

    var colors = ["#F7FD04","#FF5403","#F037A5","#4EEAF6","#F7F7EE","#28FFBF","#2D46B9"];
    var pannelliItems = document.getElementsByClassName("pannelli-item");
    for (let index2 = 0; index2 < [...new Set(findDuplicates(pannelli))].length; index2++)
    {
        const codice_pannello = [...new Set(findDuplicates(pannelli))][index2];
        var color = colors[index2];

        for (let index = 0; index < pannelliItems.length; index++)
        {
            const pannelloContainer = pannelliItems[index];
            
            if(codice_pannello == pannelloContainer.getAttribute("codice_pannello"))
                pannelloContainer.style.border = "2px solid "+color;
        }
    }

    document.getElementById("totaliPrelievoLabel").innerHTML=kit_pannelli.length + " kit, " + i + " pannelli";

    Swal.close();
}
function scrollPannelliContainer(how,kit,length)
{
    if(how=="right")
    {
        var n;
        var pannelliItems = document.getElementById("pannelliContainer"+kit).getElementsByClassName("pannelli-item");
        for (let index = 0; index < pannelliItems.length; index++)
        {
            const pannelloContainer = pannelliItems[index];
            
            if(pannelloContainer.style.display!="none")
            {
                n=index;
                break;
            }
        }
        if((n+5) < length)
        {
            document.getElementById("pannelliContainer"+kit).getElementsByClassName("pannelli-item")[n].style.display="none";
            document.getElementById("pannelliContainer"+kit).getElementsByClassName("pannelli-item")[n+5].style.display="";
        }
    }
    else
    {
        var n;
        var pannelliItems = document.getElementById("pannelliContainer"+kit).getElementsByClassName("pannelli-item");
        for (let index = pannelliItems.length-1; index >= 0; index--)
        {
            const pannelloContainer = pannelliItems[index];
            
            if(pannelloContainer.style.display!="none")
            {
                n=index;
                break;
            }
        }
        if((n-5) >= 0)
        {
            document.getElementById("pannelliContainer"+kit).getElementsByClassName("pannelli-item")[n].style.display="none";
            document.getElementById("pannelliContainer"+kit).getElementsByClassName("pannelli-item")[n-5].style.display="";
        }
    }
}
function registraPannelloPrelievo(pannelloContainer,lotto,disegno_cabina,kit,posizione,codice_pannello,i)
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

    $.post("registraPannelloPrelievo.php",{lotto,disegno_cabina,kit,posizione,codice_pannello,i,cabine:cabinaSelezionata.numeri_cabina,id_utente},
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
            }
            else
            {
                pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit+"');eliminaPannelloPrelievo(this,'"+lotto+"','"+disegno_cabina+"','"+kit+"','"+posizione+"','"+codice_pannello+"',"+i+")");
                pannelloContainer.style.backgroundColor = "#70B085";

                if(parseInt(response) == parseInt(document.getElementById("pannelliContainer"+kit).getElementsByClassName("pannelli-item").length))
                if(document.getElementById("pannelliContainer"+kit).nextSibling)
                {
                    document.getElementById("pannelliContainer"+kit).nextSibling.getElementsByClassName("pannelli-container-info-kit")[0].click();
                    document.getElementById("listInnerContainer").scrollTop=document.getElementById("listInnerContainer").scrollTop+80;
                }
                else
                {
                    document.getElementsByClassName("pannelli-container")[0].getElementsByClassName("pannelli-container-info-kit")[0].click();
                    document.getElementById("listInnerContainer").scrollTop=0;
                }
                Swal.close();
            }
        }
    });
}
function eliminaPannelloPrelievo(pannelloContainer,lotto,disegno_cabina,kit,posizione,codice_pannello,i)
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

    $.post("eliminaPannelloPrelievo.php",{lotto,disegno_cabina,kit,posizione,codice_pannello,i,cabine:cabinaSelezionata.numeri_cabina,id_utente},
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
            }
            else
            {
                pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit+"');registraPannelloPrelievo(this,'"+lotto+"','"+disegno_cabina+"','"+kit+"','"+posizione+"','"+codice_pannello+"',"+i+")");
                pannelloContainer.style.backgroundColor = "#404040";
                Swal.close();
            }
        }
    });
}
function disableCheckboxPannello(event)
{
    event.stopPropagation();
}
function getPannelli(disegno_cabina,lotto)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getPannelliPrelievo.php",{disegno_cabina,lotto},
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
        case "cabine":getListLotti();break;
        case "pannelli":getListCabine();break;
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
    try {
        var pannelliContainers = document.getElementsByClassName("pannelli-container-info-kit");
        for (let index = 0; index < pannelliContainers.length; index++)
        {
            const pannelloContainer = pannelliContainers[index];
    
            pannelloContainer.style.color="#EBEBEB";
        }
        document.getElementById("pannelliContainerInfoKit"+fileName).style.color="#548CFF";
    } catch (error) {}

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
        iframe.setAttribute("src","http://"+server_adress+":"+server_port+"/mi_kit_pdf/pdf.js/web/viewer.html?file=pdf/"+folder+"/"+fileName+".pdf");
        container.appendChild(iframe);
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