import { Document } from 'mongoose';

export interface IUser extends Document {
  id: number;
  ip: string;
  chatId: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  game_url: string;
  games: number;
  wins: number;
  lose: number;
  balance: number;
  wallet: string;
  wallet_key: string;
  wallet_mnemonic: string;
  isAdmin: boolean;
  password: string;
}