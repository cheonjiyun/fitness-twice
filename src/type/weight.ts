export type WeightType = "MORNING" | "NIGHT";

export interface Weights {
    id: string;
    date: string;
    type: WeightType;
    weight: number;
}
