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
  /** Epoch ms of the last manual "Mark withdrawn". 0 = never settled. */
  settledAt: number;
};

export type AppState = {
  month: string;
  cats: Wallet[];
  /** Day the budget week starts on. 0 = Sunday … 6 = Saturday. */
  weekStart: number;
};

export type WalletDraft = {
  name: string;
  budget: number;
  color: string;
};
