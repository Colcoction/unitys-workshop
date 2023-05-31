/*
============================================================================
Loading and app prep-work
============================================================================
*/


// Get and load graphics
// Note: Google Drive simple view link: https://drive.google.com/uc?id=FILE_ID
let imagesToPreload = [
  ['Border', '../_resources/hero character card border.png'],
  ['test_ball', '../_resources/test_ball.png'],
  ['test_gyro', '../_resources/test_gyro.png'],
  ['test_shell', '../_resources/test_shell.png'],
  ['test_hyperspin', '../_resources/test_hyperspin.png'],
  ['test_name', '../_resources/Gyrosaur title.png'],
  ['test_gyrosaur cc front', '../_resources/test_gyrosaur cc front.png'],
  ['Start Phase Icon', '../_resources/phase icon start.svg'],
  ['Play Phase Icon', '../_resources/phase icon play.svg'],
  ['Power Phase Icon', '../_resources/phase icon power.svg'],
  ['Draw Phase Icon', '../_resources/phase icon draw.svg'],
  ['End Phase Icon', '../_resources/phase icon end.svg'],
  ['Start Phase Icon High Contrast', '../_resources/phase icon start - high contrast.svg'],
  ['Play Phase Icon High Contrast', '../_resources/phase icon play - high contrast.svg'],
  ['Power Phase Icon High Contrast', '../_resources/phase icon power - high contrast.svg'],
  ['Draw Phase Icon High Contrast', '../_resources/phase icon draw - high contrast.svg'],
  ['End Phase Icon High Contrast', '../_resources/phase icon end - high contrast.svg']
]

// Make an object where each item is key = image name, value = Image element
let loadedGraphics = {};
for (let i = 0; i < imagesToPreload.length; i++) {
  let imageInfo = imagesToPreload[i];
  let newImage = new Image();
  newImage.src = imageInfo[1];
  loadedGraphics[imageInfo[0]] = newImage;
  // Draw the canvas once the final image has loaded
  if (i === imagesToPreload.length - 1) {
    newImage.onload = function (e) {
      drawCardCanvas();
    }
  }
}


// Save the uploaded image so it doesn't have to load each time
var cardArtImage;
$('#inputImageFile').on('input', function (e) {
  // Get the uploaded file
  var cardImage = e.target.files[0];
  // If a file has been uploaded...
  if (cardImage) {
    // Turn that file into a useable Image object
    var url = URL.createObjectURL(cardImage);
    cardArtImage = new Image();
    cardArtImage.src = url;
    cardArtImage.onload = function (e) {
      // Once the Image has loaded, redraw the canvas so it immediately appears
      drawCardCanvas();
    }
  }
})

// This object is where user input images (specifically Image objects) are stored
let loadedUserImages = {
  backgroundArt: null
};


// Handle user image uploading
$('.inputImageFile').on('input', function () {
  // Get the uploaded file
  let uploadedImage = this.files[0];
  // If a file has been uploaded...
  if (uploadedImage) {
    // Turn that file into a useable Image object
    let imagePurpose = this.dataset.imagePurpose;
    loadedUserImages[imagePurpose] = new Image();
    loadedUserImages[imagePurpose].src = URL.createObjectURL(uploadedImage);
    loadedUserImages[imagePurpose].onload = function () {
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
  // First, parse the blocks of this card's body text.
  const parsedBlocks = parseCardBody();

  // Adjust the box height offset.
  adjustBoxHeightOffset(parsedBlocks);

  // Clear the canvas and reset the context states
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.save();

  // Draw a blank white rectangle background (for if no image so it's not awkwardly transparent)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // === Draw the background art
  drawArtInCroppedArea('hccf_backgroundArt');

  drawCharacterBodyBox();

  // === Draw the card border
  ctx.drawImage(loadedGraphics['Border'], 0, 0, canvas.width, canvas.height);

  // === Draw the text box

  // 1) create the shape
  let topLeft, topRight, bottomLeft, bottomRight, heightOffset;

  // Default coordinates (bottom will never change, but top could change based on heightOffset)
  topLeft = [pw(10), ph(78.5)]; topRight = [pw(90), ph(78.5)];
  bottomLeft = [pw(10), ph(94)]; bottomRight = [pw(90), ph(93)];

  heightOffset = boxHeightOffset;

  topLeft[1] += heightOffset; topRight[1] += heightOffset;

  let boxShape = new Path2D();
  boxShape.moveTo(topLeft[0], topLeft[1]);
  boxShape.lineTo(topRight[0], topRight[1]);
  boxShape.lineTo(bottomRight[0], bottomRight[1]);
  boxShape.lineTo(bottomLeft[0], bottomLeft[1]);
  boxShape.closePath();

  // 2) draw the shape

  // White inner part
  ctx.fillStyle = "#ffffffcc"; // Last two digits are transparency
  ctx.fill(boxShape);
  // Black border
  ctx.fillStyle = colorBlack;
  ctx.lineWidth = pw(0.5);
  ctx.stroke(boxShape);
  // Black "shadow" in top-left
  let shadowShape = new Path2D;
  let shadowOffset = pw(-0.7);
  shadowShape.moveTo(bottomLeft[0] + shadowOffset, bottomLeft[1] + shadowOffset);
  shadowShape.lineTo(topLeft[0] + shadowOffset, topLeft[1] + shadowOffset);
  shadowShape.lineTo(topRight[0] + shadowOffset, topRight[1] + shadowOffset);
  ctx.fillStyle = colorBlack;
  ctx.lineWidth = pw(1);
  ctx.stroke(shadowShape);

  // == Draw the power name

  const powerNameX = pw(14.5);
  const powerNameY = ph(82.5) + boxHeightOffset;
  const powerNameFontSize = pw(4);

  ctx.font = "400 " + powerNameFontSize + "px Avengeance Mightiest Avenger";
  ctx.fillStyle = "white";
  ctx.strokeStyle = colorBlack;
  ctx.lineWidth = powerNameFontSize * 0.2;
  ctx.lineJoin = "miter";
  ctx.miterLimit = 3;

  let powerName = $('#inputPowerName').val();
  powerName = powerName.toUpperCase();

  ctx.strokeText(powerName, powerNameX, powerNameY);
  ctx.fillText(powerName, powerNameX, powerNameY);

  // Draw the character body box, and the text in the card body.
  drawBodyText(parsedBlocks);
}
