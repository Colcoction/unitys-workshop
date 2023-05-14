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


// Whenever one of the content inputs has its value changed (including each character typed in a text input), redraw the canvas
$('.contentInput').on('input', drawCardCanvas);


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

  // === Draw the card border
  ctx.drawImage(loadedGraphics['Border'], 0, 0, canvas.width, canvas.height);

  // Draw the foreground art
  drawArtInCroppedArea('hccf_foregroundArt');
  drawArtInCroppedArea('hccf_heroNameArt');
  loadEffectList();  

  // Draw the character body box, and the text in the card body.
  drawCharacterBodyBox();
  drawBodyText(parsedBlocks);

  // == Draw the power name
  const powerNameX = pw(12.5);
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

  // === Draw the keyword box ("Hero")
  drawKeywords();

  // === Draw the HP
  drawHP();

  // === Draw the Nemesis Icon
  if (loadedUserImages['nemesisIcon']) {
    // Draw the nemesis icon image
    drawArtInCroppedArea('hccf_nemesisIcon');

    // Draw the nemesis icon frame
    let frameSize = pw(15);
    ctx.drawImage(loadedGraphics['Nemesis Icon Frame'], pw(11), ph(89), frameSize, frameSize);
  }
}

/**
 * Draws the keywords on an hero character card.
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
  let keywordFontSize = pw(3);
  ctx.font = "400 " + keywordFontSize + "px Avengeance Mightiest Avenger";
  // Squish the keyword font a little (1 = neutral)
  let keywordSquish = 1;
  // Get keywords text width
  let keywordsWidth = ctx.measureText(keywords).width;
  // Box dimensions
  let boxMargin = pw(2); // Left and right margin between text and box border
  let boxX = pw(84); // Right side of box (this is good)
  let boxY = ph(79) + boxHeightOffset; // Bottom of box (still need to find this number)
  let boxHeight = ph(3);
  let boxExtraRight = pw(4);
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
 * Draws the HP on a hero character card.
 */
function drawHP() {
  // Check for HP input
  const inputHP = $('#inputHP').prop('value');
  // If we don't have an input, don't draw anything.
  if (inputHP === '') {
    return;
  }
  // Draw the HP graphic
  let hpGraphicSize = pw(17);
  let hpGraphicX = pw(78);
  let hpGraphicY = ph(72) + boxHeightOffset;
  ctx.drawImage(loadedGraphics['HP Graphic'], hpGraphicX, hpGraphicY, hpGraphicSize * 1.1, hpGraphicSize);
  // Draw the HP text
  let hpFontSize = pw(7.3);
  // Downsize if more than 2 digits
  if (inputHP.length > 2) {
    hpFontSize = pw(6.2);
  }
  ctx.font = "600 " + hpFontSize + "px Boogaloo";
  ctx.fillStyle = colorBlack;
  ctx.textAlign = "center";
  let hpTextX = hpGraphicX + hpGraphicSize * 1.1 / 2.09;
  let hpTextY = hpGraphicY + hpGraphicSize / 2 + hpFontSize / 2.8;
  ctx.fillText(inputHP, hpTextX, hpTextY);
  // Reset
  ctx.textAlign = "left";
}


/*
============================================================================
Effect text values
============================================================================
*/
let useHighContrastPhaseLabels = true;

const effectBaseFontSize = pw(3.95); // Font size for most effect text
let effectFontScale = 1; // This will update with the user input value
let effectFontSize = effectBaseFontSize; // The font size that will be used (modifiable) ('px' unit is added later);
const effectFontWeight = 400; // Font weight for most effect text
const effectFontFamily = 'Noto Sans'; // Font family for most effect text
const effectPowerFontFamily = 'Work Sans'; // Font family for POWER: and REACTION:
const effectPowerFontSizeFactor = 1.08; // POWER: will be drawn at effectFontSize times this value
const effectPhaseFontFamily = 'Avengeance Mightiest Avenger';
const effectPhaseFontSizeFactor = 1;

// Space between words
const spaceWidthFactor = 0.26;
let spaceWidth = effectFontSize * spaceWidthFactor;

const effectMarginXPercent = 12.5; // Percent of width on each side of text
const effectStartX = pw(effectMarginXPercent); // Left boundary of effect text
const effectEndX = pw(100 - effectMarginXPercent + 1); // Right boundary of effect text
const effectStartY = ph(85.5); // Top boundary of effect text
const effectPhaseStartX = pw(6.5); // Left boundary of phase label images

const effectBaseLineHeight = pw(5);
let lineHeight = effectBaseLineHeight * effectFontScale; // Distance between two lines in the same paragraph
const blockSpacingFactor = 1.3; // Multiply lineHeight by this to get the distance between two blocks
const prePhaseLineHeightFactor = 1.2; // Spacing above phase block
const postPhaseLineHeightFactor = 1.05; // Spacing below phase block

let currentIndentX = effectStartX; // Different x position to reset to when drawing a block with an indent (such as a POWER:)
let currentOffsetX = 0; // Current x position for draw commands
let currentOffsetY = 0; // Current y position for draw commands

// Set of default bolded terms
const defaultBoldList = new Set(["START PHASE", "PLAY PHASE", "POWER PHASE", "DRAW PHASE", "END PHASE", "PERFORM", "ACCOMPANY"]);
// Set of default italicized terms
const defaultItalicsList = new Set(["PERFORM", "ACCOMPANY"]);

// These phrases will be automatically bolded
var effectBoldList = Array.from(defaultBoldList);
// These phrases will be automatically italicized
var effectItalicsList = Array.from(defaultItalicsList);

// load custom effect list if it exists
function loadEffectList() {
  let customEffectList = $('#inputBoldWords').prop('value');
  if (customEffectList) {
    customEffectList = customEffectList.toUpperCase();
    customEffectList = customEffectList.split(",").map(x => x.trim());
    customEffectList = customEffectList.filter(effect => effect != "");
  } else {
    customEffectList = [];
  }
  // reset the lists
  let newBoldList = new Set(defaultBoldList);
  let newItalicsList = new Set(defaultItalicsList);
  // add new elements
  customEffectList.forEach((effect) => {
    newBoldList.add(effect);
    newItalicsList.add(effect);
  });
  // change back to arrays
  effectBoldList = Array.from(newBoldList);
  effectItalicsList = Array.from(newItalicsList);
}

/*
============================================================================
Effect text functions
============================================================================
*/

// Toggle high contrast phase labels
$('#inputUseHighConstrast').on('input', function () {
  useHighContrastPhaseLabels = this.checked;
  drawCardCanvas();
});
