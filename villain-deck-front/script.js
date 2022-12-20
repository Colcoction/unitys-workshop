// Establish canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.save();

// Default canvas preview size
$(canvasContainer).css({ width: 400 });

// Resize canvas preview size upon user input (old range method)
// $('#inputCardPreviewSize').on('input', function(e) {
//   let previewWidth = e.target.value;
//   $('#canvasContainer').css({width: previewWidth});
// })

// Canvas preview size button
$('.previewSizeButton').on('click', function (e) {
  // Get the button's text (the name of the size)
  let sizeName = e.target.textContent;
  // Based on name, determine new size
  let sizeValue = 0;
  if (sizeName === 'Small') { sizeValue = 300; }
  else if (sizeName === 'Medium') { sizeValue = 400; }
  else if (sizeName === 'Large') { sizeValue = 500; }
  // Apply the new display size of the canvas
  $('#canvasContainer').css({ width: sizeValue });
})

// Download button
$('#downloadButton').on('click', function () {
  let link = document.createElement('a');
  // Use the title input for the default file name
  if ($('#inputTitle').val()) {
    link.download = $('#inputTitle').val() + '.png';
  }
  else {
    link.download = 'untitled.png';
  }
  
  link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");;
  link.click();
})

// Info buttons
$('.infoButton').on('click', function (e) {
  // Make screen overlay visible
  $('.screenOverlay').css({ 'display': 'block' });
  // Make specific info box visible
  let buttonText = e.target.textContent;
  let boxId = '';
  if (buttonText == 'Documentation') {
    boxId = 'documentation';
  }
  else if (buttonText == 'Credits') {
    boxId = 'credits';
  }
  $('.' + boxId).css({ 'display': 'block' });
})

// Close buttons (in info boxes)
$('.closeButton, .screenOverlayNegativeSpace').on('click', function (e) {
  // Make screen overlay and info boxes invisible
  $('.screenOverlay, .overlayBox').css({ 'display': 'none' });
})

// Reset art adjustments button
$('#imageAdjustmentResetButton').on('click', function () {
  // Reset input values
  $('#inputImageOffsetX').val('0');
  $('#inputImageOffsetY').val('0');
  $('#inputImageScale').val('100');
  // Redraw canvas (since "on input" event didn't trigger)
  drawCardCanvas();
})

// Toggle high contrast phase labels
$('#inputUseHighConstrast').on('input', function () {
  useHighContrastPhaseLabels = this.checked;
  drawCardCanvas();
})

// Toggle Suddenly!
$('#suddenly').on('input', function () {
  suddenly = this.checked;
  drawCardCanvas();
})

// Draw the canvas on window load. Helpful for situations like testing with a hardcoded effect text
$(window).on('load', function () {
  drawCardCanvas();
})


/*
============================================================================
Effect text values
============================================================================
*/

const colorBlack = '#231f20';

// I don't think the high contrast values are actually CYMK... >:|

const colorStartPhaseOriginal = '#3fae49';
const colorStartPhaseHighContrast = '#4bc244';
const colorPlayPhaseOriginal = '#fff200';
const colorPlayPhaseHighContrast = '#fff72f';
const colorPowerPhaseOriginal = '#79509e';
const colorPowerPhaseHighContrast = '#a76fb9';
const colorDrawPhaseOriginal = '#00aeef';
const colorDrawPhaseHighContrast = '#3db7e2';
const colorEndPhaseOriginal = '#ee2d35';
const colorEndPhaseHighContrast = '#f34747';

let useHighContrastPhaseLabels = true;
let suddenly = false;

const effectBaseFontSize = pw(4.05); // Font size for most effect text
let effectFontScale = 1; // This will update with the user input value
let effectFontSize = effectBaseFontSize; // The font size that will be used (modifiable) ('px' unit is added later);
const effectFontWeight = 400; // Font weight for most effect text
const effectFontFamily = 'Noto Sans'; // Font family for most effect text
const effectPowerFontFamily = 'Work Sans'; // Font family for POWER: and REACTION:
const effectPowerFontSizeFactor = 1.08; // POWER: will be drawn at effectFontSize times this value
const effectPhaseFontFamily = 'Avengeance Mightiest Avenger';
const effectPhaseFontSizeFactor = 1;
const effectPhaseFontSize = pw(4.1);

