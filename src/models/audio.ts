import { categories, categoriesTypes } from "#/utils/audio_category";

import { Model, models, ObjectId, Schema, model } from "mongoose";


export interface AudioDocument<T = ObjectId>{
  _id: ObjectId;
  title: string;
  about: string;
  owner: T;
  file:{
    url: string;
    publicId: string;
  }
  poster?:{
    url: string;
    publicId: string;
  }
  likes: ObjectId[];
  category:categoriesTypes;
  createdAt: Date;
}

const AudioSchema = new Schema<AudioDocument>({
  title:{
    type: String,
    require: true
  },
  owner:{
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  about:{
    type: String,
    require: true
  },
  file:{
    type: Object,
    url: String,
    publicId: String,
    required: true
  },
  poster:{
    type: Object,
    url: String,
    publicId: String
  },
  likes:[{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  category: {
    type: String,
    enum: categories,
    default: 'Others'
  }
},{timestamps: true})

const Audio = models.Audio || model("Audio", AudioSchema);
export default Audio as Model<AudioDocument>;
   
// model("Audio", AudioSchema) as Model<AudioDocument>