import mongoose, { Schema, model, models } from 'mongoose';

const TeamSchema = new Schema({
  name: { type: String, required: true },
  teamCode: { type: String, required: true, unique: true },
  eventName: { type: String, required: true, default: 'PitchGenix' },
  leader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Force re-compile
if (mongoose.models.Team) {
  delete mongoose.models.Team;
}

const Team = models.Team || model('Team', TeamSchema);
export default Team;
