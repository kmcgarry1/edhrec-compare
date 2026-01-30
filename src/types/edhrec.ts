export type CommanderSelection = {
  primary: string;
  partner: string;
  hasPartner: boolean;
};

export type DecklistSection = {
  id: string;
  label: string;
  text: string;
};

export type DecklistPayload = {
  text: string;
  filterLabel: string;
  sections: DecklistSection[];
};
