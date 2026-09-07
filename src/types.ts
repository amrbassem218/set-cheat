export type BadgePosition = "left" | "right";

export type Settings = {
  badgePosition: BadgePosition;
};

export type OpenOptionsMessage = {
  type: "open-options";
};

export type Card = {
  index: number;
  number: number;
  shape: number;
  color: number;
  fill: number;
};
