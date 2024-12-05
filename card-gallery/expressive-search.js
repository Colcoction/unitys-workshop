/*
============================================================================
Parsing Into Cards
============================================================================
*/
/**
 * A record representing a single Definitive Edition card. This contains a definitive list of every possible property a card can have, including metadata like quantity.
 * <p>
 * Property names and constraints aren't actually enforced because this is JavaScript (big sad), so everything in the constructor is just meant as documentation.
 */
class Card {
  constructor() {
    // ==========
    // Unique ID
    // ==========
    // Some day this might not be necessary, but right now it's a nice way to help identify which card on the webpage corresponds to a which card in memory without needing to track
    // a billion DOM references. JavaScript doesn't guarantee uniqeness, but this *should* be unique because of the way we calculate it. 
    // String, non-null
    this.id = "";

    // ==========
    // Names
    // ==========
    // Deck, character, and title are distinct depending on the circumstances. Here are some examples:
    //  - The Morrigan
    //    - deckName:       The Fey Court
    //    - characterName:  The Morrigan
    //    - title:          The Morrigan
    //  - Play the System
    //    - deckName:       The Operative
    //    - characterName:  The Operative
    //    - title:          Play the System
    //  - FA Absolute Zero
    //    - deckName:       Absolute Zero
    //    - characterName:  Absolute Zero
    //    - title:          Absolute Zero
    //  - Hostage Situation
    //    - deckName:       Megalopolis
    //    - characterName:  (null)
    //    - title:          Hostage Situation
    // String, non-null
    this.deckName = "";

    // String, nullable
    // This is only null for environment decks
    this.characterName = "";

    // String, non-null
    this.title = "";


    // ==========
    // Card Content
    // ==========
    // String, nullable
    // Only non-null for hero character cards
    this.variant = null;

    // String, nullable
    // Only non-null for villain character cards
    this.description = null;

    // String, nullable
    // Only non-null for event cards
    this.date = null;

    // String array, non-null
    // A hypothetical card with no keywords would be an empty array
    this.keywords = [];

    // Integer, nullable
    this.hp = null;

    // Integer, nullable
    this.collectionLimit = null;

    // Array of strings, non-null
    // Cards with no nemesis icons have an empty array
    this.nemesisIcons = [];

    // String, nullable
    // Only non-null for hero character cards
    this.innatePowerName = null;

    // String, nullable
    // Only non-null for hero character cards
    this.innatePowerEffect = null;

    // String, nullable
    // Only non-null for event cards
    this.eventRuleTitle = null;

    // String, nullable
    // Only non-null for event cards
    this.eventRuleEffect = null;

    // String, nullable
    this.setup = null;

    // String, nullable
    this.gameText = null;

    // String, nullable
    this.advancedGameText = null;

    // String, nullable
    this.featuredIssue = null;

    // String, nullable
    this.flavorText = null;

    // String, nullable
    this.flavorTextAttribution = null;

    // String, nullable
    this.incapCaption = null;

    // String array, nullable
    // An hypothetical card with an incap side and no incap options would be an empty array
    this.incapOptions = null;

    // String, nullable
    this.incapFeaturedIssue = null;

    // String, nullable
    this.backDescription = null;
    
    // String, nullable
    // A hypothetical card with a back side but not keywords on it would be an empty array
    this.backKeywords = null;

    // Integer, nullable
    this.backHp = null;

    // Array of strings, non-null
    this.backNemesisIcons = [];

    // String, nullable
    this.backGameText = null;

    // String, nullable
    this.backAdvancedGameText = null; 

    // String, nullable
    this.collectionFlavorText = null;

    // String, nullable
    this.collectionFeaturedIssue = null;

    // String, nullable
    this.rewardATitle = null;

    // String, nullable
    this.rewardAFlavorText = null;

    // String, nullable
    this.rewardAGameText = null;

    // String, nullable
    this.rewardBTitle = null;

    // String, nullable
    this.rewardBFlavorText = null;

    // String, nullable
    this.rewardBGameText = null;

    // String array, nullable
    this.collectionIssues = null;


    // ==========
    // Metadata
    // ==========
    // Integer, nullable
    // Technically character cards have a quantity of 1, but the only time anyone cares about this field is when it refers to cards in an actual deck
    this.quantity = null;

    // String, non-null
    this.set = ""

    // Integer, nullable
    // Only base hero character cards get complexity. Variants of that hero have a null complexity, as do hero cards in the deck.
    this.complexity = null;

    // Integer, nullable
    // Only primary base villain character cards get difficulty. Secondary villains and critical events have a null complexity, as do villain cards in the deck.
    this.difficulty = null;

    // String, non-null
    // Enum of:
    //  - hero
    //  - villain
    //  - environment
    //  - event
    //  - critical event
    this.type = "";

    // String, non-null
    // Enum of:
    //  - deck
    //  - character
    //  - event
    this.kind = "";

    // Boolean, non-null
    this.hasBack = false;
  }
}

