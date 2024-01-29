import { RequestWithFiles } from "#/middleware/fileParser";
import { categoriesTypes } from "#/utils/audio_category";
import { RequestHandler } from "express";
import formidable from "formidable";
import cloudinary from "#/cloud";
import Audio from "#/models/audio";

interface CreateAudioRequest extends RequestWithFiles {
  body: {
    title: string;
    about: string;
    category: categoriesTypes;
  };
}

export const createAudio: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  // destructure first and get resource
  const { title, about, category } = req.body;
  const poster = req.files?.poster as formidable.File;
  const audioFile = req.files?.file as formidable.File;
  const ownerId = req.user.id;

  // No file then send it back
  if (!audioFile) res.status(422).json({ error: "Audio file is missing!" });

  // Found -- then upload the audio
  const audioRes = await cloudinary.uploader.upload(audioFile.filepath, {
    // defining file type
    resource_type: "video",
  });

  // creating audio with all the available data
  const newAudio = new Audio({
    title,
    about,
    category,
    owner: ownerId,
    file: { url: audioRes.url, publicId: audioRes.public_id },
  });

  // As poster is optional field, hence handling seprately
  // If it is there, then same -- upload it and update newAudio poster property
  if (poster) {
    const posterRes = await cloudinary.uploader.upload(poster.filepath, {
      width: 300,
      height: 300,
      crop: "thumb",
      gravity: "face",
    });

    newAudio.poster = {
      url: posterRes.secure_url,
      publicId: posterRes.public_id,
    };
  }

  // saving newAudio in MongoDB
  await newAudio.save();
  res.status(201).json({
    audio: {
      title,
      about,
      file: newAudio.file.url,
      poster: newAudio.poster?.url,
    },
  });
};

export const updateAudio: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  // destructure first and get resource
  const { title, about, category } = req.body;
  const poster = req.files?.poster as formidable.File;
  const ownerId = req.user.id;
  const { audioId } = req.params; // used to fetch information from url

  // '/audio/:audioId' ( request type is going to contain audioID)
  // As we are here to update Audio, we need to first find that

  const audio = await Audio.findOneAndUpdate(
    // parameters on the basis of which it will find
    { owner: ownerId, _id: audioId }, 
    // parameters which needs to  be updated 
    { title,about, category },
    // returning new updated version
    { new: true } 
  );

  if (!audio) return res.status(404).json({ error: "record not found!" });

  // Whenever we want to update image/poster type resources we need to first remove it, then upload it
  if (poster) {
    // If already -- then remove it
    if (audio.poster?.publicId) {
      await cloudinary.uploader.destroy(audio.poster?.publicId);
    }

    // same as before -- uploading and adding it to audio
    const posterRes = await cloudinary.uploader.upload(poster.filepath, {
      width: 300,
      height: 300,
      crop: "thumb",
      gravity: "face",
    });

    // updating
    audio.poster = {
      url: posterRes.secure_url,
      publicId: posterRes.public_id,
    };
    await audio.save();
  }

  // saving newAudio in MongoDB
  res.status(201).json({
    audio: {
      title,
      about,
      file: audio.file.url,
      poster: audio.poster?.url,
    },
  });
};