// Space between words
const spaceWidthFactor = 0.26;
let spaceWidth = effectFontSize * spaceWidthFactor;

const effectMarginXPercent = 12.5; // Percent of width on each side of text
const effectStartX = pw(effectMarginXPercent); // Left boundary of effect text
const effectEndX = pw(100 - effectMarginXPercent + 1); // Right boundary of effect text
const effectStartY = ph(61.5); // Top boundary of effect text
const effectPhaseStartX = pw(6.5); // Left boundary of phase label images

const effectBaseLineHeight = pw(5);
let lineHeight = effectBaseLineHeight * effectFontScale; // Distance between two lines in the same paragraph
const blockSpacingFactor = 1.3; // Multiply lineHeight by this to get the distance between two blocks
const prePhaseLineHeightFactor = 1.2; // Spacing above phase block
const postPhaseLineHeightFactor = 1.05; // Spacing below phase block

let currentIndentX = effectStartX; // Different x position to reset to when drawing a block with an indent (such as a POWER:)
let currentOffsetX = 0; // Current x position for draw commands
let currentOffsetY = 0; // Current y position for draw commands


// These phrases will be automatically bolded
var effectBoldList = ["START PHASE", "PLAY PHASE", "POWER PHASE", "DRAW PHASE", "END PHASE", "PERFORM", "ACCOMPANY"];
// These phrases will be automatically italicized
var effectItalicsList = ["PERFORM", "ACCOMPANY"];


/*
============================================================================
Loading and app prep-work
============================================================================
*/


// Get and load default card frame
var cardFrameImageURL = "https://by3302files.storage.live.com/y4mhWQwi5poV1KRuT-IOCVunYPBbQh4xFdXUFvUcwTA1AglOPKKB_DVlkFWevg_arOLVEA4QcyFpwJJw4Gf5cPA9ZQkp9HWKv8cmKU-qQCsaTFLZxdu-tMZXQppvTNPzEUezInBZeMjRY3WuIdDD8pqYuSXaXJClB2YjL3yA3ihvecCW8hkfaCPdZwQjK3ARg88?width=586&height=823&cropmode=none";
var cardFrameImage = new Image();
//cardFrameImage.src = cardFrameImageURL;
cardFrameImage.src = '../_resources/villain deck card front frame.png'
cardFrameImage.onload = function (e) {
  // Once the Image has loaded, redraw the canvas so it immediately appears
  drawCardCanvas();
}

// Get and load other graphics
// Note: Google Drive simple view link: https://drive.google.com/uc?id=FILE_ID
let imagesToPreload = [
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
  ['Base Villain Card', '../_resources/villain deck card front frame.png']
]
let loadedGraphics = {};
imagesToPreload.forEach((image) => {
  let newImage = new Image();
  newImage.src = image[1];
  loadedGraphics[image[0]] = newImage;
})

// Short function to convert percentage (ex: 50) into pixels
function pw(percentageWidth) {
  return percentageWidth * canvas.width / 100;
}
function ph(percentageHeight) {
  return percentageHeight * canvas.height / 100;
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

// Reset the card art image adjustment controls when user uploads a new image
$('#inputImageFile').on('input', function () {
  $('#inputImageOffsetX').prop('value', '0');
  $('#inputImageOffsetY').prop('value', '0');
  $('#inputImageScale').prop('value', '0');
});

// Whenever one of the content inputs has its value changed (including each character typed in a text input), redraw the canvas
$('.contentInput').on('input', drawCardCanvas);

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

  // Draw the card art (if it exists)
  if (cardArtImage) {
    drawCardArt();
  }

  // Reset context states
  ctx.restore();
  ctx.save();
  
  ctx.drawImage(loadedGraphics['Base Villain Card'], 0, 0, canvas.width, canvas.height);

  // Draw the card title and HP
  drawCardTitle();

  // Reset context states
  ctx.restore();
  ctx.save();

  // Draw the card keywords
  drawCardKeywords();

  // Draw the card effect
  drawCardEffect();

  // Draw the card quote
  drawCardQuote();

  // Draw the card quote attribution
  drawCardAttribution();


  // Update image element
  //canvasImage.src = canvas.toDataURL();
}



