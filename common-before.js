/*
============================================================================
Static global variables
============================================================================
*/
// Card forms. This should be declared in the page's script configurations as CARD_FORM.
const DECK = "deck";
const CHARACTER = "character";
// Orientations. This should be declared in the page's script configurations as ORIENTATION.
const VERTICAL = "vertical";
const HORIZONTAL = "horizontal";
// Card preview sizes. These should match the text content of buttons on the page.
const SMALL = "Small";
const MEDIUM = "Medium";
const LARGE = "Large";
const CARD_PREVIEW_SIZES = [SMALL, MEDIUM, LARGE];
// Maps canvas container widths based on user-provided sizes (small, med, large) and card orientation. Used in {@link setCanvasWidth()}.
const canvasSizes = new Map([
    [VERTICAL, new Map([
        [SMALL,   250],
        [MEDIUM,  350],
        [LARGE,   450],
    ])],
    [HORIZONTAL, new Map([
        [SMALL,   400],
        [MEDIUM,  500],
        [LARGE,  600],
    ])],
]);
// Block types when parsing card text
const PHASE_BLOCK = "phase";
const INDENT_BLOCK = "indent";
const SIMPLE_BLOCK = "simple";
const BLOCK_TYPES = [PHASE_BLOCK, INDENT_BLOCK, SIMPLE_BLOCK];
// Phase names
const START_PHASE = "start";
const PLAY_PHASE = "play";
const POWER_PHASE = "power";
const DRAW_PHASE = "draw";
const END_PHASE = "end";
const PHASE_LABELS = [START_PHASE, PLAY_PHASE, POWER_PHASE, DRAW_PHASE, END_PHASE];
// Phase color contrasts
const HIGH_CONTRAST = "high";
const ORIGINAL_CONTRAST = "original"
// Gross RegeEx for identifying phase blocks
const _phaseSymbols = "[.,!;:<>[\\](){}\\-|]"; // "\" and "]" need to be escaped inside regex brackets
const PHASE_REGEX = new RegExp(`^${_phaseSymbols}* ?(${PHASE_LABELS.join("|")}) phase ?${_phaseSymbols}? *`);
const PHASE_INDEX = 1; // the position of the phase word that is identified in PHASE_REGEX

// Map of phases to various rendering strings
const PHASE_TEXT_MAP = new Map([
    [START_PHASE, "Start Phase"],
    [PLAY_PHASE, "Play Phase"],
    [POWER_PHASE, "Power Phase"],
    [DRAW_PHASE, "Draw Phase"],
    [END_PHASE, "End Phase"],
]);
const PHASE_ICON_MAP = new Map([
    [START_PHASE, "Start Phase Icon"],
    [PLAY_PHASE, "Play Phase Icon"],
    [POWER_PHASE, "Power Phase Icon"],
    [DRAW_PHASE, "Draw Phase Icon"],
    [END_PHASE, "End Phase Icon"],
]);
// Labels for indented effects (power, reaction) and (less gross) regex
const POWER_LABEL = "power:";
const REACTION_LABEL = "reaction:";
const INDENT_LABELS = [POWER_LABEL, REACTION_LABEL];
const INDENT_REGEX = new RegExp(`^(${INDENT_LABELS.join("|")})`);
const INDENT_INDEX = 1;
// Colors for card effects
//  TODO: Once colors everywhere are refactored to use PHASE_COLOR_MAP, the individually-set
//  colors can be removed
const colorBlack = '#231f20';
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
const PHASE_COLOR_MAP = new Map([
    [ORIGINAL_CONTRAST, new Map([
        [START_PHASE, "#3fae49"],
        [PLAY_PHASE, "#fff200"],
        [POWER_PHASE, "#79509e"],
        [DRAW_PHASE, "#00aeef"],
        [END_PHASE, "#ee2d35"],
    ])],
    [HIGH_CONTRAST, new Map([
        [START_PHASE, "#4bc244"],
        [PLAY_PHASE, "#fff72f"],
        [POWER_PHASE, "#a76fb9"],
        [DRAW_PHASE, "#3db7e2"],
        [END_PHASE, "#f34747"],
    ])],
]);
// Map of phase text properties
// PHASE_FONT_SIZE_MAP is declared at the bottom of the page because it depends on canvas size
const PHASE_FONT_FAMILY = 'Avengeance Mightiest Avenger';
const PHASE_SIZE_FACTOR = 1;
// Map of indented label properties
const INDENT_LABEL_FONT_FAMILY = "Work Sans";
const INDENT_LABEL_SIZE_FACTOR = 1.08;
// Line joins (we only use miter)
const MITER = "miter";

