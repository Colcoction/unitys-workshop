/*
============================================================================
Loading and app prep-work
============================================================================
*/


// Get and load graphics
// Note: Google Drive simple view link: https://drive.google.com/uc?id=FILE_ID
let imagesToPreload = [
  // Generic
  ['test_ball', '../_resources/test_ball.png'],
  ['test_gyro', '../_resources/test_gyro.png'],
  ['test_shell', '../_resources/test_shell.png'],
  ['test_hyperspin', '../_resources/test_hyperspin.png'],
  ['test_name', '../_resources/test_namelogo.png'],
  ['test_herocc', '../_resources/test_herocc.png'],
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
  ['Nemesis Icon Frame', '../_resources/nemesis icon frame.png'],

  // Villain character card specific
  ['Border', '../_resources/villain character card border.png'],
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
VCC_IMAGES.forEach(key => loadedUserImages[key] = null);

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

  // Draw a blank white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the background art
  drawArtInCroppedArea('vcc_backgroundArt');

  // Draw the card border
  drawBorder();

  // Draw the foreground art
  drawArtInCroppedArea('vcc_foregroundArt');

  // Draw the setup instructions
  drawSetup();

  // Loads in list of terms to style with bold or italics
  loadEffectList();

  // Draw the advanced game text ========
  // Flag that we're drawing the advanced game text
  drawingAdvanced = true;
  // First, parse the blocks of this card's body text.
  const advancedParsedBlocks = parseCardBody();
  // Adjust the box height offset.
  adjustBoxHeightOffset(advancedParsedBlocks);
  // Draw the box, then the text
  drawCharacterBodyBox();
  drawBodyText(advancedParsedBlocks);
  drawAdvancedLabel(); // Yellow box that says "Advanced..."
  // Done with advanced
  drawingAdvanced = false;

  // Draw the normal game text ========
  // First, parse the blocks of this card's body text.
  const parsedBlocks = parseCardBody();
  // Adjust the box height offset.
  adjustBoxHeightOffset(parsedBlocks);
  // Draw the box, then the text
  drawCharacterBodyBox();
  drawBodyText(parsedBlocks);

  // Draw the Nemesis icon
  if (loadedUserImages['nemesisIcon']) {
    // Draw the nemesis icon image
    drawArtInCroppedArea('vcc_nemesisIcon');

    // Draw the nemesis icon frame
    // let frameSize = pw(15);
    // let nemesisX = pw(11) + bodyWidthAdjustment;
    // ctx.drawImage(loadedGraphics['Nemesis Icon Frame'], nemesisX, ph(66), frameSize, frameSize);
    let frameSize = pw(8.6);
    let nemesisX = pw(48) + bodyWidthAdjustment;
    let nemesisY = ph(86) + advancedBoxYAdjustment;
    ctx.drawImage(loadedGraphics['Nemesis Icon Frame'], nemesisX, nemesisY, frameSize, frameSize);
  }

  // Get vertical alignment of HP, keywords, and description
  inputBelowNameLogoAlignment = ph($('#inputBelowNameLogoAlignment').val() * -1);

  // Draw the keyword box
  drawKeywords();

  // Draw the description box
  drawDescription()

  // Draw the name logo
  drawArtInCroppedArea('vcc_nameLogo');

  // Draw the HP
  drawHP();

  // Canvas drawing complete!
}

/**
 * Draws the border.
 */
function drawBorder() {
  if (showBorder) {
    // Get setup offset by fake-drawing the setup instructions
    // (They will be drawn for real later)
    ctx = calculationCanvas.getContext("2d");
    drawSetup();
    ctx = canvas.getContext("2d");

    // Tweak to get the border asset closer to official components
    const borderYFix = ph(1);

    // Draw the border frame, using borderYFix and setupBorderOffset to get it just right
    ctx.drawImage(
      loadedGraphics['Border'],
      0 + setupBorderOffset, 0 + borderYFix,
      canvas.width - setupBorderOffset, canvas.height
    );

    // Fill in the gaps that borderYFix and setupBorderOffset make
    ctx.fillStyle = colorBlack;
    // Add a bit of overlap just to make sure there's not a thin gap between the border and the fill-in
    const overlap = pw(0.5);
    // borderYFix
    ctx.fillRect(0, 0, canvas.width, borderYFix + overlap);
    // setupBorderOffset
    ctx.fillRect(0, 0, setupBorderOffset + overlap, canvas.height);
  }
}

