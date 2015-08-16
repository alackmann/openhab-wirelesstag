// Wrap everything in a function
(function(i) {
    // get the last line of the file
    var data = i.split(/\n/);
    var temp = data[data.length - 2].split(",");
    return temp[2];
})(input)
// input variable contains data passed by openhab