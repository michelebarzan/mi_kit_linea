var lotti;
var lottoSelezionato;

window.addEventListener("load", async function(event)
{
    var nome_linea=await getSessionValue("linea");
    var nome_stazione=await getSessionValue("stazione");

    var linee=await getAnagraficaLinee();
    var stazioni=await getAnagraficaStazioni();

    var stazione=getFirstObjByPropValue(stazioni,"nome",nome_stazione);
    var linea=getFirstObjByPropValue(linee,"nome",nome_linea);

    var dot=document.title;
    document.title=linea.label + " " + dot + " " + stazione.label;

    document.getElementById("infoLineaContainer").innerHTML=linea.label;
    document.getElementById("infoLineaContainer").setAttribute("nome",linea.nome);
    document.getElementById("infoLineaContainer").setAttribute("id_linea",linea.id_linea);
    
    document.getElementById("infoStazioneContainer").innerHTML=stazione.label;
    document.getElementById("infoStazioneContainer").setAttribute("nome",stazione.nome);
    document.getElementById("infoStazioneContainer").setAttribute("id_stazione",stazione.id_stazione);

    var username=await getSessionValue("username");
    document.getElementById("usernameContainer").innerHTML=username+'<i class="fad fa-user" style="margin-left:20px"></i>';

    getListLotti();

});
async function getListLotti()
{
    var container=document.getElementById("listInnerContainer");

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

        var span=document.createElement("span");
        span.innerHTML=number;
        item.appendChild(span);

        var span=document.createElement("span");
        span.innerHTML=lotto.lotto;
        item.appendChild(span);

        container.appendChild(item);

        i++;
    });
}
function selectLotto(number)
{
    lottoSelezionato=getFirstObjByPropValue(lotti,"number",number);
    document.getElementById("labelLottoSelezionato").innerHTML="Lotto "+lottoSelezionato.lotto;
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