const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const AnitilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB.error ${error.message}`);

    process.exit(1);
  }
};

AnitilizeDbAndServer();

app.get("/movies/", async (request, response) => {
  const getAllMovies = `
    SELECT
    *
    FROM
    movie
    ORDER BY
    movie_id;`;
  const movieTable = await db.all(getAllMovies);
  response.send(
    movieTable.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieDetails = `
    INSERT INTO
    movie(director_id, movie_name, lead_actor)
    VALUES
    (${directorId},
    '${movieName}',
    '${leadActor}');`;
  const addMovieD = await db.run(addMovieDetails);
  const movieId = addMovieD.lastId;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getAllMovies = `

    SELECT
        *
    FROM
    movie
    WHERE movie_id = ${movieId};`;
  const movieTable = await db.get(getAllMovies);
  response.send(
    movieTable.map((eachMovie) => ({
      movieId: eachMovie.movie_id,
      directorId: eachMovie.director_id,
      movieName: eachMovie.movie_name,
      leadActor: eachMovie.lead_actor,
    }))
  );
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetails = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};`;
  await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetails = `
    DELETE FROM
    movie
    WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieDetails);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
    SELECT
    *
    FROM
    director
    ORDER BY  director_id;`;
  const directorTable = await db.all(getAllDirectors);
  response.send(
    directorTable.map((eachDirector) => ({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    }))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  // Destructuring the directorId from the request parameters
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie 
    WHERE
      director_id='${directorId}';`;
  // The above SQL query will give all the movies with director_id matched

  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
  // converting the case of the response from snake_case to camelCase
});
module.exports = app;
