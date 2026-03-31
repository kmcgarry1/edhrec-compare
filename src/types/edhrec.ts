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

export type EdhrecCommanderCard = {
  name?: string;
  sanitized?: string;
  color_identity?: string[];
};

export type EdhrecCardlist = {
  header: string;
  cardviews: EdhrecCardview[];
};

export type EdhrecData = {
  header?: string;
  container?: {
    json_dict?: {
      card?: EdhrecCommanderCard;
      cardlists?: EdhrecCardlist[];
    };
  };
};

export type CardlistSectionMeta = {
  id: string;
  label: string;
  iconPath?: string;
  iconColor?: string;
  tone?: "default" | "accent" | "success" | "warn" | "danger" | "muted";
  summary?: string;
  isPopulated: boolean;
  defaultExpanded: boolean;
  expanded: boolean;
  summaryCounts: {
    totalCards: number;
    ownedCount: number;
    unownedCount: number;
    ownedPercent: number;
  };
};
