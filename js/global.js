function setCookie(name,value)
{
    $.post("setCookie.php",{name,value},
    function(response, status)
    {
        if(status!="success")
            console.log(status);
    });
}
function getCookie(name)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getCookie.php",{name},
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
function getSessionValue(name)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getSessionValue.php",{name},
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
function setSessionValue(name,value)
{

}
function getServerValue(name)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getServerValue.php",{name},
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
function getFirstObjByPropValue(array,prop,propValue)
{
    var return_item;
    array.forEach(function(item)
    {
        if(item[prop]==propValue)
        {
            return_item= item;
        }
    });
    return return_item;
}
function logout()
{
    $.get("logout.php",
    function(response, status)
    {
        window.location = 'login.html';
    });
}
function arrayCompare(array1,array2)
{
	var equals = true;

    if(array1.length != array2.length)
        equals = false;
    else
    {
        array1.forEach(element1 =>
        {
            if(array2.filter(function (element2)
            {
                var equals_lcl = true;
                for (const property in element2)
                {
                    if(element2[property] != element1[property])
                        equals_lcl = false;
                }
                if(equals_lcl)
                    return element2;
            }).length == 0)
                equals = false;
        });
    }

	return equals;
}
function getMiKitLineaParams()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getMiKitLineaParams.php",
        function(response, status)
        {
            if(status=="success")
                resolve(JSON.parse(response));
        });
    });
}
function groupByJS(arguments)
{
    var self=this;
    this.og_data=arguments.data;
    this.group_by_columns=arguments.group_by_columns;
    this.operator=arguments.operator;
    this.column=arguments.column;
    this.label=arguments.label;
    this.which_columns=arguments.which_columns;
    this.which_join_separator=arguments.which_join_separator;

    this.data=[];

    var group_by_data=[];
    this.og_data.forEach(row =>
    {
        var group_by_columns_obj={};
        this.group_by_columns.forEach(column =>
        {
            group_by_columns_obj[column]=row[column]
        });
        group_by_data.push(group_by_columns_obj);
    });

    group_by_data=objArrayUnique(group_by_data);
    
    group_by_data.forEach(group_by_row =>
    {
        //console.log(group_by_row)
        var n=0;
        var n_obj={};
        this.which_columns.forEach(column =>
        {
            n_obj[column]=[];
        });

        this.og_data.forEach(row =>
        {
            var equals=true;
            for (var key in group_by_row)
            {
                if (group_by_row.hasOwnProperty(key))
                {
                    if(group_by_row[key] !== row[key])
                        equals=false;
                }
            }
            if(equals)
            {
                switch (this.operator)
                {
                    case "SUM":
                        n+=row[this.column];
                    break;
                    case "COUNT":
                        n++;
                    break;
                    case "WHICH":
                        for (let index = 0; index < this.which_columns.length; index++)
                        {
                            const column = this.which_columns[index];
                            n_obj[column].push(row[column]);
                        }
                    break;
                }
            }
        });

        var new_row = $.extend( true, {}, group_by_row );

        //console.log(n_obj);
        switch (this.operator)
        {
            case "SUM":
                new_row[this.label]=n;
            break;
            case "COUNT":
                new_row[this.label]=n;
            break;
            case "WHICH":
                this.which_columns.forEach(column =>
                {
                    var values = [...new Set(n_obj[column])];
                    var value;
                    
                    if (typeof values[0] === 'string' || values[0] instanceof String)
                        value = values.join(this.which_join_separator);
                    else
                    {
                        value=values[0];
                    }

                    new_row[column]=value;
                });
            break;
        }

        this.data.push(new_row);
    });

    return this.data;
    
    function objArrayUnique(array)
    {
        var array_unique=[];
        array.forEach(element =>
        {
            var push=true;
            array_unique.forEach(element_unique =>
            {
                var equals=true;
                for (var key in element_unique)
                {
                    if (element_unique.hasOwnProperty(key))
                    {
                        if(element_unique[key] !== element[key])
                            equals=false;
                    }
                }
                if(equals)
                    push=false;
            });
            if(push)
                array_unique.push(element);
        });
        return array_unique;
    }
}
function getPopupMessage()
{
    var messagesHtml = document.getElementById("messageContainer").innerHTML;

    var outerContainer = document.createElement("div");
    outerContainer.setAttribute("class","outer-container-popup-message");
    outerContainer.innerHTML = messagesHtml;

    Swal.fire
    ({
        icon:"warning",
        title: 'Messaggi previsti',
        html: outerContainer.outerHTML,
        showCloseButton: true,
        showConfirmButton:false,
        showCancelButton:false,
        background:"#353535",
        onOpen : function()
                {
                    document.getElementsByClassName("swal2-close")[0].style.outline="none";
                    document.getElementsByClassName("swal2-title")[0].style.fontSize="18px";
                }
    });
}
function checkMessage(commessa,lotto,numero_cabina,disegno_cabina,kit,stazione)
{
    /*Swal.fire
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
    });*/

    var container = document.getElementById("messageContainer");
    container.style.display = "none";
    container.innerHTML = "";

    $.get("checkMessage.php",
    {
        commessa,lotto,numero_cabina,disegno_cabina,kit,stazione
    },
    function(response, status)
    {
        if(status=="success")
        {
            //Swal.close();
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                Swal.fire({icon:"error",title: "Errore messaggistica. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
            }
            else
            {
                try
                {
                    var messages = JSON.parse(response);

                    if(messages.length > 0)
                    {
                        container.style.display = "";

                        for (let index = 0; index < messages.length; index++)
                        {
                            const message = messages[index];
                            
                            var span = document.createElement("span");
                            span.innerHTML = message;
                            container.appendChild(span);
                        }
                    }
                } catch (error) {console.log(error,response)
                    setTimeout(() => {
                        Swal.fire({icon:"error",title: "Errore messaggistica. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementsByClassName("swal2-title")[0].style.fontSize="15px";}});
                    }, 500);
                }
            }
        }
        else
        {
            Swal.fire({icon:"error",title: "Errore messaggistica. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
            console.log(response);
        }
    });
}