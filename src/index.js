"use strict";

import './style.css';

// import $ from "jquery";
// import "bootstrap";
import queryString from "query-string";

import Root from './root/root';
import Movie from './movie/movie';

import { getMovies } from './utils/api-utils';
import { getHistory } from './utils/app-history';

function main() {
   
   const links = Object.freeze({
      "root": "/",
      "movies": "/movies"
   });

   async function renderRoute(locationRoute, wrapper) {
      const path = locationRoute.pathname;
      let render = [];
      wrapper.innerHTML = "";

      switch (path) {
         case links.root:

            render = [(new Root).render];

            break;
         case links.movies:
            const hash = locationRoute.hash.slice(1);

            const id = hash !== "search" ? hash : "";
            const templ = id ? Movie.more : Movie.card;

            const search = queryString.parse(locationRoute.search);
            const title = new RegExp(search.title, "i");

            const input = document.querySelector("#search input");
            input.value = hash === "search" ? input.value : "";

            const movies = await getMovies(id);

            render = movies
               .filter(mv => {
                  if (mv.id === Movie.blankID) return false;
                  if (hash !== "search") return true;
                  return title.test(mv.title.join(""));
               })
               .map(mv => (new Movie(mv, templ)).render);
            
            break;
         case links.search:
            render = [];

            break;
         default:

            const err = document.createElement("h1");
            err.innerText = "404";
            render = [err];
      };

      render.forEach( element => wrapper.appendChild(element) );
   };

   const wrapper = document.querySelector("#content");
   if (wrapper === null) return null;

   window.addEventListener("load", event => {
      event.preventDefault();
      
      const url = new URL(event.target.URL);

      const search = queryString.parse(url.search);
      const input = document.querySelector("#search input");
      input.value = url.hash === "#search" ? search.title : "";

      renderRoute(url, wrapper);
   });

   const history = getHistory();
   history.listen(listener => renderRoute(listener.location, wrapper));
   
   document.addEventListener("click", async event => {
      event.preventDefault();

      const href = event.target.href;
      if (!href) return;

      history.push({ pathname: href, search: "", hash: "" });
   });

   const buttonAddNew = document.querySelector("#add-new");
   if (buttonAddNew) {
      buttonAddNew.addEventListener("click", async event => { 
         const newMovie = new Movie({ id: Movie.blankID }, Movie.blank);
         await newMovie.edit();

         const submitButton = document.querySelector(".modal [type='submit']");
         if (!submitButton) return;
         submitButton.addEventListener("click", event => history.push({
            pathname: links.movies, search: "", hash: ""
         }));
      });
   };
   
   const buttonSearch = document.querySelector(".search");
   if (buttonSearch) { 
      buttonSearch.addEventListener("click", async event => { 
         const search = { title: event.currentTarget.previousElementSibling.value };

         history.push({ pathname: links.movies, search: "?"+queryString.stringify(search), hash: "#search" });
      });
   };

   wrapper.innerHTML = "";
   wrapper.appendChild((new Root).render);
}

main();