function drawCardArt() {

  // Crunch some numbers to get the crop, position, and scale of the image
  let outerX = 4; // Margin between left/right edge and crop area
  let imageAreaWidth = pw(100 - outerX * 2);
  let imageAreaHeight = ph(50);
  let imageAreaRatio = imageAreaWidth / imageAreaHeight;
  let imageAreaTop = ph(9.5);
  let imageWidth = cardArtImage.width;
  let imageHeight = cardArtImage.height;
  let imageRatio = imageWidth / imageHeight;
  let initialScale = 1;


  // Create clipping region
  ctx.beginPath();
  ctx.rect(pw(outerX), imageAreaTop, imageAreaWidth, imageAreaHeight);
  ctx.closePath();
  // startX, startY, width, height
  ctx.clip();
  // Get offset values
  let imageOffsetX = parseInt($('#inputImageOffsetX').prop('value'));
  let imageOffsetY = parseInt($('#inputImageOffsetY').prop('value')) * -1;
  let userScale = parseInt($('#inputImageScale').prop('value'));

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
  let drawX = (pw(50) - drawWidth / 2);
  // Add user offset
  drawX += drawWidth * imageOffsetX / 100;
  // Vertically center the image in the area
  let drawY = (imageAreaTop + imageAreaHeight / 2 - drawHeight / 2);
  // Add user offset
  drawY += drawHeight * imageOffsetY / 100;

  // Finally, draw the image to the canvas!
  ctx.drawImage(cardArtImage, drawX, drawY, drawWidth, drawHeight);
}



function drawCardTitle() {
  // Check for HP input
  let hasHP = false;
  let inputHP = $('#inputHP').prop('value');
  if (inputHP != '') {
    hasHP = true;
    // Draw the HP graphic
    let hpGraphicSize = pw(18.8);
    let hpGraphicX = pw(80.5);
    let hpGraphicY = pw(0.6);
    ctx.drawImage(loadedGraphics['HP Graphic'], hpGraphicX, hpGraphicY, hpGraphicSize, hpGraphicSize);
    // Draw the HP text
    let hpFontSize = pw(8.7);
    // Downsize if more than 2 digits
    if (inputHP.length > 2) {
      hpFontSize = pw(6.2);
    }
    ctx.font = "600 " + hpFontSize + "px Boogaloo";
    ctx.fillStyle = colorBlack;
    ctx.textAlign = "center";
    let hpTextX = hpGraphicX + hpGraphicSize / 2.09;
    let hpTextY = hpGraphicY + hpGraphicSize / 2 + hpFontSize / 2.8;
    ctx.fillText(inputHP, hpTextX, hpTextY);
  }
  // Handle the title
  let title = $('#inputTitle').prop('value');
  //title = title.split("").join(String.fromCharCode(8202)); // Extra letter spacing: 8201 for slightly more, 8202 for slightly less
  let titleFontSize = pw(6.1);
  ctx.font = "600 " + titleFontSize + "px Boogaloo";
  ctx.textAlign = "center";
  ctx.strokeStyle = colorBlack;
  ctx.lineWidth = pw(0.8);
  ctx.lineJoin = "miter";
  ctx.miterLimit = 3;
  if (suddenly) {
    ctx.fillStyle = '#ffffff';
  } else {
    ctx.fillStyle = '#fcb024';

  }
  let titleX = pw(50);
  // Offset horizontal center if card has HP
  if (hasHP) {
    titleX = pw(46);
  }
  let titleY = ph(11.5);
  let squish = 1.06; // Stretch the font a little
  ctx.save();
  ctx.scale(squish, 1); // Apply the stretch
  titleX = titleX / squish;
  ctx.rotate(-3 * (Math.PI/180)) ;
  ctx.strokeText(title.toUpperCase(), titleX, titleY);
  ctx.fillText(title.toUpperCase(), titleX, titleY);
  ctx.restore();
}


