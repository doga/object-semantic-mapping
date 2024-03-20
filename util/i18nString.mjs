// A class for representing RDF strings.

import { rdf, xsd } from "../defs.mjs";
import { Language } from "./language.mjs";

class I18nString {
  /** 
  * @param {{datatype?:{value:string},value?:string,language?:string}} rdfString
  * @returns {(I18nString|null)}
  * */
  static fromRdf(rdfString) {
    if (!(rdfString.datatype && [`${rdf}langString`, `${xsd}string`].includes(rdfString.datatype.value))) return null;
    const lang = rdfString.language.length > 0 ? Language.fromCode(rdfString.language) : null;
    return new I18nString(rdfString.value, lang);
  }
  

  /**
   * @type {string}
   * */ 
  #value;

  /**
   * @type {(Language|null)}
   * */ 
  #lang;

  /** 
  * @param {string} value
  * @param {(Language|string|null|undefined)} lang
  * */
  constructor(value, lang) {
    if (!(typeof value === 'string')) {
      throw new TypeError('Bad I18nString value');
    }
    if (typeof lang === 'string') {
      lang = Language.fromCode(lang);
    }
    if (lang && !(lang instanceof Language))
      throw new TypeError('Bad I18nString language');
    if (!lang) lang = null;
    this.#value = value;
    this.#lang = lang;
  }

  get value() { return this.#value; }
  get lang() { return this.#lang; }
  toString() { return this.#value; }
}

export { I18nString };