/**
 * Draws the setup text.
 * Much of this was copied from drawCardQuote().
 */
function drawSetup() {

  // Get input value
  const inputValue = $('#inputSetup').prop('value');

  // Don't draw anything if the field is blank
  if (inputValue == '') {
    setupBorderOffset = pw(-2);
    return;
  }

  // Properties roperties
  const setupFontSize = ph(2.9);
  ctx.font = '400 normal ' + setupFontSize + 'px ' + EFFECT_FONT_FAMILY;
  ctx.fillStyle = "#ffffff";
  const setupMaxWidth = ph(93);
  const setupStartX = pw(3.7);
  const setupStartY = ph(96.9);
  const setupLineHeight = setupFontSize * 1.2;

  // Prepare sideways drawing orientation
  ctx.save();
  ctx.translate(setupStartX, setupStartY); // Move canvas origin to where we want to start drawing
  ctx.rotate(-Math.PI/2); // Rotate the canvas 90deg

  // Do any modifications to the text to support symbols
  let modifiedInputValue = inputValue;
  // Replace placeholder H and F with custom symbols
  modifiedInputValue = modifiedInputValue.replaceAll('(H)', '҈____');
  modifiedInputValue = modifiedInputValue.replaceAll('(F)', '҉____');

  // Set the string of text to work with
  const setupString = "Setup: " + modifiedInputValue;

  // Extract all the words
  const words = setupString.split(' ');

  // Detect when there should be a line break
  let lines = [''];
  let currentLineIndex = 0;
  for (let i = 0; i < words.length; i++) {
    // First word of setup is easy
    if (i === 0) {
      lines[currentLineIndex] = words[i];
      continue;
    }
    // For all other words...
    // Check if adding this word would cause the line width to exceed the maximum
    let lineWithWordAdded = lines[currentLineIndex] + ' ' + words[i];
    if (ctx.measureText(lineWithWordAdded).width < setupMaxWidth) {
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
  for (let i = 0; i < lines.length; i++) {
    // Determine drawing origin
    const drawX = 0;
    const drawY = 0 + (setupLineHeight * i);
    // Replace underscores with spaces as we do with effect text
    const line = lines[i].replaceAll('_', ' ');
    // First line is special because of "Setup" label
    if (i == 0) {
      // Draw the word "Setup" bold and italic, then draw the rest normal
      // Part 1
      const part1 = line.substring(0, 5);
      ctx.font = '600 italic ' + setupFontSize + 'px ' + EFFECT_FONT_FAMILY;
      ctx.fillText(part1, drawX, drawY);
      // Part 2
      const part2 = line.substring(5);
      const part2X = drawX + ctx.measureText(part1).width;
      ctx.font = '400 normal ' + setupFontSize + 'px ' + EFFECT_FONT_FAMILY;
      ctx.fillText(part2, part2X, drawY);
    }
    // Any additional lines
    else {
      // Draw the whole line of text
      ctx.fillText(line, drawX, drawY);
    }
  }

  // THIS MIGHT BE USEFUL LATER
  const setupTotalHeight = setupLineHeight * lines.length;

  setupBorderOffset = setupTotalHeight - pw(1.5);

  // Return canvas orientation to normal
  ctx.restore()
}

/**
 * Draws the advanced game text label that indicates which phase it applies to, if any.
 * Most of this code was copied from drawCharacterBodyBox.
 */
function drawAdvancedLabel() {

  // Get the phase label
  const phaseLabel = $('#inputAdvancedPhase').val();

  // Width of label box
  let boxWidth;
  switch (phaseLabel) {
    case "start":
      boxWidth = pw(19);
      break;
    case "play":
      boxWidth = pw(18);
      break;
    case "end":
      boxWidth = pw(17);
      break;
    default:
      boxWidth = pw(17);
      break;
  }

  // Sets the coordinates of the corners of the textbox. The bottom will never change, but the top can change based on boxHeightOffset
  const boxValues = CHARACTER_BODY_BOX;
  const topLeft = [boxValues.topLeft.x + bodyWidthAdjustment - boxWidth, boxValues.topLeft.y + boxHeightOffset];
  const topRight = [boxValues.topLeft.x + bodyWidthAdjustment, boxValues.topLeft.y + boxHeightOffset];
  const bottomRight = [boxValues.bottomLeft.x + bodyWidthAdjustment, boxValues.bottomLeft.y];
  const bottomLeft = [boxValues.bottomLeft.x + bodyWidthAdjustment - boxWidth, boxValues.bottomLeft.y];

  // Determine the initial shape of the box.
  const boxShape = new Path2D();
  boxShape.moveTo(topLeft[0], topLeft[1]);
  boxShape.lineTo(topRight[0], topRight[1]);
  boxShape.lineTo(bottomRight[0], bottomRight[1]);
  boxShape.lineTo(bottomLeft[0], bottomLeft[1]);
  boxShape.closePath();

  // White background
  ctx.fillStyle = colorYellow;
  ctx.fill(boxShape);

  // Black border
  ctx.fillStyle = colorBlack;
  ctx.lineWidth = boxValues.borderThickness;
  ctx.stroke(boxShape);

  // Draw the text

  // Draw without phase label
  if (phaseLabel === "none") {
    // "Advanced..." style properties
    ctx.fillStyle = colorBlack;
    const advancedFontSize = ph(4.2);
    const verticalAlign = ph(1.2);
    ctx.font = "400 italic " + advancedFontSize + "px Unmasked BB";
    ctx.textAlign = "center";
    const advancedCenterX = topLeft[0] + (topRight[0] - topLeft[0]) / 2;
    const advancedCenterY = topLeft[1] + (bottomLeft[1] - topLeft[1]) / 2 + verticalAlign;

    // Set the string of text to render
    const advancedString = "Advanced...";

    // Draw the line of text
    ctx.fillText(advancedString, advancedCenterX, advancedCenterY);
    ctx.textAlign = "left";
  }

  // Draw with phase label
  else {
    // "Advanced..." style properties
    ctx.fillStyle = colorBlack;
    const advancedFontSize = ph(2.6);
    const verticalAlign = ph(-1.1);
    const horizontalAlign = pw(0.9);
    ctx.font = "400 italic " + advancedFontSize + "px Unmasked BB";
    ctx.textAlign = "left";
    const advancedLeftX = topLeft[0] + horizontalAlign;
    const advancedCenterY = topLeft[1] + (bottomLeft[1] - topLeft[1]) / 2 + verticalAlign;

    // Set the string of text to render
    const advancedString = "Advanced...";

    // Draw the line of text
    ctx.fillText(advancedString, advancedLeftX, advancedCenterY);
    ctx.textAlign = "left";

    // Get the phase code
    const phase = phaseLabel;

    // Get some information specific to this phase
    const phaseColor = PHASE_COLOR_MAP.get(useHighContrastPhaseLabels ? HIGH_CONTRAST : ORIGINAL_CONTRAST).get(phase);
    const phaseText = PHASE_TEXT_MAP.get(phase);

    // Get the phase icon to use
    const phaseIconKey = PHASE_ICON_MAP.get(phase) + (useHighContrastPhaseLabels ? " High Contrast" : "");
    const phaseIcon = loadedGraphics[phaseIconKey];
    if (!phaseIcon) {
      throw new Error(`Failed to get a phase icon: {phase: ${phase}, icon: ${phaseIcon}}.`)
    }

    // Draw the icon
    const iconWidth = iconHeight = PHASE_ICON_SIZE; // Icon graphics have 1:1 proportions
    const iconX = advancedLeftX - pw(0.3);
    const iconY = advancedCenterY + ph(0.1);
    ctx.drawImage(phaseIcon, iconX, iconY, iconWidth, iconHeight);

    // Draw the text after the icon
    const phaseX = advancedLeftX + iconWidth + pw(0.2);
    const phaseY = iconY + EFFECT_PHASE_FONT_SIZE;
    ctx.font = `400 ${EFFECT_PHASE_FONT_SIZE}px ${PHASE_FONT_FAMILY}`;
    ctx.strokeStyle = colorBlack;
    ctx.line = EFFECT_PHASE_FONT_SIZE
    ctx.lineWidth = EFFECT_PHASE_FONT_SIZE * 0.2;
    ctx.lineJoin = MITER;
    ctx.miterLimit = 3;
    ctx.strokeText(phaseText, phaseX, phaseY);
    ctx.fillStyle = phaseColor;
    ctx.fillText(phaseText, phaseX, phaseY);
  }

}

/**
 * Draws the description on a villain character card.
 */
function drawDescription() {
  // Check for description input. The input with this ID will always exist, so we can call toUpperCase() here safely.
  const description = $('#inputDescription').prop('value').toUpperCase();

  // Set some font styles before drawing the box
  const descriptionFontSize = pw(2.5);
  ctx.font = "600 " + descriptionFontSize + "px Boogaloo";
  // Squish the description font a little (1 = neutral)
  const descriptionSquish = 1.06;
  // Get description text width
  let descriptionWidth = ctx.measureText(description).width;
  // Apply a minimum width if the field is blank
  if (description === '') {
    descriptionWidth = pw(6);
  }

  // Box dimensions
  const boxMargin = pw(1.4); // Left and right margin between text and box border
  let boxX = pw(98); // Right side of box
  let boxY = ph(30) + inputBelowNameLogoAlignment; // Bottom of box
  const boxHeight = ph(5.2); // Height of box
  const boxExtraRight = pw(6.6);
  const boxWidth = descriptionWidth * descriptionSquish + boxMargin * 2 + boxExtraRight;
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
  ctx.fillStyle = colorYellow;
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
  // Keyword font
  let keywordFontSize = ph(2.4);
  ctx.font = "400 " + keywordFontSize + "px Avengeance Mightiest Avenger";
  // Squish the keyword font a little (1 = neutral)
  let keywordSquish = 1;
  // Get keywords text width
  let keywordsWidth = ctx.measureText(keywords).width;
  // Box dimensions
  let boxMargin = pw(1); // Left and right margin between text and box border
  let boxX = pw(99); // Right side of box
  let boxY = ph(34) + inputBelowNameLogoAlignment; // Bottom of box
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
  let keywordsY = boxY + ph(3.75);
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
  let hpGraphicSize = pw(9.5);
  let hpGraphicX = pw(91);
  let hpGraphicY = ph(20) + inputBelowNameLogoAlignment;
  ctx.drawImage(loadedGraphics['HP Graphic'], hpGraphicX, hpGraphicY, hpGraphicSize, hpGraphicSize);
  // Draw the HP text
  let hpFontSize = pw(4);
  // Downsize if more than 2 digits
  if (inputHP.length > 2) {
    hpFontSize = pw(3.5);
  }
  ctx.font = "600 " + hpFontSize + "px Boogaloo";
  ctx.fillStyle = colorBlack;
  ctx.textAlign = "center";
  let hpTextX = hpGraphicX + hpGraphicSize / 2.07;
  let hpTextY = hpGraphicY + hpGraphicSize / 2 + hpFontSize / 2.7;
  ctx.fillText(inputHP, hpTextX, hpTextY);
  // Reset
  ctx.textAlign = "left";
}