function drawCardKeywords() {
  // Get user input
  let keywords = $('#inputKeywords').prop('value');
  if (keywords) {
    // Convert to all uppercase letters
    keywords = keywords.toUpperCase();
    // Adjust space width
    keywords = keywords.replaceAll(' ', String.fromCharCode(8202) + String.fromCharCode(8202));
    // add whitespace to make room for suddenly tag
    if (suddenly) {
      keywords = 'SUDDENLY  ' + keywords
    }
    // Keyword font
    let keywordFontSize = pw(4.5);
    ctx.font = '400 ' + keywordFontSize + 'px Boogaloo';
    // Squish the keyword font a little
    let keywordSquish = 0.95;
    // Get keywords text width
    let keywordsWidth = ctx.measureText(keywords).width;
    // Box dimensions
    let boxMargin = pw(1); // Left and right margin between text and box border
    let boxX = pw(3.5);
    let boxY = ph(53);
    let boxHeight = ph(4.8);
    let boxWidth = keywordsWidth * keywordSquish + boxMargin * 2;
    // Box style
    ctx.fillStyle = '#fcb024';
    ctx.strokeStyle = colorBlack;
    ctx.lineWidth = pw(1.1);
    ctx.save();
    ctx.rotate(-3 * (Math.PI/180)) ;
    // Draw the box
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.restore();
    // Keywords style
    ctx.fillStyle = colorBlack;
    let keywordsX = (boxX + boxMargin) * 1 / keywordSquish;
    let keywordsY = boxY + boxHeight * 0.74;
    ctx.textAlign = "left";
    ctx.save();
    ctx.scale(keywordSquish, 1);
    // Draw the keywords
    ctx.rotate(-3 * (Math.PI/180)) ;
    ctx.fillText(keywords, keywordsX, keywordsY);
    // Undo the squish for future drawings
    ctx.restore();
    if (suddenly) {
      ctx.drawImage(loadedGraphics['Suddenly Tag'], pw(5.5), ph(51), pw(20), ph(7.5));
      //ctx.restore();
    }

  }
}


function drawCardQuote() {
  // Get input value
  let inputValue = $('#inputQuote').prop('value');
  // Quote style properties
  ctx.fillStyle = colorBlack;
  let quoteFontSize = pw(3.5);
  ctx.font = "400 normal " + quoteFontSize + "px Unmasked BB";
  ctx.textAlign = "center";
  let quoteMaxWidth = pw(75);
  let quoteCenterX = pw(50);
  let quoteCenterY = ph(92.3);
  let quoteLineHeight = quoteFontSize * 0.93;

  // Set the string of text to work with
  let quoteString = inputValue;

  // Extract all the words
  let words = quoteString.split(' ');

  // Detect when there should be a line break
  let lines = [''];
  let currentLineIndex = 0;
  for (let i = 0; i < words.length; i++) {
    // First word of quote is easy
    if (i === 0) {
      lines[currentLineIndex] = words[i];
      continue;
    }
    // For all other words...
    // Check if adding this word would cause the line width to exceed the maximum
    let lineWithWordAdded = lines[currentLineIndex] + ' ' + words[i];
    if (ctx.measureText(lineWithWordAdded).width < quoteMaxWidth) {
      // Add word to current line
      lines[currentLineIndex] += ' ' + words[i];
    }
    else {
      // Break into new line
      currentLineIndex++;
      lines[currentLineIndex] = words[i];
    }
  }

  // Iterate through lines
  let quoteTotalHeight = quoteLineHeight * lines.length;
  for (let i = 0; i < lines.length; i++) {
    // Determine drawing origin
    let drawX = quoteCenterX;
    let drawY = quoteCenterY - (quoteTotalHeight / 2) + (quoteLineHeight * i);
    // Draw the line of text
    ctx.fillText(lines[i], drawX, drawY);
  }
}



