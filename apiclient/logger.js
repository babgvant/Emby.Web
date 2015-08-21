var Logger = {

    //Since the log function simply calls "console.log" use bind if it exists
    //This way the correct file/line is logged in the console
    log: Function.prototype.bind ? console.log.bind(console) : function (str) {
        console.log(str);
    }
};