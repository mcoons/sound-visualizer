//////////////////////////////////////////////////////////////////////
// Utility Functions
//////////////////////////////////////////////////////////////////////

function drawCircle(ctx, cx, cy, radius, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius, 0, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  function drawPoint(ctx, x, y, width = 1) {
    ctx.fillRect(x - width / 2, y - width / 2, width, width);
  }
  
  function drawCenteredText(ctx, x, y, txt, font) {
    ctx.textAlign = 'center';
    ctx.font = font;
    ctx.fillText(txt, x, y);
  }
  
  function drawText(ctx, x, y, txt, font) {
    ctx.textAlign = 'left';
    ctx.font = font;
    ctx.fillText(txt, x, y);
  }
  
  function clear(ctx) {
    ctx.clearRect(-halfWidth, -halfHeight, width, height);
  }
  
  //////////////////////////////////////////////////////////////////////
  // Palette Functions
  //////////////////////////////////////////////////////////////////////
  
  // index:   into color palette array[1530]
  // percent: -1 = black bias, 0 = actual, 1 = white bias
  function getColor(index, percent = 0) {
    let color = palette[index % 1530].color;
    let newColor = shadeRGBColor(color, percent);
    return newColor;
  }
  
  // color:   rgb color 
  // percent: -1 = black bias, 0 = actual, 1 = white bias
  function shadeRGBColor(color, percent = 0) {
    let f = color.split(','),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = parseInt(f[0].slice(4)),
        G = parseInt(f[1]),
        B = parseInt(f[2]);
  
    return 'rgb(' + (Math.round((t - R) * p) + R) + ',' +
      (Math.round((t - G) * p) + G) + ',' +
      (Math.round((t - B) * p) + B) + ')';
  }
  
  function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
      throw 'Invalid color component';
    return ((r << 16) | (g << 8) | b).toString(16);
  }
  
  // Builds a palette array[1530] of palette objects
  function buildPalette() {
    let r = 255,
        g = 0,
        b = 0;
  
    for (g = 0; g <= 255; g++) {
      addToPalette(r, g, b);
    }
    g--;
  
    for (r = 254; r >= 0; r--) {
      addToPalette(r, g, b);
    }
    r++;
  
    for (b = 1; b <= 255; b++) {
      addToPalette(r, g, b);
    }
    b--;
  
    for (g = 254; g >= 0; g--) {
      addToPalette(r, g, b);
    }
    g++;
  
    for (r = 1; r <= 255; r++) {
      addToPalette(r, g, b);
    }
    r--;
  
    for (b = 254; b > 0; b--) {
      addToPalette(r, g, b);
    }
    b++;
  
    function addToPalette(r, g, b) {
      palette.push({
        r,
        g,
        b,
        color: `rgb(${r},${g},${b})`
      });
    }
  
    console.log(palette);
  }
  