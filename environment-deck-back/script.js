/*
============================================================================
Loading and app prep-work
============================================================================
*/


// Get and load graphics
// Note: Google Drive simple view link: https://drive.google.com/uc?id=FILE_ID
let imagesToPreload = [
  ['Border', '../_resources/environment deck back border.png'],
  ['test_ball', '../_resources/test_ball.png'],
  ['test_gyro', '../_resources/test_gyro.png'],
  ['test_shell', '../_resources/test_shell.png'],
  ['test_hyperspin', '../_resources/test_hyperspin.png'],
  ['test_name', '../_resources/test_namelogo.png']
]
let loadedGraphics = {};
imagesToPreload.forEach((image) => {
  let newImage = new Image();
  newImage.src = image[1];
  loadedGraphics[image[0]] = newImage;
})

// Handle user image uploading
var cardArtImage;
$('#inputImageFile').on('input', function (e) {
  // Get the uploaded file
  let uploadedImage = e.target.files[0];
  // If a file has been uploaded...
  if (uploadedImage) {
    // Turn that file into a useable Image object
    var url = URL.createObjectURL(uploadedImage);
    cardArtImage = new Image();
    cardArtImage.src = url;
    cardArtImage.onload = function (e) {
      // Once the Image has loaded, redraw the canvas so it immediately appears
      drawCardCanvas();
    }
  }
})


/*
============================================================================
Drawing the canvas
============================================================================
*/

// Draw the canvas from scratch (this function gets called whenever an input changes)
function drawCardCanvas() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Reset context states
  ctx.restore();
  ctx.save();

  // Draw a blank white rectangle background (for if no image so it's not awkwardly transparent)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Reset context states
  ctx.restore();
  ctx.save();

  // Blank background default
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (cardArtImage) {
    drawCardArt();
  }

  drawCardTitle();

  // Last of all, draw the card border
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(loadedGraphics['Border'], 0, 0, canvas.width, canvas.height);

}

function drawCardArt() {

  // Crunch some numbers to get the crop, position, and scale of the image
  let outerX = 3;
  let outerY = 4; // Margin between left/right edge and crop area
  let imageAreaWidth = pw(100);
  let imageAreaHeight = ph(100);
  let imageAreaRatio = imageAreaWidth / imageAreaHeight;
  let imageWidth = cardArtImage.width;
  let imageHeight = cardArtImage.height;
  let imageRatio = imageWidth / imageHeight;
  let initialScale = 1;

  // Get offset values
  let imageOffsetX = parseInt($('.inputImageOffsetX').prop('value'));
  let imageOffsetY = parseInt($('.inputImageOffsetY').prop('value')) * -1;
  let userScale = parseInt($('.inputImageScale').prop('value'));

  // Draw the image

  if (imageRatio > imageAreaRatio) {
    // If image ratio is wider than image area ratio, fit to height
    initialScale = imageAreaHeight / imageHeight;
  }
  else {
    // Otherwise, fit to width
    initialScale = imageAreaWidth / imageWidth;
  }
  let drawScale = initialScale * userScale / 100; // Eventually I'll add user input to this

  // Scale the image
  let drawWidth = imageWidth * drawScale;
  let drawHeight = imageHeight * drawScale;
  // Horizontally center the image in the area
  //let drawX = (pw(50) - drawWidth / 2);
  let drawX = (pw(outerX) + imageAreaWidth / 2 - drawWidth / 2);
  // Add user offset
  drawX += drawWidth * imageOffsetX / 100;
  // Vertically center the image in the area
  let drawY = (ph(50) - drawHeight / 2);
  // Add user offset
  drawY += drawHeight * imageOffsetY / 100;

  // Finally, draw the image to the canvas!
  ctx.drawImage(cardArtImage, drawX, drawY, drawWidth, drawHeight);
}

function drawCardTitle() {
  // Get user input
  let title = $('#inputTitle').prop('value');
  if (title) {
    // Convert to all uppercase letters
    title = title.toUpperCase();
    // Adjust space width
    //title = title.replaceAll(' ', String.fromCharCode(8202) + String.fromCharCode(8202));
    // Keyword font
    let keywordFontSize = ph(5.7);
    ctx.font = '400 ' + keywordFontSize + 'px Boogaloo';
    // Squish the keyword font a little
    let keywordSquish = 0.95;
    // Get keywords text width
    let keywordsWidth = ctx.measureText(title).width;
    // Box dimensions
    let boxMargin = pw(1.5); // Left and right margin between text and box border
    let boxX = pw(7);
    let boxY = ph(10);
    let boxHeight = ph(6);
    let boxWidth = keywordsWidth * keywordSquish + boxMargin * 2;
    // Drop Shadow for Box
    ctx.fillStyle = colorBlack;
    ctx.fillRect(boxX - pw(1), boxY + ph(0.8), boxWidth + pw(0.8), boxHeight + ph(1));
    // Box style
    ctx.fillStyle = '#fcb024';
    ctx.strokeStyle = colorBlack;
    ctx.lineWidth = pw(0.7);
    // Draw the box
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    // Keywords style
    ctx.fillStyle = colorBlack;
    let keywordsX = (boxX + boxMargin) * 1 / keywordSquish;
    let keywordsY = boxY + boxHeight * 0.82;
    ctx.textAlign = "left";
    ctx.save();
    ctx.scale(keywordSquish, 1);
    // Draw the keywords
    ctx.fillText(title, keywordsX, keywordsY);
    // Undo the squish for future drawings
    ctx.restore();
  }
}