function poisson(expectvalue){

    var n = 0,
	limit = Math.exp(-expectvalue),
	x = Math.random();

    while(x > limit){
        n++;
        x *= Math.random();;
    }

    return n;
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function loadImage(src){
    var image = new Image();
    image.src = src;

    image.onload = drawImage;
}

function drawImage(event){
    var image = event.target;
    var width = image.width;
    var height = image.height;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image,0,0);

    var imagePixel = ctx.getImageData(0,0,width,height);
    var oimagePixel = ctx.getImageData(0,0,width,height);

    ///////

    var gs = [[]];
    for (x = 0; x < imagePixel.width; x++) {
        gs[x]=[];
        for (y = 0; y < imagePixel.height; y++) {
            var i = ( y * 4 ) * imagePixel.width + x * 4;
            var avg = ( imagePixel.data[i] + imagePixel.data[i+1] + imagePixel.data[i+2] ) /3;
            imagePixel.data[i] = avg;
            imagePixel.data[i+1] = avg;
            imagePixel.data[i+2] = avg;
            gs[x][y] = avg;
        }
    }
    ctx.putImageData(imagePixel, 0,0,0,0, imagePixel.width, imagePixel.height);

    var sobelX = [
        [-1,0,1],
        [-2,0,2],
        [-1,0,1]
    ];
    var sobelY = [
        [-1,-2,-1],
        [0,0,0],
        [1,2,1]
    ];
    // alert(sobelX[0][2]);
    var edge = [[]];
    for (x = 1; x < imagePixel.width-1; x++) {
        edge[x] = [];
        for (y = 1; y < imagePixel.height-1; y++) {
            var pixelX = (
                sobelX[0][0] * gs[x-1][y-1] + sobelX[0][1] * gs[x][y-1] + sobelX[0][2] * gs[x+1][y-1] +
                sobelX[1][0] * gs[x-1][y]   + sobelX[1][1] * gs[x][y]   + sobelX[1][2] * gs[x+1][y]   +
                sobelX[2][0] * gs[x-1][y+1] + sobelX[2][1] * gs[x][y+1] + sobelX[2][2] * gs[x+1][y+1]
            );
            var pixelY = (
                sobelY[0][0] * gs[x-1][y-1] + sobelY[0][1] * gs[x][y-1] + sobelY[0][2] * gs[x+1][y-1] +
                sobelY[1][0] * gs[x-1][y]   + sobelY[1][1] * gs[x][y]   + sobelY[1][2] * gs[x+1][y]   +
                sobelY[2][0] * gs[x-1][y+1] + sobelY[2][1] * gs[x][y+1] + sobelY[2][2] * gs[x+1][y+1]
            );
            var magnitude = Math.sqrt( (pixelX * pixelX) + (pixelY * pixelY) ) >> 0;
            var i = ( y * 4 ) * imagePixel.width + x * 4;
            // imagePixel.data[i] = magnitude;
            // imagePixel.data[i+1] = magnitude;
            // imagePixel.data[i+2] = magnitude;
            edge[x][y] = magnitude;
        }
    }
    // ctx.putImageData(imagePixel, 0,0,0,0, imagePixel.width, imagePixel.height);


    //////
    var prev = 0;
    var point = [];
    for (x = 0; x < imagePixel.width; x+= Math.floor( (Math.random()*5) + 1) ) {
        for (y = 0; y < imagePixel.height;) {
            var i = ( y * 4 ) * imagePixel.width + x * 4;
            var current = imagePixel.data[i] + imagePixel.data[i+1] + imagePixel.data[i+2];
            if (Math.abs(current - prev) > 80 ) {
                prev = current;
                // imagePixel.data[i] = 255;
                // imagePixel.data[i+1] = 0;
                // imagePixel.data[i+2] = 0;
                point.push([x, y]);
                y += Math.floor( (Math.random()*5) + 1);
            }
            else {
                y += 1;
            }
        }
    }
    // ctx.putImageData(imagePixel, 0,0,0,0, imagePixel.width, imagePixel.height);


    //////
    // ctx.lineWidth = 1;

    var line = delaunay.triangulate( point );
    for ( var i = 0; i < line.length; i += 3 ) {
        ctx.beginPath();
        var x = point[line[i]][0], y = point[line[i]][1];
        ctx.moveTo( x, y );
        ctx.lineTo( point[line[i + 1]][0], point[line[i + 1]][1] );
        ctx.lineTo( point[line[i + 2]][0], point[line[i + 2]][1] );
        ctx.closePath();
        var my = ((y + point[line[i + 1]][1] + point[line[i + 2]][1]) / 3) << 0;
        var mx = ((x + point[line[i + 1]][0] + point[line[i + 2]][0]) / 3) << 0;
        var oindex = (my * imagePixel.width + mx) * 4;
        ctx.strokeStyle = "rgba(" + oimagePixel.data[oindex] + "," + oimagePixel.data[oindex + 1] + "," + oimagePixel.data[oindex + 2] + ",1)";
        ctx.fillStyle = "rgba(" + oimagePixel.data[oindex] + "," + oimagePixel.data[oindex + 1] + "," + oimagePixel.data[oindex + 2] + ",1)";
        ctx.stroke();
        ctx.fill();
    }

}

loadImage('images/blueberry.jpg');
