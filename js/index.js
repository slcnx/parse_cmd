
function $(cssSelector) {
    return document.querySelector(cssSelector)
}
var doms = {
    table: $('.table'),
    add: $('.control .add'),
    generate: $('.control .generate'),
    consoleText: $('.console-text')
}

// col
var columnNums = 5

function init() {
    // 添加1个
    add()
    bindEvents()
}
init()

function bindEvents() {
    doms.add.onclick = add

    // 删除点击事件 委托
    doms.table.addEventListener('click', function (e) {
        var target = e.target
        if (target.tagName === 'BUTTON') {
            if (target.classList.contains('del')) {
                RowBtnDel(target)
            }
        }
    })

    // 点击生成脚本内容
    doms.generate.onclick = onGenerateContent
}

function onGenerateContent(e) {
    // 第1行不要
    var totalRow = (doms.table.children.length / columnNums) - 1
    var result = []
    for (var row = 1; row <= totalRow; row++) {
        var currentRowVal = getRowChildsVal(row)
        // console.log(currentRowVal);

        result.push(currentRowVal)
    }

    // 生成内容
    generateConsoleText(result)
}

function generateConsoleText(result) {
    var txt = ''
    var vars = ''
    var defaults = ''
    var description = ''
    var defaultsvars = ''
    for (var i = 0; i < result.length; i++) {
        var item = result[i]
        txt += `<p>${item.option}&nbsp;&nbsp;&nbsp;&nbsp;,${item.var}&nbsp;&nbsp;&nbsp;&nbsp;,${item.required ? 0 : 1}&nbsp;&nbsp;&nbsp;&nbsp;,${item.desc}</p>`
        // 非空，选项必须传递
        if (!item.required) {
            // 说明给变量，选项有参数
            if (item.var) {
                defaults += `\: \${${item.var}:=默认值}<br/>`
                description += `#${item.option} 选项可以省略<br/>`
                defaultsvars += `\$${item.var} `
            } else {
                // 没有变量，选项无参数
                description += `#${item.option} 选项可以省略，且是一个flag。省略为0,添加为1`

                defaultsvars += `${item.option} state: \$(getflag '${item.option}') `
            }
        } else {
            vars += `\$${item.var} `
            description += `#${item.option} 选项必须传递<br/>`
        }

    }
    if (vars) {
        vars = 'echo ' + vars
    }
    if (defaultsvars) {
        defaultsvars = `echo "${defaultsvars}"`
    }
    doms.consoleText.innerHTML = ''
    doms.consoleText.innerHTML += `
        <p>#描述: <br/> ${description}</p>
        <p>source <(curl -sSLf https://gitee.com/slcnx/tools/raw/master/parse_cmd.sh |     sed 's/\\r//g')</p>
            <p>CONFIG='</p>
            <p> key&nbsp;&nbsp;&nbsp;&nbsp;,argument&nbsp;&nbsp;&nbsp;&nbsp;,isempty&nbsp;&nbsp;&nbsp;&nbsp;,desc&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
            ${txt}
            <p>'</p>
            <p>parse_cmd $@</p>
            <p>${vars}</p>
            <p>${defaults}</p>
            <p>${defaultsvars}</p>
    `
}

function getRow(item) {
    return Array.prototype.indexOf.call(doms.table.children, item.parentElement) + 1
}


function RowBtnDel(target) {
    var index = getRow(target)
    var row = index / columnNums
    var childs = getRowChilds(row - 1)
    // console.log(childs)
    for (var i = 0; i <= childs.length - 1; i++) {
        childs[i].remove()
    }
}

function getRowChilds(n) {
    var doms = {
        table: $('.table'),
    }
    n++
    var max = n * columnNums
    var currentRow = []
    for (var i = max - (columnNums - 1); i <= max; i++) {
        // i-1 哪个item
        var item = doms.table.children[i - 1]
        currentRow.push(item)
    }
    return currentRow
}

function getRowChildsVal(n) {
    var doms = {
        table: $('.table'),
    }
    n++
    var max = n * columnNums
    var currentRowVal = Object.create(null)
    for (var i = max - (columnNums - 1); i <= max; i++) {
        // i-1 哪个item
        var item = doms.table.children[i - 1]
        if (i === max - 2) {
            var checkbox = item.querySelector('input')
            currentRowVal[checkbox.name] = checkbox.checked
        } else if (i === max) {
            true
        }
        else {
            var txt = item.querySelector('.txt')
            currentRowVal[txt.name] = txt.value
        }
    }
    return currentRowVal
}



function add() {
    var item1 = document.createElement("div");
    item1.classList.add("item");
    // create the first input element
    var input1 = document.createElement("input");
    input1.setAttribute("type", "text");
    input1.name = 'option'
    input1.classList.add("txt");
    item1.appendChild(input1);


    var item2 = item1.cloneNode()
    // create the second input element
    var input2 = document.createElement("input");
    input2.setAttribute("type", "text");
    input2.classList.add("txt");
    input2.name = 'var'
    item2.appendChild(input2)

    var item3 = item1.cloneNode()
    // create the third input element (checkbox)
    var checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("checked", "");
    checkbox.classList.add("txt");
    checkbox.name = 'required'
    item3.appendChild(checkbox)



    var item4 = item1.cloneNode()
    // create the fourth element (textarea)
    var textarea = document.createElement("textarea");
    textarea.classList.add("txt");
    textarea.name = 'desc'
    item4.appendChild(textarea)

    var item5 = item1.cloneNode()
    // create the delete button
    var button = document.createElement("button");
    button.setAttribute("type", "button");
    button.classList.add("del");
    button.textContent = "删除";
    item5.appendChild(button)

    doms.table.appendChild(item1)
    doms.table.appendChild(item2)
    doms.table.appendChild(item3)
    doms.table.appendChild(item4)
    doms.table.appendChild(item5)

    // 事件
    function _checkRequired(e) {
        if (input1.value && !input2.value) {
            checkbox.checked = true
        }
    }

    input1.onchange = _checkRequired
    input2.onchange = _checkRequired
    checkbox.onchange = _checkRequired
    textarea.onchange = _checkRequired
}

