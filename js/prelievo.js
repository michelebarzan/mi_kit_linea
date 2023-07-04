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

    document.getElementById("messageContainer").style.display = "none";
    document.getElementById("messageContainer").innerHTML = "";

    view="lotti";

    document.getElementById("totaliPrelievoLabel").style.display="none";

    lottoSelezionato=null;
    document.getElementById("labelLottoSelezionato").innerHTML="Scegli un lotto";
    cabinaSelezionata=null;
    document.getElementById("labelCabinaSelezionata").innerHTML="Scegli un cabina";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    var container=document.getElementById("listInnerContainer");
    container.style.overflow="";
    container.style.padding="";
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

    checkMessage(lottoSelezionato.commessa,lottoSelezionato.lotto,'%','','%',stazione.nome);

    getListCabine();
}
function getCabineChiusePrelievo(lotto,commessa)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getCabineChiusePrelievo.php",{lotto,commessa},
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

    document.getElementById("messageContainer").style.display = "none";
    document.getElementById("messageContainer").innerHTML = "";

    view="cabine";

    document.getElementById("totaliPrelievoLabel").style.display="none";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    cabinaSelezionata=null;
    document.getElementById("labelCabinaSelezionata").innerHTML="Scegli un cabina";

    var container=document.getElementById("listInnerContainer");
    container.style.overflow="";
    container.style.padding="";
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>';

    document.getElementById("listButtonIndietro").disabled=true;

    cabine=await getCabine(lottoSelezionato.lotto,lottoSelezionato.commessa);

    var cabine_chiuse = await getCabineChiusePrelievo(lottoSelezionato.lotto,lottoSelezionato.commessa);
    var cabine_chiuse_lotto_obj = cabine_chiuse.filter(function (cabina_chiusa) {return cabina_chiusa.lotto == lottoSelezionato.lotto});
    var cabine_chiuse_lotto = [];
    for (let index = 0; index < cabine_chiuse_lotto_obj.length; index++)
    {
        const element = cabine_chiuse_lotto_obj[index];

        cabine_chiuse_lotto.push(element.disegno_cabina);
    }
    
    for (let index = 0; index < cabine.length; index++)
    {
        const cabina = cabine[index];

        if(cabine_chiuse_lotto.includes(cabina.disegno_cabina))
            cabina.chiusa = true;
        else
            cabina.chiusa = false;
    }

    document.getElementById("listButtonIndietro").disabled=false;

    container.innerHTML="";

    var i=1;
    cabine.forEach(function (cabina)
    {
        var item=document.createElement("button");
        item.setAttribute("class","cabine-item");
        item.setAttribute("style","flex-direction: column;align-items: flex-start;justify-content: space-evenly;height: 50px;min-height: 50px;");
        item.setAttribute("onclick","selectCabina('"+cabina.disegno_cabina+"')");

        var div = document.createElement("div");
        div.setAttribute("style","width:100%;display:flex;flex-direction:row;align-items:center;justify-content:flex-start");

        var span=document.createElement("span");
        span.innerHTML=cabina.disegno_cabina;
        div.appendChild(span);

        if(cabina.chiusa)
        {
            var fa=document.createElement("i");
            fa.setAttribute("class","fad fa-check-circle");
            fa.setAttribute("style","color:#70B085;font-size:17px;margin-left:auto;margin-right:7px");
            div.appendChild(fa);
        }

        item.appendChild(div);

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
    document.getElementById("labelCabinaSelezionata").innerHTML=`Cabina <b>`+cabinaSelezionata.disegno_cabina+`</b> ${dot} `+cabinaSelezionata.numeri_cabina.join(",");

    checkMessage(lottoSelezionato.commessa,lottoSelezionato.lotto,'%',cabinaSelezionata.disegno_cabina,'%',stazione.nome);

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

    var cookie_numeri_cabina={};
    var cookie_numeri_cabina_string = await getCookie("cookie_numeri_cabina_string");
    if(cookie_numeri_cabina_string != "" && cookie_numeri_cabina_string != null && cookie_numeri_cabina_string != undefined)
        cookie_numeri_cabina = JSON.parse(cookie_numeri_cabina_string);

    var is_undefined = true;
    if(cookie_numeri_cabina[lottoSelezionato.lotto] != undefined)
    {
        if(cookie_numeri_cabina[lottoSelezionato.lotto][cabinaSelezionata.disegno_cabina] != undefined)
        {
            is_undefined = false;
        }
    }
    if(is_undefined)
    {
        cookie_numeri_cabina[lottoSelezionato.lotto] = {}
        cookie_numeri_cabina[lottoSelezionato.lotto][cabinaSelezionata.disegno_cabina] = cabinaSelezionata.numeri_cabina;
        setCookie("cookie_numeri_cabina_string",JSON.stringify(cookie_numeri_cabina));
    }

    document.getElementById("totaliPrelievoLabel").innerHTML="";
    document.getElementById("totaliPrelievoLabel").style.display="";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    var container=document.getElementById("listInnerContainer");
    container.style.overflow="hidden";
    container.style.padding="0px";
    container.innerHTML="";

    var numeriCabinaContainer = document.createElement("div");
    numeriCabinaContainer.setAttribute("class","pannelli-cabine-container");
    
    for (let index = 0; index < cabinaSelezionata.numeri_cabina.length; index++)
    {
        const numero_cabina = cabinaSelezionata.numeri_cabina[index];
    
        var numeroCabinaItem = document.createElement("button");
        numeroCabinaItem.setAttribute("class","pannelli-cabine-container-cabine-item");
        numeroCabinaItem.setAttribute("id","pannelliCabineContainerCabineItem"+numero_cabina);
        numeroCabinaItem.setAttribute("onclick","filterCabineListPanelli('"+numero_cabina+"')");
        var active = false;
        if(cookie_numeri_cabina[lottoSelezionato.lotto] != undefined)
        {
            if(cookie_numeri_cabina[lottoSelezionato.lotto][cabinaSelezionata.disegno_cabina] != undefined)
            {
                if(cookie_numeri_cabina[lottoSelezionato.lotto][cabinaSelezionata.disegno_cabina].includes(numero_cabina))
                    active = true;
            }
        }
        if(active)
        {
            numeroCabinaItem.setAttribute("active","true");
            numeroCabinaItem.setAttribute("style","background-color:#548CFF");
        }
        else
        {
            numeroCabinaItem.setAttribute("active","false");
        }
        var span = document.createElement("span");
        span.innerHTML = numero_cabina;
        numeroCabinaItem.appendChild(span);

        numeriCabinaContainer.appendChild(numeroCabinaItem);
    }
    container.appendChild(numeriCabinaContainer);

    var pannelliOuterContainer = document.createElement("div");
    pannelliOuterContainer.setAttribute("class","pannelli-outer-container");
    pannelliOuterContainer.setAttribute("id","pannelliOuterContainer");
    container.appendChild(pannelliOuterContainer);

    Swal.close();

    getListKitPannelli();
}
async function getListKitPannelli()
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

    var pannelliOuterContainer = document.getElementById("pannelliOuterContainer");
    pannelliOuterContainer.innerHTML="";

    kit_pannelli=await getPannelli();

    var pannelli = [];

    var i=1;
    var j=0;
    kit_pannelli.forEach(function (kit)
    {
        var kitContainer = document.createElement("div");
        kitContainer.setAttribute("class","pannelli-container");
        kitContainer.setAttribute("id","pannelliContainer"+kit.kit+kit.posizione);
        if(j==0)
            kitContainer.setAttribute("style","margin-top:5px");
        if(j==(kit_pannelli.length-1))
            kitContainer.setAttribute("style","margin-bottom:5px");

        var div = document.createElement("div");
        div.setAttribute("class","pannelli-container-info-kit");
        div.setAttribute("id","pannelliContainerInfoKit"+kit.kit+kit.posizione);
        div.setAttribute("role","button");
        div.setAttribute("onclick","getPdf('kit','"+kit.kit+"','"+kit.posizione+"')");

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
            pannelloContainer.setAttribute("oncontextmenu","getNumeriCabinaPannello(event,this,'"+lottoSelezionato.lotto+"','"+cabinaSelezionata.disegno_cabina+"','"+kit.kit+"','"+kit.posizione+"','"+pannello.codice_pannello+"',"+i+")");

            var numeri_cabina = [];
            var pannelliCabineContainerCabineItems = document.getElementsByClassName("pannelli-cabine-container-cabine-item");
            for (let index = 0; index < pannelliCabineContainerCabineItems.length; index++)
            {
                const item = pannelliCabineContainerCabineItems[index];
                
                if(item.getAttribute("active") == "true")
                    numeri_cabina.push(item.firstChild.innerHTML);
            }
            
            var backgroundColor="";
            if(JSON.stringify(numeri_cabina.sort()) == JSON.stringify(pannello.numeri_cabina.sort()))
            {
                backgroundColor="#70B085";//green
                pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit.kit+"','"+kit.posizione+"');eliminaPannelloPrelievo(this,'"+lottoSelezionato.lotto+"','"+cabinaSelezionata.disegno_cabina+"','"+kit.kit+"','"+kit.posizione+"','"+pannello.codice_pannello+"',"+i+")");
            }
            else
            {
                if(pannello.numeri_cabina.length == 0)
                {
                    backgroundColor="#404040";//black
                    pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit.kit+"','"+kit.posizione+"');registraPannelloPrelievo(this,'"+lottoSelezionato.lotto+"','"+cabinaSelezionata.disegno_cabina+"','"+kit.kit+"','"+kit.posizione+"','"+pannello.codice_pannello+"',"+i+")");
                }
                else
                {
                    backgroundColor="#E9A93A";//orange
                    pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit.kit+"','"+kit.posizione+"');registraPannelloPrelievo(this,'"+lottoSelezionato.lotto+"','"+cabinaSelezionata.disegno_cabina+"','"+kit.kit+"','"+kit.posizione+"','"+pannello.codice_pannello+"',"+i+")");
                }
            }

            if(k>=5)
                pannelloContainer.setAttribute("style","display:none;background-color: "+backgroundColor+";");
            else
                pannelloContainer.setAttribute("style","background-color: "+backgroundColor+";");

            var div = document.createElement("div");
            div.setAttribute("class","pannelli-item-info-pannello");
            div.setAttribute("style","align-items:center;justify-content:center;margin-right:10px;");

            var span = document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;letter-spacing: 2px;font-size:24px;font-weight: bold;");
            span.innerHTML = i;
            div.appendChild(span);
            
            pannelloContainer.appendChild(div);

            var div = document.createElement("div");
            div.setAttribute("class","pannelli-item-info-pannello");
            div.setAttribute("style","align-items:felx-start;justify-content:space-evenly;");
    
            var span = document.createElement("span");
            span.setAttribute("style","font-weight:bold");
            span.innerHTML = pannello.codice_pannello;
            div.appendChild(span);
    
            var span = document.createElement("span");
            span.innerHTML = "Angolo "+pannello.ang + "°";
            div.appendChild(span);
    
            var span = document.createElement("span");
            span.innerHTML = pannello.n_fori + " fori";
            div.appendChild(span);
    
            var span = document.createElement("span");
            if(pannello.ang > 0)
                span.innerHTML = pannello.lung1 + " X " + pannello.lung2 + " X " + pannello.halt;
            else
                span.innerHTML = pannello.lung1 + " X " + pannello.halt;
            div.appendChild(span);
            
            pannelloContainer.appendChild(div);

            var checked = false;
            if(pannello.numeri_cabina.length > 0)
            {
                let checker = (arr, target) => target.every(v => arr.includes(v));
                if(checker(pannello.numeri_cabina, numeri_cabina))
                    checked=true;
            }
            if(checked)
            {
                var div = document.createElement("div");
                div.setAttribute("class","pannelli-item-icon-container-pannello");
                var icon = document.createElement("i");
                icon.setAttribute("class","fas fa-check-circle");
                div.appendChild(icon);
                pannelloContainer.appendChild(div);
            }

            kitContainer.appendChild(pannelloContainer);

            i++;
            k++;
        });

        var scrollButtonsContainer = document.createElement("div");
        scrollButtonsContainer.setAttribute("class","pannelli-item-scroll-buttons-container");
        if(kit.pannelli.length>5)
        {
            var button = document.createElement("button");
            button.setAttribute("onclick","scrollPannelliContainer('right','"+kit.kit+"','"+kit.posizione+"',"+kit.pannelli.length+")");
            button.setAttribute("class","action-button");
            button.setAttribute("style","height:calc(50% - 5px);margin-left:0px;width:40px");
            button.innerHTML='<i class="far fa-angle-right"></i>';
            scrollButtonsContainer.appendChild(button);
            var button = document.createElement("button");
            button.setAttribute("onclick","scrollPannelliContainer('left','"+kit.kit+"','"+kit.posizione+"',"+kit.pannelli.length+")");
            button.setAttribute("class","action-button");
            button.setAttribute("style","height:calc(50% - 5px);margin-left:0px;width:40px");
            button.innerHTML='<i class="far fa-angle-left"></i>';
            scrollButtonsContainer.appendChild(button);
        }
        kitContainer.appendChild(scrollButtonsContainer);

        pannelliOuterContainer.appendChild(kitContainer);

        j++;
    });

    if(kit_pannelli.length>0)
    {
        document.getElementById("pannelliContainerInfoKit"+kit_pannelli[0].kit+kit_pannelli[0].posizione).click();
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

    var pannelliItems = document.getElementsByClassName("pannelli-item");
    for (let index2 = 0; index2 < [...new Set(findDuplicates(pannelli))].length; index2++)
    {
        const codice_pannello = [...new Set(findDuplicates(pannelli))][index2];

        var count = 0;
        for (let index = 0; index < pannelliItems.length; index++)
        {
            const pannelloContainer = pannelliItems[index];
            
            if(codice_pannello == pannelloContainer.getAttribute("codice_pannello"))
                count++;
        }

        var color = "hsl( " + makeColor(index2, count) + ", 100%, 50% )";

        for (let index = 0; index < pannelliItems.length; index++)
        {
            const pannelloContainer = pannelliItems[index];
            
            if(codice_pannello == pannelloContainer.getAttribute("codice_pannello"))
                pannelloContainer.style.border = "2px solid "+color;
        }
    }

    document.getElementById("totaliPrelievoLabel").innerHTML=kit_pannelli.length + " kit, " + (i - 1) + " pannelli";

    Swal.close();
}
function makeColor(colorNum, colors){
    if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
    return colorNum * (360 / colors) % 360;
}
async function filterCabineListPanelli(numero_cabina)
{
    var cookie_numeri_cabina = [];
    var button = document.getElementById("pannelliCabineContainerCabineItem"+numero_cabina);
    if(button.getAttribute("active") == "true")
    {
        button.style.backgroundColor="";
        button.setAttribute("active","false");
    }
    else
    {
        button.style.backgroundColor="#548CFF";
        button.setAttribute("active","true");
    }

    var cookie_numeri_cabina={};
    var cookie_numeri_cabina_string = await getCookie("cookie_numeri_cabina_string");
    if(cookie_numeri_cabina_string != "" && cookie_numeri_cabina_string != null && cookie_numeri_cabina_string != undefined)
        cookie_numeri_cabina = JSON.parse(cookie_numeri_cabina_string);
    if(cookie_numeri_cabina[lottoSelezionato.lotto] == undefined)
        cookie_numeri_cabina[lottoSelezionato.lotto] = {}
    cookie_numeri_cabina[lottoSelezionato.lotto][cabinaSelezionata.disegno_cabina] = [];
    var pannelliCabineContainerCabineItems = document.getElementsByClassName("pannelli-cabine-container-cabine-item");
    for (let index = 0; index < pannelliCabineContainerCabineItems.length; index++)
    {
        const item = pannelliCabineContainerCabineItems[index];
        
        if(item.getAttribute("active") == "true")
            cookie_numeri_cabina[lottoSelezionato.lotto][cabinaSelezionata.disegno_cabina].push(item.firstChild.innerHTML);
    }
    setCookie("cookie_numeri_cabina_string",JSON.stringify(cookie_numeri_cabina));

    getListKitPannelli();
}
function scrollPannelliContainer(how,kit,posizione,length)
{
    if(how=="right")
    {
        var n;
        var pannelliItems = document.getElementById("pannelliContainer"+kit+posizione).getElementsByClassName("pannelli-item");
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
            document.getElementById("pannelliContainer"+kit+posizione).getElementsByClassName("pannelli-item")[n].style.display="none";
            document.getElementById("pannelliContainer"+kit+posizione).getElementsByClassName("pannelli-item")[n+5].style.display="";
        }
    }
    else
    {
        var n;
        var pannelliItems = document.getElementById("pannelliContainer"+kit+posizione).getElementsByClassName("pannelli-item");
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
            document.getElementById("pannelliContainer"+kit+posizione).getElementsByClassName("pannelli-item")[n].style.display="none";
            document.getElementById("pannelliContainer"+kit+posizione).getElementsByClassName("pannelli-item")[n-5].style.display="";
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

    var numeri_cabina = [];
    var pannelliCabineContainerCabineItems = document.getElementsByClassName("pannelli-cabine-container-cabine-item");
    for (let index = 0; index < pannelliCabineContainerCabineItems.length; index++)
    {
        const item = pannelliCabineContainerCabineItems[index];
        
        if(item.getAttribute("active") == "true")
            numeri_cabina.push(item.firstChild.innerHTML);
    }

    $.post("registraPannelloPrelievo.php",{lotto,disegno_cabina,kit,posizione,codice_pannello,i,cabine:numeri_cabina,id_utente},
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
                Swal.close();
                try
                {
                    var responseObj = JSON.parse(response);
                    var numeri_cabina_pannello = responseObj.numeri_cabina_pannello;
                    
                    var backgroundColor="";
                    if(JSON.stringify(numeri_cabina.sort()) == JSON.stringify(numeri_cabina_pannello.sort()))
                    {
                        backgroundColor="#70B085";//green
                        pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit+"','"+posizione+"');eliminaPannelloPrelievo(this,'"+lotto+"','"+disegno_cabina+"','"+kit+"','"+posizione+"','"+codice_pannello+"',"+i+")");
                    }
                    else
                    {
                        if(numeri_cabina_pannello.length == 0)
                        {
                            backgroundColor="#404040";//black
                            pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit+"','"+posizione+"');registraPannelloPrelievo(this,'"+lotto+"','"+disegno_cabina+"','"+kit+"','"+posizione+"','"+codice_pannello+"',"+i+")");
                        }
                        else
                        {
                            backgroundColor="#E9A93A";//orange
                            pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit+"','"+posizione+"');registraPannelloPrelievo(this,'"+lotto+"','"+disegno_cabina+"','"+kit+"','"+posizione+"','"+codice_pannello+"',"+i+")");
                        }
                    }
                    
                    pannelloContainer.style.backgroundColor = backgroundColor;

                    if(pannelloContainer.getElementsByClassName("pannelli-item-icon-container-pannello")[0] != null)
                        pannelloContainer.getElementsByClassName("pannelli-item-icon-container-pannello")[0].remove();

                    var checked = false;
                    if(numeri_cabina_pannello.length > 0)
                    {
                        let checker = (arr, target) => target.every(v => arr.includes(v));
                        if(checker(numeri_cabina_pannello, numeri_cabina))
                            checked=true;
                    }
                    if(checked)
                    {
                        var div = document.createElement("div");
                        div.setAttribute("class","pannelli-item-icon-container-pannello");
                        var icon = document.createElement("i");
                        icon.setAttribute("class","fas fa-check-circle");
                        div.appendChild(icon);
                        pannelloContainer.appendChild(div);
                    }

                    //per passare al prossimo se tutti sono colorati
                    /*if(parseInt(responseObj.n) == parseInt(document.getElementById("pannelliContainer"+kit+posizione).getElementsByClassName("pannelli-item").length))
                    {
                        if(document.getElementById("pannelliContainer"+kit+posizione).nextSibling)
                        {
                            document.getElementById("pannelliContainer"+kit+posizione).nextSibling.getElementsByClassName("pannelli-container-info-kit")[0].click();
                            //document.getElementById("pannelliOuterContainer").scrollTop=document.getElementById("pannelliOuterContainer").scrollTop+80;
                        }
                        else
                        {
                            document.getElementsByClassName("pannelli-container")[0].getElementsByClassName("pannelli-container-info-kit")[0].click();
                            document.getElementById("pannelliOuterContainer").scrollTop=0;
                        }
                    }*/
                }
                catch (error)
                {
                    setTimeout(() => {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    }, 500);
                }
            }
        }
    });
}
function getNumeriCabinaPannello(event,pannelloContainer,lotto,disegno_cabina,kit,posizione,codice_pannello,i)
{
    console.log("y'all");
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

    var numeri_cabina = [];
    var pannelliCabineContainerCabineItems = document.getElementsByClassName("pannelli-cabine-container-cabine-item");
    for (let index = 0; index < pannelliCabineContainerCabineItems.length; index++)
    {
        const item = pannelliCabineContainerCabineItems[index];
        
        if(item.getAttribute("active") == "true")
            numeri_cabina.push(item.firstChild.innerHTML);
    }

    $.post("eliminaPannelloPrelievo.php",{lotto,disegno_cabina,kit,posizione,codice_pannello,i,cabine:numeri_cabina,id_utente},
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
                pannelloContainer.setAttribute("onclick","getPdf('kit','"+kit+"','"+posizione+"');registraPannelloPrelievo(this,'"+lotto+"','"+disegno_cabina+"','"+kit+"','"+posizione+"','"+codice_pannello+"',"+i+")");
                pannelloContainer.style.backgroundColor = "#404040";
                if(pannelloContainer.getElementsByClassName("pannelli-item-icon-container-pannello")[0] != null)
                    pannelloContainer.getElementsByClassName("pannelli-item-icon-container-pannello")[0].remove();
                Swal.close();
            }
        }
    });
}
function disableCheckboxPannello(event)
{
    event.stopPropagation();
}
function getPannelli()
{
    var numeri_cabina = [];
    var pannelliCabineContainerCabineItems = document.getElementsByClassName("pannelli-cabine-container-cabine-item");
    for (let index = 0; index < pannelliCabineContainerCabineItems.length; index++)
    {
        const item = pannelliCabineContainerCabineItems[index];
        
        if(item.getAttribute("active") == "true")
            numeri_cabina.push(item.firstChild.innerHTML);
    }

    return new Promise(function (resolve, reject) 
    {
        $.get("getPannelliPrelievo.php",{disegno_cabina:cabinaSelezionata.disegno_cabina,lotto:lottoSelezionato.lotto,numeri_cabina},
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
async function getPdf(folder,fileName,posizione)
{
    try {
        var pannelliContainers = document.getElementsByClassName("pannelli-container-info-kit");
        for (let index = 0; index < pannelliContainers.length; index++)
        {
            const pannelloContainer = pannelliContainers[index];
    
            pannelloContainer.style.color="#EBEBEB";
        }
        document.getElementById("pannelliContainerInfoKit"+fileName+posizione).style.color="#548CFF";
    } catch (error) {}

    checkMessage(lottoSelezionato.commessa,lottoSelezionato.lotto,'%',cabinaSelezionata.disegno_cabina,fileName,stazione.nome);

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
    if(view == "pannelli")
        document.getElementById("pannelliOuterContainer").scrollTop = 0;
    else
        document.getElementById("listInnerContainer").scrollTop = 0;
}
function listToBottom()
{
    if(view == "pannelli")
        document.getElementById("pannelliOuterContainer").scrollTo(0,document.getElementById("pannelliOuterContainer").scrollHeight);
    else
        document.getElementById("listInnerContainer").scrollTo(0,document.getElementById("listInnerContainer").scrollHeight);
}
function listScrolltop()
{
    if(view == "pannelli")
        document.getElementById("pannelliOuterContainer").scrollTop = document.getElementById("pannelliOuterContainer").scrollTop-45;
    else
        document.getElementById("listInnerContainer").scrollTop = document.getElementById("listInnerContainer").scrollTop-45;
}
function listScrolldown()
{
    if(view == "pannelli")
        document.getElementById("pannelliOuterContainer").scrollTop = document.getElementById("pannelliOuterContainer").scrollTop+45;
    else
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