/** An array that holds all of the cards. This gets filled out by {@link awesomeParser()}. */
const cards = [];

/** Parses a TSV into {@link Card}s and adds then to {@link cards} */
function awesomeParser(tsvData, dataGroup) {
  if (dataGroup === 'Hero Character Cards') {
      parseHeroCharacterCards(tsvData);
  } else if (dataGroup === 'Hero Cards') {
      parseHeroDeckCards(tsvData);
  } else if (dataGroup === 'Villain Character Cards') {
      parseVillainCharacterCards(tsvData);
  } else if (dataGroup === 'Events') {
      parseStandardEventCards(tsvData);
  } else if (dataGroup === 'Critical Events') {
      parseCriticalEventCards(tsvData);
  } else if (dataGroup === 'Villain Cards') {
      parseVillainDeckCards(tsvData);
  } else if (dataGroup === 'Environment Cards') {
      parseEnvironmentDeckCards(tsvData);
  } else {
      throw new Error(`Unidentified data group: ${dataGroup}.`);
  }
}

function parseHeroCharacterCards(tsvData) {
  let dataLines = getDataLines(tsvData)
  // The hero character sheet has 2 header rows
  for (let lineIndex = 2; lineIndex < dataLines.length; lineIndex++) {
    let line = getLine(dataLines, lineIndex);
    let card = new Card();
    card.id = buildUniqueId("hc", lineIndex);
    card.variant = line[0];
    card.deckName = line[1];
    card.characterName = line[1];
    card.title = line[1];
    card.keywords = extractKeywords(line[2]);
    card.hp = parseInt(line[3]);
    card.nemesisIcons = extractNemesisIcons(line[4]);
    card.innatePowerName = line[5];
    card.innatePowerEffect = line[6];
    card.gameText = line[7];
    card.featuredIssue = line[8];
    card.incapCaption = line[9];
    card.incapOptions = [line[10], line[11], line[12]];
    card.incapFeaturedIssue = line[13];
    card.set = line[14];
    card.complexity = line[15];
    card.type = "hero";
    card.kind = "character";
    card.hasBack = true;
    cards.push(card);
  }
}

function parseHeroDeckCards(tsvData) {
  let dataLines = getDataLines(tsvData)
  // The hero deck card sheet has 1 header row
  for (let lineIndex = 1; lineIndex < dataLines.length; lineIndex++) {
    let line = getLine(dataLines, lineIndex);
    let card = new Card();
    card.id = buildUniqueId("hd", lineIndex);
    card.deckName = line[0];
    card.characterName = line[0];
    card.title = line[1];
    card.hp = extractHp(line[2]);
    card.keywords = extractKeywords(line[3]);
    card.gameText = line[4];
    card.flavorText = line[5];
    card.flavorTextAttribution = line[6];
    card.quantity = parseInt(line[7]);
    card.set = line[8];
    card.type = "hero";
    card.kind = "deck";
    card.hasBack = false;
    cards.push(card);
  }
}

function parseVillainCharacterCards(tsvData) {
  let dataLines = getDataLines(tsvData)
  // The villain character card sheet has 2 header rows
  for (let lineIndex = 2; lineIndex < dataLines.length; lineIndex++) {
    let line = getLine(dataLines, lineIndex);
    let card = new Card();
    card.id = buildUniqueId("vc", lineIndex);
    card.deckName = line[0];
    card.characterName = line[1];
    card.title = line[1];
    card.description = line[2];
    card.keywords = extractKeywords(line[3]);
    card.hp = extractHp(line[4]);
    card.nemesisIcons = extractNemesisIcons(line[5]);
    card.setup = line[6];
    card.gameText = line[7];
    card.advancedGameText = line[8];
    card.backDescription = line[9];
    card.backKeywords = extractKeywords(line[10]);
    card.backHp = extractHp(line[11]);
    card.backNemesisIcons = extractNemesisIcons(line[12]);
    card.backGameText = line[13];
    card.backAdvancedGameText = line[14];
    card.set = line[15];
    card.difficulty = line[16];
    card.type = "villain";
    card.kind = "character";
    card.hasBack = true;
    cards.push(card);
  }
}

