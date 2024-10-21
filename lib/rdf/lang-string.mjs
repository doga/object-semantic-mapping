import { Language } from '../../deps.mjs';

/**
 * Represents an RDF literal that is a language-tagged string.
 * @see {@link https://www.w3.org/TR/rdf11-schema/#ch_langstring|rdf:langString}
 */
class LangString {
  #language;
  #value;
  
  /**
   * Create a language-tagged string.
   * @param {string} value A string
   * @param {string} language A language identifier, such as 'en'
   * @see {@link https://www.w3.org/TR/rdf11-schema/#ch_langstring|rdf:langString}
   * @see {@link https://en.wikipedia.org/wiki/IETF_language_tag|IETF language tag}
   */
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
