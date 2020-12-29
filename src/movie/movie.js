"use strict";

import $ from "jquery";
import "bootstrap";

import cardTemplate from "./movie-card.html";
import moreTemplate from "./movie-more.html";
import editTemplate from "./movie-edit.html";
import removeTemplate from "./movie-remove.html";

import { renderTemplate } from "../utils/template-utils";
import { getMovies, postMovie, putMovie, deleteMovie } from "../utils/api-utils";

export default class Movie {
   constructor(movie, objTemplate) { 

      this.id = movie.id;

      const { template, cbOnClick } = { ...objTemplate };

      this._element = renderTemplate(template, { ...movie });

      this._element.querySelectorAll("button").forEach((btn, idx) => {
         cbOnClick[idx] = btn.dataset.click || cbOnClick[idx];

         btn.addEventListener("click", async event => { 
            const cb = this[cbOnClick[idx]];

            if (typeof cb !== "function") return;
            await cb.bind(this)(event);
         })
      });
   };

   static get blankID() {

      return "195260df-34ae-4682-9a8e-14030cf3f929";
   };

   static get blank() {
      return {
         template: "<div></div>",
         cbOnClick: []
      };
   };

   static get card() {
      return {
         template: cardTemplate,
         cbOnClick: ["edit", "remove"]
      };
   };

   static get more() {
      return {
         template: moreTemplate,
         cbOnClick: ["like", "dislike"]
      };
   };

   get render() { 
      return this._element;
   };
   
   async edit(event) {
      console.log("EDIT MOVIE");

      const movies = await getMovies(this.id);
      movies.forEach(mv => {
         const header = mv.id !== Movie.blankID ? "Редагувати цей фільм" : "Додати новий фільм"; 

         new Modal({ ...mv, header }, Modal.edit, this.render);
      });
   };

   async remove(event) {
      console.log("DELETE MOVIE");
      
      const movies = await getMovies(this.id);
      movies.forEach(mv => new Modal(mv, Modal.remove, this.render));
   };

   async like(event) { 
      await this.rating(event.currentTarget, "like");
   };

   async dislike(event) { 
      await this.rating(event.currentTarget, "dislike");
   };

   async rating(target, vote) {
      let votedMovies = [];

      try { 
         votedMovies = JSON.parse(localStorage.getItem("voted"));
      } catch { 
         votedMovies = [];
      };

      votedMovies = Array.isArray(votedMovies) ? votedMovies : [];

      if (votedMovies.includes(this.id)) return;

      const movies = await getMovies(this.id);

      movies.forEach(async mv => {
         target.dataset.count = ++mv[vote];
         await putMovie(this.id, mv);
      });

      votedMovies.push(this.id);
      localStorage.setItem("voted", JSON.stringify(votedMovies));
   }
};

class Modal extends Movie {
   constructor(movie, objTemplate, parentElement) { 
      super(movie, objTemplate);

      const { header, ..._movie } = { ...movie };
      this._movie = _movie;
      this._parent = parentElement;

      $("body").append(this.render);

      $(this.render).on("shown.bs.modal", () => $(".close").trigger("focus"));

      $(this.render).on("hidden.bs.modal", event => event.currentTarget.remove());

      $(this.render).modal("show");
   };

   static get edit() {
      return {
         template: editTemplate,
         cbOnClick: ["", "addPosition"]
      };
   };

   static get remove() {
      return {
         template: removeTemplate,
         cbOnClick: []
      };
   };

   addPosition(event) {
      const detailed = this.render.querySelector("[data-id='detailed']");

      const newPosition = detailed.lastElementChild.cloneNode(true);

      newPosition.querySelectorAll("input").forEach(elem => elem.value = "");

      newPosition
         .querySelector("button")
         .addEventListener("click", event => this.delPosition(event));

      detailed.appendChild(newPosition);
   };

   delPosition(event) {
      const position = event.path
         .find(elem => elem.dataset && elem.dataset.id === "others" && elem.nextElementSibling);

      if (position instanceof HTMLElement) {
         position.remove();
      }
   };

   static isElementForSave(elem) {
      const elementForSave = [HTMLInputElement, HTMLTextAreaElement];

      return elementForSave.find(html => elem instanceof html);
   };

   async editSubmit(event) {
      const mvEdited = Array.from(event.currentTarget.form)
         .filter(elem => Modal.isElementForSave(elem))
         .reduce((result, elem, idx, arr) => {
            if (elem.name === "" || elem.value === "") return result;

            if (elem.name === "others") {
               result[elem.name][elem.value] = result[elem.name][elem.value] || [];
               arr[idx + 1].name = elem.value;

               return result;
            };

            const obj = (elem.name in result.others) ? result.others : result;
            obj[elem.name] = obj[elem.name] || [];
            obj[elem.name] = Array.isArray(obj[elem.name]) ? obj[elem.name] : [obj[elem.name]];
            obj[elem.name] = (elem.name === "cast") ? elem.value.split(", ") : [...obj[elem.name], elem.value];

            return result;
         }, { others: {} });

      const resultMovie = { ...this._movie, ...mvEdited };

      if (!resultMovie.title.length) return;

      if (this.id === Movie.blankID) {
         await postMovie(resultMovie);
         return;
      };

      await putMovie(this.id, resultMovie);
      this._parent.replaceWith((new Movie(resultMovie, Movie.card)).render);
   };

   async removeSubmit(event) {
      await deleteMovie(this.id);
      this._parent.remove();
   };
}