function drawCardAttribution() {
  // (Mostly copied from drawCardKeywords()!)
  // Get user input
  let keywords = $('#inputAttribution').prop('value');
  if (keywords) {
    // Convert to all uppercase letters
    keywords = keywords.toUpperCase();
    // Keyword font
    let keywordFontSize = pw(3.3);
    ctx.font = "400 italic " + keywordFontSize + "px Unmasked BB";
    // Squish the keyword font a little
    let keywordSquish = 0.9;
    // Get keywords text width
    let keywordsWidth = ctx.measureText(keywords).width;
    // Box dimensions
    let boxMargin = pw(1); // Left and right margin between text and box border
    let cornerSpace = pw(4.2);
    let boxX = pw(100) - cornerSpace; // Right side of box
    let boxY = ph(100) - cornerSpace; // Bottom of box
    let boxHeight = ph(2.1);
    let boxWidth = keywordsWidth * keywordSquish + boxMargin * 2;
    boxX -= boxWidth;
    boxY -= boxHeight;
    // Box style
    ctx.fillStyle = '#fcb024';
    ctx.strokeStyle = colorBlack;
    ctx.lineWidth = pw(1.1);
    // Draw the box
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    // Keywords style
    ctx.fillStyle = colorBlack;
    let keywordsX = (boxX + boxMargin) * 1 / keywordSquish;
    let keywordsY = boxY + boxHeight * 0.80;
    ctx.textAlign = "left";
    ctx.save();
    ctx.scale(keywordSquish, 1);
    // Draw the keywords
    ctx.fillText(keywords, keywordsX, keywordsY);
    // Undo the squish for future drawings
    ctx.restore();
  }
}



function drawCardEffect() {
  // Initialize positioning values
  currentOffsetX = effectStartX;
  currentOffsetY = effectStartY;

  // Get the text the user entered into the textarea
  let inputValue = $('#inputEffect').prop('value');

  // Get and apply the text scale the user chose
  effectFontScale = $('#inputEffectTextSize').prop('value') / 100; // Result is between 0 and 1
  effectFontSize = effectBaseFontSize * effectFontScale;
  lineHeight = effectBaseLineHeight * effectFontScale;
  spaceWidth = effectFontSize * spaceWidthFactor;

  // Break the user input text into blocks (effectively, paragraphs and special sections/headings)
  let blocks = breakStringIntoBlocks(inputValue);

  // Parse and draw each block, one after the other
  blocks.forEach((block, index) => {
    parseAndDrawCardEffectBlock(block, index);
  })
}



function breakStringIntoBlocks(inputValue) {
  // Seperate the input value into blocks by splitting at line returns
  return inputValue.split('\n');
}



function stripStringOfCapitalizationAndPunctuation(string) {
  let newString = string;
  newString = newString.toLowerCase();
  newString = newString.replaceAll(/[.,!;:<>\[\]\(\){}\-]/g, '');
  return newString;
}



