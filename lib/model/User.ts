import { IUser } from '../interface/User.interface';
import mongoose, { Schema } from 'mongoose';

const UserModel: Schema = new Schema({
  id: { type: Number, required: true },
  ip: { type: String },
  chatId: { type: Number, required: true },
  first_name: { type: String },
  last_name: { type: String },
  username: { type: String },
  isAdmin: { type: Boolean, default: false },
  password: { type: String },
  language_code: { type: String },
  game_url: { type: String },
  games: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  lose: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  wallet: { type: String },
  wallet_key: { type: String },
  wallet_mnemonic: { type: String },
}, { versionKey: false, timestamps: true });

const User = mongoose.model<IUser>('User', UserModel);

export default User;
