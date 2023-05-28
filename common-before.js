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
// Faces. This should be declared in the page's script configurations as FACE.
const FRONT = "front";
const BACK = "back";
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
const SPACE_BLOCK = "space";
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
// Labels for indented effects (power, reaction, bullets):
const POWER_LABEL = "power:";
const REACTION_LABEL = "reaction:";
const BULLET_LABEL = "»";
const INDENT_LABEL_MAP = new Map([
    [POWER_LABEL, POWER_LABEL],
    [REACTION_LABEL, REACTION_LABEL],
    // Unlike power and reaction labels, bullet labels aren't necessarily specified in the way they are printed.
    ["- ", BULLET_LABEL],
    ["> ", BULLET_LABEL],
    ["* ", BULLET_LABEL],
    ["» ", BULLET_LABEL],
]);
const INDENT_LABELS = [POWER_LABEL, REACTION_LABEL, BULLET_LABEL];
const INDENT_LABEL_SPECIFIERS = Array.from(INDENT_LABEL_MAP.keys());
const INDENT_INDEX = 1;
// Colors for card effects
const colorBlack = '#231f20';
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
// PHASE_FONT_SIZE_MAP is declared at the bottom of the page because it depends on canvas size
const PHASE_FONT_FAMILY = 'Avengeance Mightiest Avenger';
const PHASE_SIZE_FACTOR = 1;
// Map of indented label properties
const INDENT_LABEL_FONT_FAMILY = "Work Sans";
const INDENT_LABEL_SIZE_FACTOR = 1.08;
// Line joins (we only use miter)
const MITER = "miter";
// Body text properties
const EFFECT_FONT_WEIGHT = 400;
const EFFECT_FONT_FAMILY = 'Noto Sans';
// Font-weight-normalized space between words
const SPACE_WIDTH_FACTOR = 0.26;

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

/** Resets the settings for a given data image input with the specified purpose (e.g. "mainArt", "backgroundArt") */
function resetDataImageSettings(imagePurpose) {
    $(`.contentInput[data-image-purpose="${imagePurpose}"]`).each(function () {
        if (this.dataset.default) {
            this.value = this.dataset.default;
        }
    });
}

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
// TODO: HORIZONTAL CHARACTERS - UW hasn't set up horizontal character cards yet, so many mapped results for CHARACTER + VERTICAL cards
//       are null. If you're reading this comment because you hit a null error, figure this value out and update the maps!

// Font size for phase labels
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
const EFFECT_PHASE_FONT_SIZE = _phaseFontSizeMap.get(CARD_FORM)?.get(ORIENTATION);

// Size of the phase icons placed next to labels
const _phaseIconSizeMap = new Map([
    [DECK, new Map([
        [VERTICAL, pw(8.9)],
        [HORIZONTAL, pw(54)],
    ])],
    [CHARACTER, new Map([
        [VERTICAL, pw(8.9)],
        // Intentionally null. See TODO: HORIZONTAL CHARACTERS above
        [HORIZONTAL, null],
    ])],
]);
const PHASE_ICON_X = _phaseIconSizeMap.get(CARD_FORM)?.get(ORIENTATION);

// Font size for most effect text
const _baseFontSizeMap = new Map([
    [DECK, new Map([
        [VERTICAL, pw(4.05)],
        [HORIZONTAL, ph(4.05)],
    ])],
    [CHARACTER, new Map([
        [VERTICAL, pw(3.95)],
        // Intentionally null. See TODO: HORIZONTAL CHARACTERS above
        [HORIZONTAL, null],
    ])],
]);
const EFFECT_BASE_FONT_SIZE = _baseFontSizeMap.get(CARD_FORM)?.get(ORIENTATION);

// The X position to begin drawing effect text
const _effectStartXMap = new Map([
    [DECK, new Map([
        [VERTICAL, pw(12.5)],
        [HORIZONTAL, pw(57)],
    ])],
    [CHARACTER, new Map([
        [VERTICAL, pw(14.5)],
        // Intentionally null. See TODO: HORIZONTAL CHARACTERS above
        [HORIZONTAL, null],
    ])],
]);
const EFFECT_START_X = _effectStartXMap.get(CARD_FORM)?.get(ORIENTATION);

// The X position to stop drawing effect text
const _effectEndXMap = new Map([
    [DECK, new Map([
        [VERTICAL, pw(101 - 12.5)],
        [HORIZONTAL, pw(101 - 7)],
    ])],
    [CHARACTER, new Map([
        [VERTICAL, pw(101 - 14.5)],
        // Intentionally null. See TODO: HORIZONTAL CHARACTERS above
        [HORIZONTAL, null],
    ])],
]);
const EFFECT_END_X =  _effectEndXMap.get(CARD_FORM)?.get(ORIENTATION);

// The Y position to begin drawing effect text
const _effectStartYMap = new Map([
    [DECK, new Map([
        [VERTICAL, new Map([
            [FRONT, ph(61.5)],
            // Deck backs don't have effect text
            [BACK, null],
        ])],
        [HORIZONTAL, new Map([
            [FRONT, ph(28)],
            // Deck backs don't have effect text
            [BACK, null],
        ])],
    ])],
    [CHARACTER, new Map([
        [VERTICAL, new Map([
            [FRONT, ph(85.5)],
            [BACK, ph(86)],
        ])],
        // Intentionally null. See TODO: HORIZONTAL CHARACTERS above
        [HORIZONTAL, null],
    ])],
]);
const EFFECT_START_Y = _effectStartYMap.get(CARD_FORM)?.get(ORIENTATION)?.get(FACE);

/*
============================================================================
Modifiable Global Variables
============================================================================
*/
// The offset to apply to the height at which the body of a card is drawn.
let boxHeightOffset = 0;

// Whether to use high contrast phase labels
let useHighContrastPhaseLabels = $('#inputUseHighConstrast').length > 0 ? $('#inputUseHighConstrast')[0].checked : false;

// Whether a card has the Suddenly! keyword
let suddenly = $('#suddenly').length > 0 ? $('#suddenly')[0].checked : false;

// The scale of the body text and line height for a card. This is a value between 0 and 1, set by the user.
let effectFontScale = 1;

// The size of body text for a card. This is a convenience variable, derived from effectFontScale * EFFECT_BASE_FONT_SIZE 
let effectFontSize = effectFontScale * EFFECT_BASE_FONT_SIZE;

// The size of the space between words. This is a convenience variable, derived from effectFontSize * SPACE_WIDTH_FACTOR
let spaceWidth = effectFontSize * SPACE_WIDTH_FACTOR;
