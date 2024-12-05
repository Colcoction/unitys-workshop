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
  if (relationship === "=") {
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
    return xnor(flag, c.hasBack);
  }
}

export {
  DeckNameCond,
  CharacterNameCond,
  TitleCond,
  VariantCond,
  DescriptionCond,
  DateCond,
  KeywordCond,
  HpCond,
  CollectionLimitCond,
  NemesisIconCond,
  InnatePowerNameCond,
  InnatePowerEffectCond,
  EventRuleTitleCond,
  SetupCond,
  GameTextCond,
  AdvancedGameTextCond,
  FeaturedIssueCond,
  FlavorTextCond,
  FlavorTextAttributionCond,
  IncapCaptionCond,
  IncapFeaturedIssueCond,
  CollectionFeaturedIssueCond,
  RewardTitleCond,
  RewardFlavorTextCond,
  CollectionIssuesCond,
  QuantityCond,
  SetCond,
  ComplexityCond,
  DifficultyCond,
  TypeCond,
  KindCond,
  HasBackCond
}
