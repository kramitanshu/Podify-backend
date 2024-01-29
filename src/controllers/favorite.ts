import { PopulateFavList } from "#/@types/audio";
import Audio, { AudioDocument } from "#/models/audio";
import Favorite from "#/models/favorite";
import { RequestHandler } from "express-serve-static-core";
import { ObjectId, isValidObjectId } from "mongoose";

export const toggleFavorite: RequestHandler = async (req, res) => {

  // we want audio Id and we will get that from query
  const audioId = req.query.audioId as string;
  let status : "added" | "removed"

  // once we get that, we are validating it validity
  if (!isValidObjectId(audioId))
    return res.status(422).json({ error: "Audio id is invalid!" });

  // finding that audio in our DB
  const audio = await Audio.findById(audioId);
  if (!audio) return res.status(404).json({ error: "Resources not found" });

  // Audio -- find

  // audio is already in fav
  // checking if that audio is already in favorite list of user 
  const alreadyExists = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  // If it is in user list
  if (alreadyExists) {
    // we want to remove from old lists
    await Favorite.updateOne(
      { owner: req.user.id },
      {
        $pull: { items: audioId }, // operator -- passing query
      }
    );
    status = "removed";
  } else { // didn't found in 
    // checking weather favorite list exits for user or not
    const favorite = await Favorite.findOne({ owner: req.user.id });
    if (favorite) {
      // trying to add new audio to the old list
      await Favorite.updateOne(
        { owner: req.user.id },
        {
          $addToSet: { items: audioId }, // operator -- query
        }
      );
    } else {
      // trying to create fresh fav list
      // Hence creating favorite list
      await Favorite.create({ owner: req.user.id, items: [audioId] });
    }
    status = "added";
  }

  if(status === 'added'){
    await Audio.findByIdAndUpdate(audioId, {
      $addToSet: {likes: req.user.id}
    })
  }
  if(status === 'removed'){
    await Audio.findByIdAndUpdate(audioId, {
      $pull: {likes: req.user.id}
    })
  }
   
  res.json({status});
};

export const getFavorites : RequestHandler = async (req, res) => {
  const userID = req.user.id;

  const favorite = await Favorite.findOne({owner: userID}).populate<{items:PopulateFavList[]}>({
    path: "items",
    populate: {
      path: "owner",
    }
  });


  if(!favorite) return res.json({audios: []});

  const audios = favorite.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      category: item.category,
      file: item.file.url,
      poster: item.poster?.url,
      owner: {name: item.owner.name, id: item.owner._id }
    }
  })

  res.json({audios});
};

export const getIsFavorites : RequestHandler = async (req, res) => {
  const audioId = req.query.audioId as string;
  if(!isValidObjectId(audioId)) return res.status(422).json({error: "Invalid audio id!"});


  const favorite = await Favorite.findOne({owner: req.user.id, items: audioId});
  
  res.json({result: favorite ? true: false});
};


