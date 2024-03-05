import express from "express";
import 'dotenv/config';
import './db';

import authRouter from './routes/auth';
import audioRouter from './routes/audio';
import favoriteRouter from './routes/favorite';
import playlistRouter from './routes/playlist';
import profileRouter from './routes/profile';
import historyRouter from './routes/history';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('src/public')); 

app.use('/auth', authRouter);
app.use('/audio', audioRouter);
app.use('/favorite', favoriteRouter);
app.use('/playlist', playlistRouter);
app.use('/profile', profileRouter);
app.use('/history', historyRouter);

const PORT = process.env.PORT || 8989;
app.listen(PORT, () => {
	console.log(`Port is listening at ${PORT}`);
})













































// Authentication

//  The Plan and Features

/*

-- upload audio files
-- listen to single audio
-- add to favorites
-- create playlist
-- remove playlist (public - private)
-- remove audios
-- many more ( like follow author)

*/

// dotenv is used to store sensitive information