/*
============================================================================
Global functions
============================================================================
*/
// Short function to convert percentage (ex: 50) into pixels
/** Gets the pixel count that corresponds to a given percentage width. */
function pw(percentageWidth) {
    return percentageWidth * canvas.width / 100;
}
/** Gets the pixel count that corresponds to a given percentage height. */
function ph(percentageHeight) {
    return percentageHeight * canvas.height / 100;
}
/**
 * Gets the pixel count that corresponds to a given percentage of the card's smallest dimension, which is
 * height for horizontal cards and width for vertical cards.
 */
function ps(percentageSmall) {
    if (ORIENTATION === HORIZONTAL) {
        return ph(percentageSmall);
    }
    // else ORIENTATION === VERTICAL
    return pw(percentageSmall);
}

// Sets canvas width given a card preview size, using the page's pre-configured orientation
function setCanvasWidth(cardPreviewSize) {
    $('#canvasContainer').css({ width: canvasSizes.get(ORIENTATION).get(cardPreviewSize) });
}

/*
============================================================================
Common listeners
============================================================================
*/
// Canvas preview size button
$('.previewSizeButton').on('click', function (e) {
    // Get the button's text
    let buttonText = e.target.textContent;
    // This should never happen, but if the text content doesn't match an expected type, log a warning and set it to medium
    if (!CARD_PREVIEW_SIZES.includes(buttonText)) {
        console.warn(`Someone tried to set the size to ${buttonText}, but the only available sizes are [${CARD_PREVIEW_SIZES.join(", ")}]. Setting the size to ${MEDIUM}.`);
        buttonText = MEDIUM;
    }
    // Based on the button's text (the name of the size), determine the new canvas size
    setCanvasWidth(buttonText);
});


// Range sliders with text box - when one changes, copy its value to the other
$('.rangeSlider').on('input', function (e) {
    $(this).next().val($(this).val());
});
$('.rangeText').on('input', function (e) {
    $(this).prev().val($(this).val());
});
// Also, when the page loads, copy the default value from the slider into the text box
$('.rangeText').each(function (e) {
    $(this).val($(this).prev().val());
});


// Populate inputs with default values on startup
$('*[data-image-purpose]').each(function () {
    if (this.dataset.default) {
        this.value = this.dataset.default;
    }
});


// Reset art adjustments button
$('.adjustmentResetButton').on('click', function () {
    let areaName = this.dataset.imagePurpose;
    // Reset input values to their defaults, stated in "data-default" attribute
    $(`.contentInput[data-image-purpose="${areaName}"]`).each(function () {
        if (this.dataset.default) {
            this.value = this.dataset.default;
        }
    });
    // Remove uploaded image
    $(`.contentInput[data-image-purpose="${areaName}"][type="file"]`).each(function () {
        this.value = '';
        loadedUserImages[areaName] = null;
    });
    // Redraw canvas (since "on input" event didn't trigger)
    drawCardCanvas();
});


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
});


// Close buttons (in info boxes)
$('.closeButton, .screenOverlayNegativeSpace').on('click', function (e) {
    // Make screen overlay and info boxes invisible
    $('.screenOverlay, .overlayBox').css({ 'display': 'none' });
});


// Download button
$('#downloadButton').on('click', function () {
    // Use the title input for the default file name
    const link = document.createElement('a');
    link.download = `${$("#inputTitle")?.val()?.trim() || DEFAULT_DOWNLOAD_NAME}.png`;
    link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    link.click();
    link.remove();
});

/*
============================================================================
Initialization Logic
============================================================================
*/
// Establish canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.save();
setCanvasWidth(MEDIUM);

/*
============================================================================
Initialization-Dependent Global Variables
============================================================================
*/
const _phaseFontSizeMap = new Map([
    [DECK, new Map([
        [VERTICAL, pw(4.1)],
        [HORIZONTAL, ph(4.1)],
    ])],
    [CHARACTER, new Map([
        [VERTICAL, pw(4)],
        [HORIZONTAL, ph(4)],
    ])],
]);
const EFFECT_PHASE_FONT_SIZE = _phaseFontSizeMap.get(CARD_FORM).get(ORIENTATION);
const _phaseIconSizeMap = new Map([
    [DECK, new Map([
        [VERTICAL, pw(8.9)],
        [HORIZONTAL, pw(54)],
    ])],
    [CHARACTER, new Map([
        [VERTICAL, pw(8.9)],
        // TODO: UW hasn't set up horizontal character cards yet, so we're leaving this null.
        //       If you're reading this comment because you hit a null error, figure this
        //       value out and update it! 
        [HORIZONTAL, null],
    ])],
]);
const PHASE_ICON_X = _phaseIconSizeMap.get(CARD_FORM).get(ORIENTATION);
