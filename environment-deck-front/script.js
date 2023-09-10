/*
============================================================================
Loading and app prep-work
============================================================================
*/


// Get and load default card frame
var cardFrameImageURL = "https://by3302files.storage.live.com/y4mhWQwi5poV1KRuT-IOCVunYPBbQh4xFdXUFvUcwTA1AglOPKKB_DVlkFWevg_arOLVEA4QcyFpwJJw4Gf5cPA9ZQkp9HWKv8cmKU-qQCsaTFLZxdu-tMZXQppvTNPzEUezInBZeMjRY3WuIdDD8pqYuSXaXJClB2YjL3yA3ihvecCW8hkfaCPdZwQjK3ARg88?width=586&height=823&cropmode=none";
var cardFrameImage = new Image();
//cardFrameImage.src = cardFrameImageURL;
cardFrameImage.src = '../_resources/hero deck card front frame.png'
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
  ['Base Env Card', '../_resources/environment deck card front frame.png'],
  ['Suddenly Env Card', '../_resources/environment deck card front frame suddenly.png'],
  ['Suddenly Tag', '../_resources/suddenly-tag.png']
]
let loadedGraphics = {};
imagesToPreload.forEach((image) => {
  let newImage = new Image();
  newImage.src = image[1];
  loadedGraphics[image[0]] = newImage;
})

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

  // Draw the card frame, check if suddenly
  if (suddenly) {
    ctx.drawImage(loadedGraphics['Suddenly Env Card'], 0, 0, canvas.width, canvas.height);
  } else {
    ctx.drawImage(loadedGraphics['Base Env Card'], 0, 0, canvas.width, canvas.height);
  }
  // load new list of effects
  loadEffectList();

  // Draw the card title and HP
  drawCardTitle();

  // Reset context states
  ctx.restore();
  ctx.save();

  // Draw the card keywords
  drawCardKeywords();

  // Draw the card effect
  drawBodyText(parseCardBody());

  // Draw the card quote
  drawCardQuote();

  // Draw the card quote attribution
  drawCardAttribution();


  // Update image element
  //canvasImage.src = canvas.toDataURL();
}



function drawCardArt() {

  // Crunch some numbers to get the crop, position, and scale of the image
  let outerX = 3;
  let outerY = 4; // Margin between left/right edge and crop area
  let imageAreaWidth = pw(47);
  let imageAreaHeight = ph(100 - outerY * 2);
  let imageAreaRatio = imageAreaWidth / imageAreaHeight;
  let imageAreaTop = ph(outerY);
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
  // Check for HP input
  let hasHP = false;
  let inputHP = $('#inputHP').prop('value');
  if (inputHP != '') {
    hasHP = true;
    // Draw the HP graphic
    let hpGraphicSize = ph(17.5);
    let hpGraphicX = pw(87);
    let hpGraphicY = ph(1.6);
    ctx.drawImage(loadedGraphics['HP Graphic'], hpGraphicX, hpGraphicY, hpGraphicSize, hpGraphicSize);
    // Draw the HP text
    let hpFontSize = ph(8.7);
    // Downsize if more than 2 digits
    if (inputHP.length > 2) {
      hpFontSize = ph(6.2);
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
  let titleFontSize = ph(5.3);
  ctx.font = "600 " + titleFontSize + "px Boogaloo";
  ctx.textAlign = "center";
  ctx.strokeStyle = colorBlack;
  ctx.lineWidth = ph(0.8);
  ctx.lineJoin = "miter";
  ctx.miterLimit = 3;
  // if this is a suddenly card, text color needs to be white
  if (suddenly) {
    ctx.fillStyle = '#ffffff';
  } else {
    ctx.fillStyle = '#fcb024';
  }
  let titleX = pw(72);
  // Offset horizontal center if card has HP
  if (hasHP) {
    titleX = pw(70);
  }
  let titleY = ph(13.3);
  let squish = 1; // Stretch the font a little
  ctx.save();
  ctx.scale(squish, 1); // Apply the stretch
  titleX = titleX / squish;
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
    let keywordFontSize = ph(4.5);
    ctx.font = '400 ' + keywordFontSize + 'px Boogaloo';
    // Squish the keyword font a little
    let keywordSquish = 0.95;
    // Get keywords text width
    let keywordsWidth = ctx.measureText(keywords).width;
    // Box dimensions
    let boxMargin = ph(0.6); // Left and right margin between text and box border
    let boxX = pw(52);
    let boxY = ph(17);
    let boxHeight = pw(4.2);
    let boxWidth = keywordsWidth * keywordSquish + boxMargin * 2;
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
    let keywordsY = boxY + boxHeight * 0.78;
    ctx.textAlign = "left";
    ctx.save();
    ctx.scale(keywordSquish, 1);
    // Draw the keywords
    ctx.fillText(keywords, keywordsX, keywordsY);
    // Undo the squish for future drawings
    ctx.restore();
    // add suddenly tag
    if (suddenly) {
      ctx.drawImage(loadedGraphics['Suddenly Tag'], pw(50), ph(14.5), ph(21), pw(7.5));
    }
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
    let keywordFontSize = ph(3.3);
    ctx.font = "400 italic " + keywordFontSize + "px Unmasked BB";
    // Squish the keyword font a little
    let keywordSquish = 0.9;
    // Get keywords text width
    let keywordsWidth = ctx.measureText(keywords).width;
    // Box dimensions
    let boxMargin = ph(1); // Left and right margin between text and box border
    let cornerSpace = ph(4.2);
    let boxX = pw(100) - cornerSpace; // Right side of box
    let boxY = ph(100) - cornerSpace; // Bottom of box
    let boxHeight = pw(2.1);
    let boxWidth = keywordsWidth * keywordSquish + boxMargin * 2;
    boxX -= boxWidth;
    boxY -= boxHeight;
    // Box style
    ctx.fillStyle = '#fcb024';
    ctx.strokeStyle = colorBlack;
    ctx.lineWidth = ph(1.1);
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