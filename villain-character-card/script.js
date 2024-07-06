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
  ['End Phase Icon High Contrast', '../_resources/phase icon end - high contrast.svg'],
  ['HP Graphic', '../_resources/HP Graphic.svg'],
  ['Nemesis Icon Frame', '../_resources/nemesis icon frame.png']
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
  backgroundArt: null,
  foregroundArt: null,
  nemesisIcon: null
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

  // Clear the canvas and reset the context states
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.save();

  // Draw a blank white rectangle background (for if no image so it's not awkwardly transparent)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the background art
  drawArtInCroppedArea('hccf_backgroundArt');

  if (showBorder) {
    // Draw the card border
    ctx.drawImage(loadedGraphics['Border'], 0, 0, canvas.width, canvas.height);
  }
  // Draw the foreground art
  drawArtInCroppedArea('hccf_foregroundArt');
  drawArtInCroppedArea('hccf_heroNameArt');
  loadEffectList(); // Loads in list of terms to style with bold or italics

  // Advanced game text ========
  // Flag that we're drawing the advanced game text
  drawingAdvanced = true;
  // First, parse the blocks of this card's body text.
  const advancedParsedBlocks = parseCardBody();
  // Adjust the box height offset.
  adjustBoxHeightOffset(advancedParsedBlocks);
  // Draw the box, then the text
  drawCharacterBodyBox();
  drawBodyText(advancedParsedBlocks);
  // End
  drawingAdvanced = false;

  // Normal game text ========
  // First, parse the blocks of this card's body text.
  const parsedBlocks = parseCardBody();
  // Adjust the box height offset.
  adjustBoxHeightOffset(parsedBlocks);
  // Draw the box, then the text
  drawCharacterBodyBox();
  drawBodyText(parsedBlocks);

// GAME TEXT

  // Draw the keyword box ("Villain")
  drawKeywords();

  // Draw the description box "Armored Mad Scientist"
  drawDescription()

  // Draw the HP
  drawHP();

  // Draw the Nemesis Icon
  if (loadedUserImages['nemesisIcon']) {
    // Draw the nemesis icon image
    drawArtInCroppedArea('hccf_nemesisIcon');

    // Draw the nemesis icon frame
    let frameSize = pw(15);
    ctx.drawImage(loadedGraphics['Nemesis Icon Frame'], pw(11), ph(89), frameSize, frameSize);
  }
}


/**
 * Draws the description on a villain character card.
 */
function drawDescription() {
  // Check for description input. The input with this ID will always exist, so we can call toUpperCase() here safely.
  const description = $('#inputDescription').prop('value').toUpperCase();
  // If we don't have an input, don't draw anything
  if (description === '') {
    return;
  }

  // Set some font styles before drawing the box
  let descriptionFontSize = pw(2.7);
  ctx.font = "600 " + descriptionFontSize + "px Boogaloo";
  // Squish the description font a little (1 = neutral)
  let descriptionSquish = 1.06;
  // Get description text width
  let descriptionWidth = ctx.measureText(description).width;

  // Box dimensions
  let boxMargin = pw(1.4); // Left and right margin between text and box border
  let boxX = pw(96); // Right side of box
  let boxY = ph(25); // Bottom of box
  let boxHeight = ph(5.5); // Height of box
  let boxExtraRight = pw(7.5);
  let boxWidth = descriptionWidth * descriptionSquish + boxMargin * 2 + boxExtraRight;
  boxX -= boxWidth;
  boxY -= boxHeight;

  // Sets the coordinates of the corners of the textbox.
  const topLeft = [boxX, boxY + ph(0.3)];
  const topRight = [boxX + boxWidth, boxY];
  const bottomRight = [boxX + boxWidth, boxY + boxHeight];
  const bottomLeft = [boxX + ph(0.5), boxY + boxHeight - ph(0.3)];

  // Determine the initial shape of the box.
  const boxShape = new Path2D();
  boxShape.moveTo(topLeft[0], topLeft[1]);
  boxShape.lineTo(topRight[0], topRight[1]);
  boxShape.lineTo(bottomRight[0], bottomRight[1]);
  boxShape.lineTo(bottomLeft[0], bottomLeft[1]);
  boxShape.closePath();

  // Draw the box
  ctx.fillStyle = '#fff';
  ctx.fill(boxShape);
  // Black border
  ctx.fillStyle = colorBlack;
  ctx.lineWidth = CHARACTER_BODY_BOX.borderThickness;
  ctx.stroke(boxShape);

  // Box shadow (top-left)
  let shadowShape = new Path2D;
  let shadowOffset = CHARACTER_BODY_BOX.shadowThickness * -0.7;
  shadowShape.moveTo(bottomLeft[0] + shadowOffset, bottomLeft[1] + shadowOffset);
  shadowShape.lineTo(topLeft[0] + shadowOffset, topLeft[1] + shadowOffset);
  shadowShape.lineTo(topRight[0] + shadowOffset, topRight[1] + shadowOffset);
  ctx.fillStyle = colorBlack;
  ctx.lineWidth = CHARACTER_BODY_BOX.shadowThickness;
  ctx.stroke(shadowShape);

  // Set the remaining font styles
  ctx.fillStyle = '#fcb024';
  ctx.strokeStyle = colorBlack;
  ctx.lineWidth = descriptionFontSize * 0.15;
  ctx.lineJoin = "miter";
  ctx.miterLimit = 3;
  let descriptionX = (boxX + boxMargin * 1.6) * 1 / descriptionSquish;
  let descriptionY = boxY + boxHeight * 0.75;
  ctx.textAlign = "left";
  ctx.save();
  ctx.scale(descriptionSquish, 1);
  // Draw the description
  ctx.strokeText(description, descriptionX, descriptionY);
  ctx.fillText(description, descriptionX, descriptionY);
  // Undo the squish for future drawings
  ctx.restore();
}


