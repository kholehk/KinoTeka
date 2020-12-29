"use strict";

import rootTemplate from "./root.html";
import { renderTemplate } from "../utils/template-utils";

export default class Root { 
   constructor() {

      this._element = renderTemplate(rootTemplate);
      
   }

   get render() {
   
      return this._element;
   };

}