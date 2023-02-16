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

doms.add.onclick = function () {
    // console.log(this, 'doms.add')
    doms.multiRow.innerHTML += `
                <div class="form-item">
                    <div class="row">
                        <input class="item" type="text"  name="opt"  title="选项" placeholder="选项">
                        <input class="item" type="text"   name="name" title="变量名" placeholder="变量名">
                        <input class="item" type="number"  name="isempty" title="是否可不传选项" placeholder="是否可不传选项" min="0" max="1" value="0">
                        <input class="item" type="text"   name="desc" title="描述" placeholder="描述">
                    </div>
                    <button type="button" class="generate del">X</button>
                    <p class="msg"></p>
                </div>
    `
}

function validRow(row) {
    var err = ''
    for (var j = 0; j <= row.children.length - 1; j++) {
        var input = row.children[j]
        if (input.value === '') {
            err += `${input.name} 不可以为空;`
        }

        if (input.name === 'name') {
            console.log('input.name', input.value);
            if (!/^[^\d]\w+$/.test(input.value)) {
                console.log(input.value)
                err += `变量格式非数字开头，后面接0/1/多个字符(0-9a-zA-Z_);`
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
            defaults += `\: \${${item.name}:-默认值}`
            description += `#${item.opt} 选项可以省略<br/>`
            defaultsvars += `\$${item.name} `
        }
    }
    if (vars) {
        vars = 'echo ' + vars
    }
    if (defaultsvars) {
        defaultsvars = 'echo ' + defaultsvars
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
            <p>#getflag -d;  获取 -d flag的状态 1有。默认0没有。</p>
    `
})
