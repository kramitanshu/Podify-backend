import { paginationQuery } from "#/@types/misc";
import History, { historyType } from "#/models/history";
import { RequestHandler } from "express";

export const updateHistory: RequestHandler = async (req, res) => {
  // Agregation in MongoDB is a framework that enables you to process and transform documents from a collection in a variety of ways.
  // Aggregation pipelines

  const oldHistory = await History.findOne({ owner: req.user.id });

  const { audio, progress, date } = req.body;
  const history: historyType = { audio, progress, date };

  if (!oldHistory) {
    await History.create({
      owner: req.user.id,
      last: history,
      all: [history],
    });
    return res.json({ success: true });
  }

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },
    { $unwind: "$all" },
    {
      $match: {
        "all.date": {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      },
    },
    {
      $project: {
        _id: 0,
        audio: "$all.audio",
      },
    },
  ]);

  const sameDayHistory = histories.find((item) => {
    if (item.audio.toString() === audio) return item;
  });

  if (sameDayHistory) {
    await History.findOneAndUpdate(
      {
        owner: req.user.id,
        "all.audio": audio,
      },
      {
        $set: {
          "all.$.progress": progress,
          "all.$.date": date,
        },
      }
    );
  } else {
    await History.findByIdAndUpdate(oldHistory._id, {
      $push: { all: { $each: [history], $position: 0 } },
      $set: { last: history },
    });
  }

  res.json({ success: true });
};

export const removeHistory: RequestHandler = async (req, res) => {
  // '/history?histories=["32hgkk34", "56jahigk43"]&all=yes'

  const removeAll = req.query.all === "yes";
  if (removeAll) {
    // remove all history
    await History.findOneAndDelete({ owner: req.user.id });
    return res.json({ success: true });
  }

  const histories = req.query.histories as string;
  const ids = JSON.parse(histories) as string[];

  await History.findOneAndUpdate(
    { owner: req.user.id },
    {
      $pull: { all: { _id: ids } },
    }
  );

  return res.json({ success: true });
};

export const getHistory: RequestHandler = async (req, res) => {
  const { limit = "20", pageNo = "0" } = req.query as paginationQuery;
  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },
    {
      $project: {
        all: {
          $slice: ["$all", parseInt(limit) * parseInt(pageNo), parseInt(limit)],
        },
      },
    },
    { $unwind: "$all" },
    {
      $lookup: {
        from: "audios", // look in this datatable
        localField: "all.audio", // information on which basis you have to search
        foreignField: "_id", // where to match in that datatable
        as: "audioInfo", // name with which, you need to display
      },
    },
    {
      $unwind: "$audioInfo",
    },
    {
      $project: {
        _id: 0,
        id: "$all._id", // history Id
        audioId: "$audioInfo._id", // audio Id
        date: "$all.date",
        title: "$audioInfo.title",
      },
    },
    {
      $group: {
        _id: {
          //
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        audios: { $push: "$$ROOT" }, // push rest all stuff
      },
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        date: "$_id",
        audios: "$$ROOT.audios",
      },
    },
    {
      $sort: { date: -1 },
    },
  ]);

  res.json({ histories });
};

export const getRecentlyPlayed: RequestHandler = async (req, res) => {
  const match = { $match: { owner: req.user.id } };
  const sliceMatch = {
    $project: {
      myHistory: { $slice: ["$all", 10] },
    },
  };

  const dateSort = {
    $project: {
      histories: {
        $sortArray: {
          input: "$myHistory",
          sortBy: { date: -1 },
        },
      },
    },
  };
  const unwindWithIndex = {
    $unwind: {
      path: "$histories",
      includeArrayIndex: "index",
    },
  };
  const audioLookup = {
    $lookup: {
      from: "audios",
      localField: "histories.audio",
      foreignField: "_id",
      as: "audioInfo",
    },
  };
  const unwindAudioInfo = {
    $unwind: "$audioInfo",
  };
  const userLookup = {
    $lookup: {
      from: "users",
      localField: "audioInfo.owner",
      foreignField: "_id",
      as: "owner",
    },
  };
  const unwindUser = {
    $unwind: "$owner",
  };
  const projectResult = {
    $project: {
      _id: 0,
      id: "$audioInfo._id",
      title: "$audioInfo.title",
      about: "$audioInfo.about",
      poster: "$audioInfo.file.url",
      file: "$audioInfo.poster.url",
      category: "$audioInfo.category.url",
      owner: { name: "$owner.name", id: "$owner._id" },
      date: "$histories.date",
      progress: "$histories.progress",
      index: "$index",
    },
  };

  const audios = await History.aggregate([
    match,
    sliceMatch,
    dateSort,
    unwindWithIndex, // use to prevent sorting
    audioLookup,
    unwindAudioInfo,
    userLookup,
    unwindUser,
    projectResult,
  ]);

  res.json({ audios });
};
