/* Organizations the Bertie Foundation has worked with, June 2023 to March 2025.
 * Built from the foundation’s History and Videos pages. Newest first.
 * To add a partner: add a line here. "video" is the YouTube video ID of its latest event, or null. */
export interface TickerPartner { id: string; name: string; events: number; latest: string; video: string | null; }

export const TICKER_PARTNERS: TickerPartner[] = [
  { id: "take-care-kids", name: "Take Care Kids Foundation", events: 3, latest: "2025-03", video: "XohHEfowLYs" },
  { id: "atcc", name: "Anti Human Trafficking and Child Abuse Centre (ATCC)", events: 2, latest: "2025-02", video: "FbnaBUAUXbQ" },
  { id: "hhn", name: "Human Help Network Foundation", events: 2, latest: "2025-01", video: "fS5U73D7yQ8" },
  { id: "fol-women", name: "Fountain of Life Women's Center", events: 2, latest: "2024-12", video: "mU1e9QCyomI" },
  { id: "fol-children", name: "Fountain of Life Children's Center", events: 2, latest: "2024-12", video: "mU1e9QCyomI" },
  { id: "redemptorist-disabilities", name: "Redemptorist Foundation for People with Disabilities", events: 2, latest: "2024-12", video: "mU1e9QCyomI" },
  { id: "redemptorist-school", name: "Redemptorist School", events: 1, latest: "2024-12", video: "UGX0j8FGYqA" },
  { id: "glory-hut", name: "Glory Hut", events: 1, latest: "2024-12", video: "mU1e9QCyomI" },
  { id: "hand-to-hand", name: "Hand to Hand Foundation", events: 3, latest: "2024-11", video: "aPMSPyz3fbU" },
  { id: "bl-hospital", name: "Bang Lamung Hospital", events: 2, latest: "2024-10", video: "kDvTm_6miCo" },
  { id: "5812", name: "58:12 Global", events: 1, latest: "2024-10", video: "5hQbCBUD83U" },
  { id: "baan-jing-jai", name: "Baan Jing Jai", events: 1, latest: "2024-09", video: "tow_Bj-Ay_Y" },
  { id: "bl-elderly", name: "Bang Lamung Social Welfare Center for Elderly Persons", events: 2, latest: "2024-07", video: "5Yp6DV0_3pM" },
  { id: "cpdc", name: "Child Protection and Development Center (CPDC)", events: 2, latest: "2024-06", video: "tzC1PXNXcFk" },
  { id: "father-ray", name: "Father Ray's Children's Village", events: 1, latest: "2024-06", video: "tzC1PXNXcFk" },
  { id: "boys-home", name: "Bang Lamung Home for Boys", events: 1, latest: "2024-04", video: "S_ycApO7ljU" },
  { id: "karunyawet", name: "Karunyawet Home for Persons with Disabilities", events: 1, latest: "2024-03", video: "-41-PifqgA0" },
  { id: "hope-for-strays", name: "Hope for Strays", events: 1, latest: "2023-08", video: null },
  { id: "pattaya-orphanage", name: "Pattaya Orphanage", events: 1, latest: "2023-06", video: null },
];
