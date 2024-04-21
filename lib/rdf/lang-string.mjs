import { Language } from '../../deps.mjs';

class LangString {
  #language;
  #value;

  constructor(value, language){
    if(typeof value !== 'string')throw new TypeError('Not a string');
    if(typeof language !== 'string')throw new TypeError('Not a lang string');
    if(!Language.fromCode(language.split('-')[0]))throw new TypeError('Not a lang');

    this.#value  = value;
    this.#language = language;
  }

  get language(){return this.#language;}
  get value(){return this.#value;}
  toString(){return `"${this.value}"@${this.language}`;}
  
}

export { LangString };
