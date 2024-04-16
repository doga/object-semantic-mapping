import { Language } from '../../deps.mjs';

class LangString {
  #lang;
  #str;

  constructor(str, lang){
    if(typeof str !== 'string')throw new TypeError('Not a string');
    if(typeof lang !== 'string')throw new TypeError('Not a lang string');
    if(!Language.fromCode(lang.split('-')[0]))throw new TypeError('Not a lang');

    this.#str  = str;
    this.#lang = lang;
  }

  get lang(){return this.#lang;}
  get str(){return this.#str;}
  toString(){return `"${this.str}"@${this.lang}`;}
  
}

export { LangString };
