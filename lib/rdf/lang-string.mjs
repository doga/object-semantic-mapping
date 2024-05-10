import { Language } from '../../deps.mjs';

class LangString {
  #language;
  #value;

  /** 
   * Each dataset must conform to the DatasetCore interface.
   * 
   * @param {URL|UniformResourceName} id - Identifies a named node.
   * @param {({
  *   types:    (URL|UniformResourceName|URL[]|UniformResourceName[]|Set.<URL>|Set.<UniformResourceName>|null|undefined)
  *   datasets: {(object|object[]|Set.<object>|null|undefined)}
  * }|null|undefined)} info - Each dataset must conform to the DatasetCore interface. If `types` is not specified, then it is `http://www.w3.org/2000/01/rdf-schema#Resource`.
  * @throws {(TypeError|Error)}
  * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
  * @see {@link https://www.w3.org/TR/rdf11-schema/#ch_resource}
  **/
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
