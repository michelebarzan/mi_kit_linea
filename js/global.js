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
    this.which_column=arguments.which_column;
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
        var n=0;
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
                        var which_array = [];
                        this.og_data.forEach(rowLcl =>
                        {
                            if(rowLcl[this.column] == row[this.column])
                                which_array.push(rowLcl[this.which_column]);
                        });
                        n = which_array.join(this.which_join_separator);
                    break;
                }
            }
        });

        var new_row = $.extend( true, {}, group_by_row );

        new_row[this.label]=n;

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