function parseAndDrawCardEffectBlock(block, index) {

  // Reset indent to default
  currentIndentX = effectStartX;

  // Check for the first block to adjust whole effect text starting Y position
  if (index == 0) {
    // Adjust (bring the text up a little more when it's smaller)
    currentOffsetY -= effectBaseFontSize;
    currentOffsetY += effectFontSize;
  }

  // We've gotten the text block, time to get the individual words from it and draw them appropriately
  let blockString = block;

  // Replace spaces after numbers (and X variables) with non-breaking spaces
  blockString = blockString.replaceAll(/([0-9X]) /g, '$1\xa0'); // Non-breakable space is char 0xa0 (160 dec)

  // Check for phase labels, such as START PHASE
  let isPhase = false; let phaseName = ''; let testString = '';
  // Create test string by getting first two words of block string
  let blockWords = blockString.split(' ');
  // Account for formats like "> Start Phase" by checking for length of first "word"
  let numberOfLabelWords = 0;
  if (blockWords[0].length < 2) {
    testString = stripStringOfCapitalizationAndPunctuation(blockWords[1] + ' ' + blockWords[2]);
    numberOfLabelWords = 3;
  }
  else {
    testString = stripStringOfCapitalizationAndPunctuation(blockWords[0] + ' ' + blockWords[1]);
    numberOfLabelWords = 2;
  }
  // Compare first two actual words to possible phases
  if (testString === 'start phase') {
    isPhase = true; phaseName = 'Start Phase';
  }
  else if (testString === 'play phase') {
    isPhase = true; phaseName = 'Play Phase';
  }
  else if (testString === 'power phase') {
    isPhase = true; phaseName = 'Power Phase';
  }
  else if (testString === 'draw phase') {
    isPhase = true; phaseName = 'Draw Phase';
  }
  else if (testString === 'end phase') {
    isPhase = true; phaseName = 'End Phase';
  }

  // If this is a phase label block...
  if (isPhase) {
    // Adjust line height, differently depending on if this is the first block or not
    if (index == 0) {
      currentOffsetY = effectStartY;
    }
    else {
      currentOffsetY = currentOffsetY - lineHeight + lineHeight * prePhaseLineHeightFactor;
    }
    // Get the phase label icon
    let iconString = phaseName + ' Icon';
    if (useHighContrastPhaseLabels) iconString += ' High Contrast';
    let thisIcon = loadedGraphics[iconString];
    // Style and draw the iconcon
    const effectPhaseIconX = pw(8.9); // Keep the icon aligned to left edge of text box
    let iconWidth = pw(5);
    let iconHeight = iconWidth; // These graphics have 1:1 proportions
    let iconX = effectPhaseIconX - iconWidth / 2;
    let iconY = currentOffsetY - effectPhaseFontSize;// iconHeight/2;
    ctx.drawImage(thisIcon, iconX, iconY, iconWidth, iconHeight);

    // Style and draw the text after the icon
    // Set basic font properties
    ctx.font = '400 ' + effectPhaseFontSize + 'px ' + effectPhaseFontFamily;
    // Get phase color
    let phaseColor = '';
    if (useHighContrastPhaseLabels) {
      switch (phaseName) {
        case 'Start Phase': phaseColor = colorStartPhaseHighContrast; break;
        case 'Play Phase': phaseColor = colorPlayPhaseHighContrast; break;
        case 'Power Phase': phaseColor = colorPowerPhaseHighContrast; break;
        case 'Draw Phase': phaseColor = colorDrawPhaseHighContrast; break;
        case 'End Phase': phaseColor = colorEndPhaseHighContrast; break;
      }
    }
    else {
      switch (phaseName) {
        case 'Start Phase': phaseColor = colorStartPhaseOriginal; break;
        case 'Play Phase': phaseColor = colorPlayPhaseOriginal; break;
        case 'Power Phase': phaseColor = colorPowerPhaseOriginal; break;
        case 'Draw Phase': phaseColor = colorDrawPhaseOriginal; break;
        case 'End Phase': phaseColor = colorEndPhaseOriginal; break;
      }
    }

    // Font stroke
    ctx.strokeStyle = colorBlack;
    ctx.lineWidth = effectPhaseFontSize * 0.2;
    ctx.lineJoin = "miter";
    ctx.miterLimit = 3;
    ctx.strokeText(phaseName, currentOffsetX, currentOffsetY);
    // Font fill
    ctx.fillStyle = phaseColor;
    ctx.fillText(phaseName, currentOffsetX, currentOffsetY);

    // Prepare for next block
    currentOffsetY = currentOffsetY + lineHeight * postPhaseLineHeightFactor;

    // If the user put the effect on the same line as the label, draw a new block with that effect
    // Bug: "END PHASE: Here we go"
    if (blockWords.length > numberOfLabelWords) {
      // Abort if the rest of the line is just a single space (there's probably a more robust way to handle this kind of potential issue, but it's not very important. Maybe using String.prototype.trim().)
      if (blockWords.length === numberOfLabelWords + 1 && blockWords[blockWords.length - 1] == '') {
        return;
      }
      // Remove phase label words
      blockWords.splice(0, numberOfLabelWords);
      // Rejoin the remaining words into a string
      let newBlockString = blockWords.join(' ');
      // Run the block drawing function again on this new string
      parseAndDrawCardEffectBlock(newBlockString, index);
      // Stop processing this block
      return;
    }
    else {
      // If the line was just the phase labels, simply stop processing the block here
      return;
    }

  }

  // Check for POWER: and REACTION:
  let isIndentBlock = false; let labelWord = ''; let testStringPR = '';
  // Create test string by getting first word of block string
  let blockWordsPR = blockString.split(' ');
  testStringPR = blockWordsPR[0].toLowerCase();
  if (testStringPR === 'power:') {
    isIndentBlock = true;
    labelWord = 'POWER:';
  }
  else if (testStringPR === 'reaction:') {
    isIndentBlock = true;
    labelWord = 'REACTION:';
  }

  // If it's a POWER: or REACTION:, draw that label and then prepare the rest of the block for being indented 
  if (isIndentBlock) {
    // Draw POWER:
    ctx.fillStyle = colorBlack;
    let effectPowerFontSize = effectFontSize * effectPowerFontSizeFactor;
    ctx.font = '900 ' + effectPowerFontSize + 'px ' + effectPowerFontFamily;
    ctx.fillText(labelWord, currentOffsetX, currentOffsetY);
    // Prepare for the rest of the text
    // Prepare indent
    let powerWidth = ctx.measureText(labelWord).width + spaceWidth;
    currentIndentX += powerWidth + pw(0.2);
    currentOffsetX = currentIndentX;
    // Remove the POWER:/REACTION: from block string
    //var result = original.substr(original.indexOf(" ") + 1);
    if (blockString.length === labelWord.length) {
      // For edge case where the whole block string is just 'POWER:', so it doesn't draw twice and look weird
      blockString = '';
    }
    else {
      blockString = blockString.substr(blockString.indexOf(" ") + 1);
    }

  }

  // Okay, time for handling normal body text...

  // First, identify special word strings and replace their spaces with underscores
  effectBoldList.forEach((phrase) => {
    // Make an all-caps copy of the block string
    let testString = blockString.toUpperCase();
    // Find the position of each instance of this phrase in the string
    let position = testString.indexOf(phrase);
    while (position !== -1) {
      // Replace this instance of this phrase in the real block string with the all-caps + underscore format for detecting later
      let thisSubString = blockString.substr(position, phrase.length);
      blockString = blockString.replace(thisSubString, phrase.replaceAll(' ', '_'));
      // Repeat if there's another instance of this phrase
      position = testString.indexOf(phrase, position + 1);
    }
  })
  effectItalicsList.forEach((phrase) => {
    // Make an all-caps copy of the block string
    let testString = blockString.toUpperCase();
    // Find the position of each instance of this phrase in the string
    let position = testString.indexOf(phrase);
    while (position !== -1) {
      // Replace this instance of this phrase in the real block string with the all-caps + underscore format for detecting later
      let thisSubString = blockString.substr(position, phrase.length);
      blockString = blockString.replace(thisSubString, phrase.replaceAll(' ', '_'));
      // Repeat if there's another instance of this phrase
      position = testString.indexOf(phrase, position + 1);
    }
  })

  // Make minus signs more readable by replacing hyphens with en-dashes
  blockString = blockString.replaceAll('-', '–');

  // Extract all the words
  let words = blockString.split(' ');

  // Analyze and draw each 'word' (including special phrases as 1 word...U.u)
  words.forEach((word, index) => {
    let thisIndex = index;
    // Find out it this word should be bolded or italicized
    let thisWord = getWordProperties(word); // returns an object: {text, isBold, isItalics}

    // Set drawing styles
    let weightValue = effectFontWeight;
    let styleValue = "normal";
    if (thisWord.isBold) { weightValue = "600" }
    if (thisWord.isItalics) { styleValue = "italic" }
    ctx.font = weightValue + ' ' + styleValue + ' ' + effectFontSize + 'px ' + effectFontFamily;
    ctx.fillStyle = colorBlack;

    // Break up special bold/italics phrases into their component words
    let phraseParts = thisWord.text.split(' ');

    // For each word in the phrase (and there will usually be just one)
    phraseParts.forEach((wordString) => {
      // Get how much width the word and a space would add to the line
      let wordWidth = ctx.measureText(wordString).width;
      // Check to see if the line should wrap
      let wrapped = false;
      // Looks forward to see if adding this word to the current line would make the line exceed the maximum x position
      if (currentOffsetX + spaceWidth + wordWidth > effectEndX) {
        // If it would, then start the next line
        currentOffsetY += lineHeight;
        currentOffsetX = currentIndentX;
        wrapped = true;
      }
      // Determine string to draw
      let stringToDraw = '';
      // Check if there's a punctuation mark at the end of a bold/italicized word
      let endingPunctuation = '';
      if ((thisWord.isBold || thisWord.isItalics) && wordString[wordString.length - 1].match(/[.,!;:\?]/g)) {
        endingPunctuation = wordString.charAt(wordString.length - 1); // Get the punctuation at the end of the string
        wordString = wordString.slice(0, wordString.length - 1); // Remove the punctuation from the main string
      }

      // Check line wrapping status
      if (wrapped == false && thisIndex > 0) {
        // If the line did not wrap and it's not the first word of the block, draw the word with a space
        currentOffsetX += spaceWidth;
        stringToDraw = wordString;
        // Draw the string
        ctx.fillText(stringToDraw, currentOffsetX, currentOffsetY);
        // If there was ending punctuation after a bold/italicized word, draw that now
        if (endingPunctuation != '') {
          // Get width of word without ending punctuation
          let mainWordWidth = ctx.measureText(stringToDraw).width;
          // Set the font styles to effect text default
          ctx.font = effectFontWeight + ' ' + 'normal' + ' ' + effectFontSize + 'px ' + effectFontFamily;
          // Draw the punctuation
          let drawX = currentOffsetX + mainWordWidth;
          ctx.fillText(endingPunctuation, drawX, currentOffsetY);
        }
        // Prepare currentOffsetX for next word
        currentOffsetX += wordWidth;
      }
      else {
        // If the line wrapped (or if it was the first word in the whole block), draw the word with no space
        stringToDraw = wordString;
        // Draw the string
        ctx.fillText(stringToDraw, currentOffsetX, currentOffsetY);
        // If there was ending punctuation after a bold/italicized word, draw that now
        if (endingPunctuation != '') {
          // Get width of word without ending punctuation
          let mainWordWidth = ctx.measureText(stringToDraw).width;
          // Set the font styles to effect text default
          ctx.font = effectFontWeight + ' ' + 'normal' + ' ' + effectFontSize + 'px ' + effectFontFamily;
          // Draw the punctuation
          let drawX = currentOffsetX + mainWordWidth;
          ctx.fillText(endingPunctuation, drawX, currentOffsetY);
        }
        // Prepare currentOffsetX for next word
        currentOffsetX += wordWidth;
      }

      // Increase the index (only necessary for multi-word phrases)
      thisIndex++;
    })


  })

  // After drawing all the words, prepare for the next block
  currentOffsetX = effectStartX;
  currentOffsetY += lineHeight * blockSpacingFactor;
}



