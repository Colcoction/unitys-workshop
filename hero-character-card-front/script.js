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
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Reset context states
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

  // === Draw the text box

  // 1) create the shape
  let topLeft, topRight, bottomLeft, bottomRight, heightOffset;

  // Default coordinates (bottom will never change, but top could change based on heightOffset)
  topLeft = [pw(10), ph(79)]; topRight = [pw(90), ph(79)];
  bottomLeft = [pw(10), ph(94)]; bottomRight = [pw(90), ph(93)];

  heightOffset = savedBoxHeightOffset;

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

  const powerNameX = pw(12.5);
  const powerNameY = ph(82.5) + savedBoxHeightOffset;
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

  loadEffectList();

  // === Draw the power text
  drawPowerText();


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



function drawKeywords() {
  // Get user input
  let keywords = $('#inputKeywords').prop('value');
  if (keywords) {
    // Convert to all uppercase letters
    keywords = keywords.toUpperCase();
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
    let boxY = ph(79) + savedBoxHeightOffset; // Bottom of box (still need to find this number)
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
}


function drawHP() {
  // Check for HP input
  let hasHP = false;
  let inputHP = $('#inputHP').prop('value');
  if (inputHP != '') {
    hasHP = true;
    // Draw the HP graphic
    let hpGraphicSize = pw(17);
    let hpGraphicX = pw(78);
    let hpGraphicY = ph(72) + savedBoxHeightOffset;
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

let savedBoxHeightOffset = 0; // For the text box expanding to accomodate longer innate powers

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


function drawPowerText() {
  // Initialize positioning values
  currentOffsetX = effectStartX;
  currentOffsetY = effectStartY + savedBoxHeightOffset;

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

  // Once all the blocks have been drawn...
  // === Update box height
  // Get height of the entire game text
  let thisEffectHeightChange = (effectStartY + savedBoxHeightOffset) - currentOffsetY;
  // Round to prevent bug
  thisEffectHeightChange = Math.round(thisEffectHeightChange);
  // Have a minimum height that gets used
  thisEffectHeightChange = Math.min(thisEffectHeightChange, -137) + 137;
  // Note: 137 is a magic number roughly equal to "the height needed for 3 normal lines in the same paragraph" that will need to be updated if the canvas size gets updated.
  // Now that we have the height of this text, see if we need to redraw the canvas to update the height and positioning of other pieces.
  if (thisEffectHeightChange !== savedBoxHeightOffset) {
    console.log(thisEffectHeightChange, savedBoxHeightOffset);
    savedBoxHeightOffset = thisEffectHeightChange;
    drawCardCanvas();
  }
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
      currentOffsetY = effectStartY + savedBoxHeightOffset;
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
    let iconY = currentOffsetY - EFFECT_PHASE_FONT_SIZE;// iconHeight/2;
    ctx.drawImage(thisIcon, iconX, iconY, iconWidth, iconHeight);

    // Style and draw the text after the icon
    // Set basic font properties
    ctx.font = '400 ' + EFFECT_PHASE_FONT_SIZE + 'px ' + effectPhaseFontFamily;
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
    ctx.lineWidth = EFFECT_PHASE_FONT_SIZE * 0.2;
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
  // add special processing for spaces after numbers
  let words = blockString.split(' ').flatMap((word) => {
    let newWord = word;
    // double count the word afterwards
    if (word.indexOf('\xa0') != -1) {
      newWord = word.split('\xa0');
      newWord[0] = word
    }
    return newWord;
  });

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

      // remove double counted word since we already calculated if we need to go to the next line
      if (wordString.indexOf('\xa0') != -1) {
        wordString = wordString.split('\xa0')[0];
        wordWidth = ctx.measureText(wordString).width;
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
      }
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


// Toggle high contrast phase labels
$('#inputUseHighConstrast').on('input', function () {
  useHighContrastPhaseLabels = this.checked;
  drawCardCanvas();
})



/*
============================================================================
Notepad
============================================================================







*/