function parseStandardEventCards(tsvData) {
  let dataLines = getDataLines(tsvData)
  // The standard event card sheet has 2 header rows
  for (let lineIndex = 2; lineIndex < dataLines.length; lineIndex++) {
    let line = getLine(dataLines, lineIndex);
    let card = new Card();
    card.id = buildUniqueId("es", lineIndex);
    card.title = line[0];
    card.date = line[1];
    card.featuredIssue = line[2];
    card.flavorText = line[3];
    card.collectionLimit = parseInt(line[4]);
    card.deckName = line[5];
    card.characterName = line[5];
    card.eventRuleTitle = line[6];
    card.eventRuleEffect = line[7];
    card.collectionFlavorText = line[8];
    card.collectionIssues = line[9].split("\n");
    card.collectionFeaturedIssue = line[10];
    card.rewardATitle = line[11];
    card.rewardAFlavorText = line[12];
    card.rewardAGameText = line[13];
    card.rewardBTitle = line[14];
    card.rewardBFlavorText = line[15];
    card.rewardBGameText = line[16];
    card.set = line[17];
    card.type = "event";
    card.kind = "event";
    card.hasBack = true;
    cards.push(card);
  }
}

function parseCriticalEventCards(tsvData) {
  let dataLines = getDataLines(tsvData)
  // The critical event card sheet has 1 header row
  for (let lineIndex = 1; lineIndex < dataLines.length; lineIndex++) {
    let line = getLine(dataLines, lineIndex);
    let card = new Card();
    card.id = buildUniqueId("ec", lineIndex);
    card.title = line[0];
    card.date = line[1];
    card.featuredIssue = line[2];
    card.flavorText = line[3];
    card.collectionLimit = line[4];
    card.deckName = "[MISSING]";
    card.characterName = line[5];
    card.title = line[5];
    card.description = line[6];
    card.keywords = extractKeywords(line[7]);
    card.hp = extractHp(line[8]);
    card.nemesisIcons = extractNemesisIcons(line[9]);
    card.setup = line[10];
    card.gameText = line[11];
    card.advancedGameText = line[12];
    card.set = line[13];
    card.type = "critical event";
    card.kind = "event";
    card.hasBack = true;
    cards.push(card);
  }
}

function parseVillainDeckCards(tsvData) {
  let dataLines = getDataLines(tsvData)
  // The villain deck card sheet has 1 header row
  for (let lineIndex = 1; lineIndex < dataLines.length; lineIndex++) {
    let line = getLine(dataLines, lineIndex);
    let card = new Card();
    card.id = buildUniqueId("vd", lineIndex);
    card.deckName = line[0];
    card.characterName = line[1];
    card.title = line[2];
    card.hp = extractHp(line[3]);
    card.keywords = extractKeywords(line[4]);
    card.gameText = line[5];
    card.flavorText = line[6];
    card.flavorTextAttribution = line[7];
    card.quantity = parseInt(line[8]);
    card.set = line[9];
    card.type = "villain";
    card.kind = "deck";
    card.hasBack = false;
    cards.push(card);
  }
}

function parseEnvironmentDeckCards(tsvData) {
  let dataLines = getDataLines(tsvData)
  // The environment deck card sheet has 1 header row
  for (let lineIndex = 1; lineIndex < dataLines.length; lineIndex++) {
    let line = getLine(dataLines, lineIndex);
    let card = new Card();
    card.id = buildUniqueId("ed", lineIndex);
    card.deckName = line[0];
    card.characterName = null;
    card.title = line[1];
    card.hp = extractHp(line[2]);
    card.nemesisIcons = extractNemesisIcons(line[3]);
    card.keywords = extractKeywords(line[4]);
    card.gameText = line[5];
    card.flavorText = line[6];
    card.flavorTextAttribution = line[7];
    card.quantity = parseInt(line[8]);
    card.set = line[9];
    card.type = "environment";
    card.kind = "deck";
    card.hasBack = false;
    cards.push(card);
  }
}

function getDataLines(tsvData) {
  return tsvData.split("\n");
}

function getLine(dataLines, lineIndex) {
  return dataLines[lineIndex].split("\t");
}

function extractKeywords(keywordsString) {
  return keywordsString.split(", ");
}

function extractHp(hpString) {
  if (hpString === "-") {
    return null;
  }
  return parseInt(hpString);
}

function extractNemesisIcons(nemesisIconsString) {
  if (nemesisIconsString === "-") {
    return [];
  }
  return nemesisIconsString.split("\n");
}

/**
 * Creates a unique ID for a card, given its data group prefix (the spreadsheet it appears in) and its line index (the line in which it appears in that spreadsheet).
 * See {@link Card#id}.
 */
