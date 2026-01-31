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

export type EdhrecCardview = {
  id: string;
  name: string;
};

export type EdhrecCardlist = {
  header: string;
  cardviews: EdhrecCardview[];
};

export type EdhrecData = {
  container?: {
    json_dict?: {
      cardlists?: EdhrecCardlist[];
    };
  };
};

export type CardlistSectionMeta = {
  id: string;
  label: string;
  iconPath?: string;
  iconColor?: string;
};
