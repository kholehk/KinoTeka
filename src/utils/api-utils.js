"use strict";

import axios from 'axios';

const urlAPI = new URL("/movies", "https://kinoteka.herokuapp.com");

async function getMovies(id) {
   const url = new URL(`${id}`, urlAPI);
   
   try {
      const response = await axios.get(url);
      return response.data;
   } catch (error) {
      console.error(error);
      return [];
   }
};

async function postMovie(mv) {
   const url = new URL(urlAPI);

   try {
      await axios.post(url, mv);
   } catch (error) {
      console.error(error);
   }
};

async function putMovie(id, mv) {
   const url = new URL(`${id}`, urlAPI);

   try {
      await axios.put(url, mv);
   } catch (error) {
      console.error(error);
   }
};

async function deleteMovie(id) { 
   const url = new URL(`${id}`, urlAPI);

   try {
      await axios.delete(url);
   } catch (error) {
      console.error(error);
   }
};

export { getMovies, postMovie, putMovie, deleteMovie };