function buildUniqueId(dataGroupIdPrefix, lineIndex) {
  return `${dataGroupIdPrefix}-${lineIndex}`;
}

/*
============================================================================
Matching Utility Methods
============================================================================
*/
function regexMatch(candidate, regexp) {
  return !!candidate?.match(regexp);
}

function listRegexMatch(candidate, regexp) {
  if (!candidate || candidate.length == 0) {
    return false;
  }
  return candidate.some(c => regexMatch(c, regexp));
}

function numberMatch(candidate, target, relationship) {
  if (!candidate) {
    return false;
  }
  if (relationship === "=" || relationship === ":") {
    return candidate == target;
  } else if (relationship === ">") {
    return candidate > target;
  } else if (relationship === ">=") {
    return candidate >= target;
  } else if (relationship === "<") {
    return candidate < target;
  } else if (relationship === "<=") {
    return candidate <= target;
  } else {
    throw new Error(`Invaid relationship: ${this.relationship}.`);
  }
}

function xnor(a, b) {
  return a ? b : !b;
}

function parseBoolean(boolString) {
  if (['t', 'true', 'y', 'yes'].includes(boolString)) {
    return true;
  } else if (['f', 'false', 'n', 'no'].includes(boolString)) {
    return false;
  }
  throw new Error(`Can't parse string to boolean: ${boolString}`);
}

/*
============================================================================
Expressive Search Queries
============================================================================
*/
class DeckNameCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.deckName, this.regexp);
  }
}

class CharacterNameCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.characterName, this.regexp);
  }
}

class TitleCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.title, this.regexp);
  }
}

class VariantCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.variant, this.regexp);
  }
}

class DescriptionCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.description, this.regexp) || regexMatch(c.backDescription, this.regexp);
  }
}

class DateCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.date, this.regexp);
  }
}

class KeywordCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return listRegexMatch(c.keywords, this.regexp) || listRegexMatch(c.backKeywords, this.regexp);
  }
}

class HpCond {
  constructor(num, relationship) {
    this.num = num;
    this.relationship = relationship;
  }
  match(c) {
    return numberMatch(c.hp, this.num, this.relationship) || numberMatch(c.backHp, this.num, this.relationship);
  }
}

class CollectionLimitCond {
  constructor(num, relationship) {
    this.num = num;
    this.relationship = relationship;
  }
  match(c) {
    return numberMatch(c.collectionLimit, this.num, this.relationship);
  }
}

class NemesisIconCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return listRegexMatch(c.nemesisIcons, regexp) || listRegexMatch(c.backNemesisIcons, regexp);
  }
}

class InnatePowerNameCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.innatePowerName, this.regexp);
  }
}

class InnatePowerEffectCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.innatePowerEffect, this.regexp);
  }
}

class EventRuleTitleCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.eventRuleTitle, this.regexp);
  }
}

class EventRuleEffectCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.eventRuleEffect, this.regexp);
  }
}

class SetupCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.setup, this.regexp);
  }
}

class GameTextCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.gameText, this.regexp) || regexMatch(c.backGameText, this.regexp);
  }
}

class AdvancedGameTextCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.advancedGameText, this.regexp) || regexMatch(c.advancedGameText, this.regexp);
  }
}

class FeaturedIssueCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.featuredIssue, this.regexp);
  }
}

class FlavorTextCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.flavorText, this.regexp);
  }
}

class FlavorTextAttributionCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.flavorTextAttribution, this.regexp);
  }
}

class IncapCaptionCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.incapCaption, this.regexp);
  }
}

class IncapOptionCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return listRegexMatch(c.incapOptions, this.regexp);
  }
}

class IncapFeaturedIssueCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.incapFeaturedIssue, this.regexp);
  }
}

class CollectionFlavorTextCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.collectionFlavorText, this.regexp);
  }
}

class CollectionFeaturedIssueCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.collectionFeaturedIssue, this.regexp);
  }
}

class RewardTitleCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.rewardATitle, this.regexp) || regexMatch(c.rewardBTitle, this.regexp);
  }
}

class RewardFlavorTextCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.rewardAFlavorText, this.regexp) || regexMatch(c.rewardBFlavorText, this.regexp);
  }
}

class RewardGameTextCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.rewardAGameText, this.regexp) || regexMatch(c.rewardBGameText, this.regexp);
  }
}

class CollectionIssuesCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return listRegexMatch(c.collectionIssues, regexp);
  }
}

class QuantityCond {
  constructor(num, relationship) {
    this.num = num;
    this.relationship = relationship;
  }
  match(c) {
    return numberMatch(c.quantity, this.num, this.relationship);
  }
}

class SetCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.set, this.regexp);
  }
}

