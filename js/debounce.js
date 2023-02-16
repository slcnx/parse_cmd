var debounce = (function () {
    return function (fn, delay) {

        var timerId = null
        return function () {
            if (timerId) {
                clearTimeout(timerId)
                timerId = null
            }
            var args = Array.prototype.slice.call(arguments, 0)
            timerId = setTimeout(function () {
                // console.log(args)
                fn.apply(null, args)
                timerId = null
            }, delay)
        }
    }
})()