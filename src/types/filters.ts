export interface Filters {
  zipCodes: string[];
  roomTypes: string[];
  propertyTypes: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minAccommodates: number | null;
  maxAccommodates: number | null;
  minBedrooms: number | null;
  maxBedrooms: number | null;
  minReviewScore: number | null;
  maxReviewScore: number | null;
  hostIsSuperhost: boolean;
  instantBookable: boolean;
}

export interface FilterOptions {
  zipCodes: string[];
  roomTypes: string[];
  propertyTypes: string[];
  minPrice: number;
  maxPrice: number;
  minAccommodates: number;
  maxAccommodates: number;
  minBedrooms: number;
  maxBedrooms: number;
  minReviewScore: number;
  maxReviewScore: number;
  zipAveragePrices: Record<string, number>;
  priceVolumes: number[];
  accommodatesVolumes: number[];
  bedroomsVolumes: number[];
  reviewScoreVolumes: number[];
}