class ComplexityCond {
  constructor(num, relationship) {
    this.num = num;
    this.relationship = relationship;
  }
  match(c) {
    return numberMatch(c.complexity, this.num, this.relationship);
  }
}

class DifficultyCond {
  constructor(num, relationship) {
    this.num = num;
    this.relationship = relationship;
  }
  match(c) {
    return numberMatch(c.difficulty, this.num, this.relationship);
  }
}

class TypeCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.type, this.regexp);
  }
}

class KindCond {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(c) {
    return regexMatch(c.kind, this.regexp);
  }
}

class HasBackCond {
  constructor(flag) {
    this.flag = flag;
  }
  match(c) {
    return xnor(this.flag, c.hasBack);
  }
}

/**
 * Performs an expressive search by decomposing the provided query string into an ANDed set of query conditions.
 * @returns true if the search was successful. Returns false if any errors occurred parsing / resolving the query, or if the query doesn't use the expressive syntax. 
 */
function expressiveSearch(queryString) {
  // Searches without query parameters should be handled in the future, but for now we can just bail and let legacy search handle it. Do a quick check for that.
  if (!queryString.match(/[:=<>]/i)) {
    return false;
  }

  const conds = [];
  const s = new StringScanner(queryString);
  try {
    while (!s.hasTerminated()) {
      if (s.scan(/[\s,]+/i)) {
        // pass
      } else if (s.scan(/(?:deck)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new DeckNameCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:c|character)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new CharacterNameCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:t|title)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new TitleCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:v|variant)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new VariantCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:desc|description)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new DescriptionCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:date)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new DateCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:k|keyword)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new KeywordCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/hp\s*(>=|>|<=|<|=|:)\s*(\d+)/i)) {
        conds.push(new HpCond(s.getCapture(1), s.getCapture(0)))
      } else if (s.scan(/(?:l|limit|collectionLimit)\s*(>=|>|<=|<|=|:)\s*(\d+)/i)) {
        conds.push(new CollectionLimitCond(s.getCapture(1), s.getCapture(0)));
      } else if (s.scan(/(?:nemesisIcons)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new NemesisIconCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:innatePowerTitle)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new InnatePowerNameCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:innatePowerEffect)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new InnatePowerEffectCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:eventRuleTitle)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new EventRuleTitleCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:eventRuleEffect)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new EventRuleEffectCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:s|setup)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new SetupCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:g|gametext)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new GameTextCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:a|advanced)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new AdvancedGameTextCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:featuredIssue)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new FeaturedIssueCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:f|flavorText)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new FlavorTextCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:flavorTextAttribution)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new FlavorTextAttributionCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:incapCaption)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new IncapCaptionCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:incapFeaturedIssue)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new IncapFeaturedIssueCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:collectionFlavor|collectionFlavorText)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new CollectionFlavorTextCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:collectionFeaturedIssue)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new CollectionFeaturedIssueCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:rewardTitle)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new RewardTitleCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:rewardFlavor)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new RewardFlavorTextCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:rewardGameText)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new RewardGameTextCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(q|quantity)\s*(>=|>|<=|<|=|:)\s*(\d+)/i)) {
        conds.push(new QuantityCond(s.getCapture(1), s.getCapture(0)))
      } else if (s.scan(/(?:rewardGameText)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new SetCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(c|complexity)\s*(>=|>|<=|<|=|:)\s*(\d+)/i)) {
        conds.push(new ComplexityCond(s.getCapture(1), s.getCapture(0)));
      } else if (s.scan(/(difficulty)\s*(>=|>|<=|<|=|:)\s*(\d+)/i)) {
        conds.push(new DifficultyCond(s.getCapture(1), s.getCapture(0)));
      } else if (s.scan(/(?:t|type)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new TypeCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/(?:k|kind)\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new KindCond(new RegExp(s.getCapture(0) || s.getCapture(1), "i")));
      } else if (s.scan(/back\s*[:=]\s*(?:"(.*?)"|([^\s\)]+))/i)) {
        conds.push(new HasBackCond(parseBoolean(s.getCapture(0) || s.getCapture(1))));
      } else {
        throw new Error(`Couldn't identify query string: ${queryString}`);
      }
    }
    filterByExpressiveConditions(conds);
  } catch (e) {
    return false;
  }
  return true;
}

function filterByExpressiveConditions(conds) {
  for (let card of cards) {
    let matches = true;
    for (let cond of conds) {
      if (!cond.match(card)) {
        matches = false;
        break;
      }
    }
    matches ? $(`#${card.id}`).show() : $(`#${card.id}`).hide();
  }
}
