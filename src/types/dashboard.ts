export type DashboardTab = "search" | "collection" | "export";

export type OwnedFilterValue = boolean | null;

export type OwnedFilterOption = {
  label: string;
  value: OwnedFilterValue;
  active: boolean;
};

export type TabOption = {
  id: DashboardTab;
  label: string;
};