/**
 * Draws the keywords on a villain character card.
 */
function drawKeywords() {
  // Check for keyword input. The input with this ID will always exist, so we can call toUpperCase() here safely.
  const keywords = $('#inputKeywords').prop('value').toUpperCase();
  // If we don't have an input, don't draw anything
  if (keywords === '') {
    return;
  }
  // Convert to all uppercase letters
  // keywords = keywords.toUpperCase();
  // Keyword font
  let keywordFontSize = pw(1.8);
  ctx.font = "400 " + keywordFontSize + "px Avengeance Mightiest Avenger";
  // Squish the keyword font a little (1 = neutral)
  let keywordSquish = 1;
  // Get keywords text width
  let keywordsWidth = ctx.measureText(keywords).width;
  // Box dimensions
  let boxMargin = pw(1); // Left and right margin between text and box border
  let boxX = pw(96); // Right side of box
  let boxY = ph(29.5); // Bottom of box
  let boxHeight = ph(5); // Height of box
  let boxExtraRight = pw(7.5);
  let boxWidth = keywordsWidth * keywordSquish + boxMargin * 2 + boxExtraRight;
  boxX -= boxWidth;
  boxY -= boxHeight;
  // Box style
  ctx.fillStyle = colorBlack;
  // Draw the box
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  // Keywords style
  ctx.fillStyle = 'white';
  let keywordsX = (boxX + boxMargin) * 1 / keywordSquish;
  let keywordsY = boxY + boxHeight * 0.7;
  ctx.textAlign = "left";
  ctx.save();
  ctx.scale(keywordSquish, 1);
  // Draw the keywords
  ctx.fillText(keywords, keywordsX, keywordsY);
  // Undo the squish for future drawings
  ctx.restore();
}

/**
 * Draws the HP on a villain character card.
 */
function drawHP() {
  // Check for HP input
  const inputHP = $('#inputHP').prop('value');
  // If we don't have an input, don't draw anything.
  if (inputHP === '') {
    return;
  }
  // Draw the HP graphic
  let hpGraphicSize = pw(10);
  let hpGraphicX = pw(88);
  let hpGraphicY = ph(15);
  ctx.drawImage(loadedGraphics['HP Graphic'], hpGraphicX, hpGraphicY, hpGraphicSize, hpGraphicSize);
  // Draw the HP text
  let hpFontSize = pw(4.2);
  // Downsize if more than 2 digits
  if (inputHP.length > 2) {
    hpFontSize = pw(3.8);
  }
  ctx.font = "600 " + hpFontSize + "px Boogaloo";
  ctx.fillStyle = colorBlack;
  ctx.textAlign = "center";
  let hpTextX = hpGraphicX + hpGraphicSize / 2.09;
  let hpTextY = hpGraphicY + hpGraphicSize / 2 + hpFontSize / 2.8;
  ctx.fillText(inputHP, hpTextX, hpTextY);
  // Reset
  ctx.textAlign = "left";
}