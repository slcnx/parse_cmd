function $(selector) {
    return document.querySelector(selector)
}

function $$(selector) {
    return document.querySelectorAll(selector)
}


var doms = {
    add: $('.add'),
    generate: $('#generate'),
    edit: $('.edit'),
    multiRow: $('.multi-row'),
    content: $('.content'),
    copy: $('.copy')
}

doms.copy.onclick = function() {
    text = doms.content.innerText
    if (!text) {
        return
    }
    navigator.clipboard.writeText(text);
    doms.copy.innerText = '复制成功'
    doms.copy.style.color = '#0f0'
    setTimeout(function() {
        doms.copy.style.color = ''
        doms.copy.innerText = 'copy'
    },1000)
}

doms.multiRow.onclick = function (e) {
    var target = e.target
    if (target.tagName === 'BUTTON') {
        // console.log(target)
        var row = target.parentElement
        row.style.backgroundColor = 'rgba(0, 0, 0, .1)'
        setTimeout(function () {
            if (confirm('是否删除此行?')) {
                row.remove()
            } else {
                row.style.backgroundColor = ''
            }
        }, 0)
    }
}
doms.multiRow.oninput = debounce(function (e) {
    var target = e.target
    if (target.tagName === 'INPUT') {
        validRow(target.parentElement)
    }
}, 500)

doms.multiRow.onchange = function(e) {
    var target = e.target
    if (target.tagName === 'INPUT') {
        if (target.getAttribute('name') === 'name') {
            if (target.value) {
                if (!target.parentElement.children[0].value) {
                    return
                }
                if (confirm('选项的参数是否需要必传？')) {
                    target.parentElement.children[2].value = 0
                } else {
                    target.parentElement.children[2].value = 1
                }
            }
        }
    }
}


doms.add.onclick = function () {
    // console.log(this, 'doms.add')

    var div = document.createElement('div')
    div.className = 'form-item'
    var row = document.createElement('div')
    row.classList.add('row')
    div.appendChild(row)
    row_addinput(row,'item', 'opt', '选项', '')
    row_addinput(row,'item', 'name', '变量名', '')
    row_addinput(row,'item', 'isempty', '是否可不传选项', 0, true)
    row_addinput(row,'item', 'desc', '描述', '')

    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'generate del'
    btn.innerText = 'X'
    div.appendChild(btn)
    
    var p = document.createElement('p')
    p.className = 'msg'
    div.appendChild(p)

    doms.multiRow.appendChild(div)
}
function row_addinput(row,className,name,title,value,disabled) {
    var input = document.createElement('input')
    input.className = className
    input.name = name
    input.title = title
    input.placeholder = title
    input.value = value
    disabled && (input.disabled = true)
    row.appendChild(input)
}

function validRow(row) {
    var err = ''
    var val = null 
    for (var j = 0; j <= row.children.length - 1; j++) {
        var input = row.children[j]
        val = input.value
        debugger
        if (input.name !== 'name' && input.name !== 'desc') {
            if (val === '') {
                err += `${input.name} 不可以为空;`
            }
        }
        
        if (input.name === 'name') {
            
            if (val) {
                console.log(input.parentElement.children[0].value,'>>>')
                if (!input.parentElement.children[0].value) {
                    input.value = ''
                }
                if (!/^[^\d]\w+$/.test(val)) {
                    err += `变量格式非数字开头，后面接0/1/多个字符(0-9a-zA-Z_);`
                }
                
            } else {
                input.parentElement.children[2].value = 1
            }
        } 
    }

    // console.log(err)
    var msg = row.parentElement.querySelector('.msg')
    msg.classList.add('err')
    msg.innerHTML = err
    return !err
}

doms.generate.addEventListener('click', function () {
    // console.log('generate')
    var rows = $$('.edit .form-item')
    var result = []
    for (var i = 0; i <= rows.length - 1; i++) {
        var row = rows[i].querySelector('.row')
        // console.log(row, '---')
        if (!validRow(row)) {
            return
        }
        var obj = {}
        for (var j = 0; j <= row.children.length - 1; j++) {
            var input = row.children[j]
            // console.log(input)
            if (input.name === 'opt') {
                obj.opt = input.value
                continue
            }
            if (input.name === 'name') {
                obj.name = input.value
                continue
            }
            if (input.name === 'isempty') {
                obj.isempty = parseFloat(input.value)
                continue
            }
            if (input.name === 'desc') {
                obj.desc = input.value
                continue
            }
        }
        result.push(obj)
    }

    // console.log(result)
    var txt = ''
    var vars = ''
    var defaults = ''
    var description = ''
    var defaultsvars = ''
    for (var i = 0; i < result.length; i++) {
        var item = result[i]
        txt += `<p>${item.opt}&nbsp;&nbsp;&nbsp;&nbsp;,${item.name}&nbsp;&nbsp;&nbsp;&nbsp;,${item.isempty}&nbsp;&nbsp;&nbsp;&nbsp;,${item.desc}</p>`
        // 非空，选项必须传递
        if (!item.isempty) {
            vars += `\$${item.name} `
            description += `#${item.opt} 选项必须传递<br/>`
        } else {
            // 说明给变量，选项有参数
            if (item.name) {
                defaults += `\: \${${item.name}:-默认值}`
                description += `#${item.opt} 选项可以省略<br/>`
                defaultsvars += `\$${item.name} `
            } else {
                // 没有变量，选项无参数
                description += `#${item.opt} 选项可以省略，且是一个flag。省略为0,添加为1`

                defaultsvars += `${item.opt} state: \$(getflag '${item.opt}') `
            }

        }
    }
    if (vars) {
        vars = 'echo ' + vars
    }
    if (defaultsvars) {
        defaultsvars = `echo "${defaultsvars}"`
    }
    doms.content.innerHTML = ''
    doms.content.innerHTML += `
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
})