function getWordProperties(word) {
  // Minimize the word for easier analyzing
  var minimizedWord = '';
  // Remove any punctuation
  minimizedWord = word.replaceAll(/[.,!;:\?]/g, '');
  // Restore spaces that were replaced with underscores earlier
  minimizedWord = minimizedWord.replaceAll('_', ' ');
  // Check minimized word against lists of words to bold and italicize
  let isBold = false;
  let isItalics = false;
  if (effectBoldList.indexOf(minimizedWord) != -1) { isBold = true; }
  if (effectItalicsList.indexOf(minimizedWord) != -1) { isItalics = true; }

  // Restore spaces that were replaced with underscores earlier
  let restoredWord = word.replaceAll('_', ' ');

  // Output
  return { text: restoredWord, isBold: isBold, isItalics: isItalics };
}




/* NOTEPAD

I could introduce manual line breaks in the effect text... or I could write a script to detect when there is a number followed by a space in the block string, then replace that space with a non-breaking space. (oh, but the non-breaking space might not have the same width as my custom space width...)

After recreating the Gyrosaur deck with the app in its current state, I would really like to make special effect terms not case-sensitive. So that [Start Phase] works like [START PHASE].


Official card contents for testings:

EXPENDABLE POWER BANK
ITEM, LIMITED
[PLAY PHASE]
You may put 1 card from your trash under 1 Ordnance card in play. If you do, put this card under 1 Ordnance card in play.
[END PHASE]
Put the top card of your deck under 1 Ordnance card in play.
"Sure, it's a bit of a weak point, but the other alternative is fewer bells and whistles, and we can't have that!"
--Bunker, Freedom Five #410

ATLANTEAN STORMBLADE
After any Weather card is destroyed, Tempest deals 1 target 1 lightning damage.
POWER: Tempest deals 1 target 3 irreducible lightning damage. Then, destroy 1 Weather card.

WRATHFUL RETRIBUTION
ONGOING
[START PHASE]
Fanatic deals 1 target x radiant damage, where X is Fanatic's maximum HP minus her current HP. Then, bury this card.

UNFLAGGING ANIMATION
Ongoing, Limited
-1 damage dealt to Construct cards.
[START PHASE]
Either discard 1 card or destroy this card.
[END PHASE]
The Construct card with the lowest HP regains 2 HP.

"I know little of your people, but I understand fear, and innocent lives in danger. I will keep you safe. I swear it."


*/