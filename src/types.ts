export type Transaction = {
  id: string;
  amt: number;
  note: string;
  date: number;
};

export type Wallet = {
  id: string;
  name: string;
  budget: number;
  color: string;
  tx: Transaction[];
};

export type AppState = {
  month: string;
  cats: Wallet[];
};

export type WalletDraft = {
  name: string;
  budget: number;
  color: string;
};
