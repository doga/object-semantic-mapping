import { 
  IRI, UniformResourceName,
  dataFactory as df,
} from '../../deps.mjs';
import { LangString } from '../rdf/lang-string.mjs';
import { Model } from '../model.mjs';
import { prefixes } from '../rdf/prefixes.mjs';

const { rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc, } = prefixes;


class Person extends Model {
  /** @type {Array.<URL|UniformResourceName>} */
  static types = [`${foaf}Person`, `${schema}Person`, `${cwrc}NaturalPerson`, `${prov}Agent`].map(t => IRI.parse(t));

  /** 
   * Reads persons from datasets that conform to the DatasetCore interface.
   * @param {(object|object[]|Set.<object>)} datasets
   * @param {({
   *   count:      (number|null|undefined)
   * }|null|undefined)} config
   * @returns {Promise.<Model[]>} 
   * @async
   * @static
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface|DatasetCore interface, RDF/JS: Dataset specification 1.0}
   * @see {@link https://github.com/doga/IRI}
   **/
  static async readFrom(datasets, config) {    // console.debug(`Person.read`);
    try {
      const {dataSets, count} = Model._normaliseReadArgs(datasets, config);
      return await Model.readFrom(dataSets, {types: Person.types, modelClass: Person, count});
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // In-object data
  /** 
   * @type {Set.<LangString|string>} 
   **/
  #names;

  /** 
   * @type {Set.<LangString>} 
   **/
  #oneLineBios;

  /** 
   * @type {Set.<string>} 
   **/
  #emails;

  /** 
   * Each dataset must conform to the DatasetCore interface.
   * 
   * @param {URL|UniformResourceName} id - Identifies a named node.
   * @param {({
   *   datasets: {(object|object[]|Set.<object>|null|undefined)}
   * }|null|undefined)} info - Each dataset must conform to the DatasetCore interface. If `types` is not specified, then it is `http://www.w3.org/2000/01/rdf-schema#Resource`.
   * @throws {(TypeError|Error)}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface|DatasetCore interface, RDF/JS: Dataset specification 1.0}
   * @see {@link https://www.w3.org/TR/rdf11-schema/#ch_resource|rdfs:Resource, RDF Schema 1.1}
   **/
  constructor(id, info) {
    super(id, {types: Person.types, datasets: info?.datasets});
    this.#names       = new Set();
    this.#oneLineBios = new Set();
    this.#emails      = new Set();
  }

  /** 
   * Returns the in-object data.
   * @return {Set.<LangString|string>} 
   **/
  get names() { return this.#names; }

  /** 
   * Returns the in-object data.
   * @return {Set.<LangString>} 
   **/
  get oneLineBios() { return this.#oneLineBios; }

  /** 
   * Returns the in-object data.
   * @return {Set.<string>} 
   **/
  get emails() { return this.#emails; }

  /** 
   * Does a real-time search in datasets.
   * Does not return the in-object data.
   * @return {Promise.<Array.<LangString|string>>} 
   **/
  async getNames() {
    try {
      const
      nameType    = `${foaf}name`,
      strings     = await super._getStrings(nameType),
      langStrings = await super._getLangStrings(nameType),
      res         = strings;
  
      for (const s of langStrings) res.add(s);
      return Promise.resolve(res);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** 
   * Does a real-time search in datasets.
   * Does not return the in-object data.
   * @return {Promise.<Set.<LangString>>} 
   **/
  async getOneLineBios() {
    return super._getLangStrings(`${bio}olb`);
  }

  /** 
   * Does a real-time search in datasets.
   * Does not return the in-object data.
   * @return {Promise.<Set.<string>>} 
   **/
  async getEmails() {
    try {
      const
      mboxType = df.namedNode(`${foaf}mbox`),
      s        = df.namedNode(this.id),
      p        = mboxType,
      res      = new Set();

      for (const dataset of this.datasets) {
        for (const quad of dataset.match(s, p, null)) {
          const o = quad.object;
          try {
            if(!['NamedNode'].includes(o.termType)) continue;
            const url = new URL(o.value);
            if(!['mailto:'].includes(url.protocol)) continue;
            res.add(url.pathname);
          } catch (error) {
            console.error(error);
          }
        }
      }
      return Promise.resolve(res);
    } catch (error) {
      return Promise.reject(error);
    }
  }


  /** 
   * Writes the model to a dataset that must conform to the DatasetCore interface.
   * The graph defaults to defaultGraph.
   * Resolves to `true` if the write succeeds.
   * 
   * @param {object} dataset
   * @param {(URL|UniformResourceName)} graph
   * @returns {Promise.<boolean>}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface|DatasetCore interface, RDF/JS: Dataset specification 1.0}
   **/
  async writeTo(dataset, graph){ 
    try {
      await super.writeTo(dataset, graph);

      if (!graph) {
        graph = df.defaultGraph();
      } else {
        if(!IRI.isIRI(graph)) throw new TypeError(`Not a graph`);
        graph = df.namedNode(graph.toString());
      }

      const 
      id       = df.namedNode(`${this.id}`),
      nameType = df.namedNode(`${foaf}name`),
      olbType  = df.namedNode(`${bio}olb`),
      mboxType = df.namedNode(`${foaf}mbox`);

      // foaf:name
      for (const name of this.names) {
        const q = quad(
          id, nameType, 
          typeof name === 'string' ?
            df.literal(name) :
            df.literal(name.value, name.language)
        );
        dataset.add(q);
      }
      // bio:olb
      for (const olb of this.oneLineBios) {
        const q = quad(id, olbType, df.literal(olb.value, olb.language?.iso639_1));
        dataset.add(q);
      }
      // foaf:mbox
      for (const mbox of this.emails) {
        const q = df.quad(id, mboxType, df.namedNode(`mailto:${mbox}`));
        dataset.add(q);
      }

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

}

export { Person };
