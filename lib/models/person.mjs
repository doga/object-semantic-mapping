import { 
  IRI, UniformResourceName,
  dataFactory as df,
} from '../../deps.mjs';
import { LangString } from '../rdf/lang-string.mjs';
import { Model } from '../model.mjs';
import { prefixes } from '../rdf/prefixes.mjs';

const
{ rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc, } = prefixes,

a              = df.namedNode(`${rdf}type`),
langStringType = df.namedNode(`${rdf}langString`),
stringType     = df.namedNode(`${xsd}string`),
nameType       = df.namedNode(`${foaf}name`),
olbType        = df.namedNode(`${bio}olb`),
mboxType       = df.namedNode(`${foaf}mbox`);


class Person extends Model {
  /** @type {Array.<URL|UniformResourceName>} */
  static types = [`${foaf}Person`, `${schema}Person`, `${cwrc}NaturalPerson`, `${prov}Agent`].map(t => IRI.parse(t));

  /** 
   * Prefixes that are used by this model.
   * @type {Object.<string, string>} 
   **/
  static prefixes = { rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc, };

  /** 
   * Reads persons from datasets that conform to the DatasetCore interface.
   * @param {(object|object[]|Set.<object>)} datasets
   * @param {({
   *   count:      (number|null|undefined)
   * }|null|undefined)} config
   * @returns {Promise.<Model[]>} 
   * @async
   * @static
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
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
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   * @see {@link https://www.w3.org/TR/rdf11-schema/#ch_resource}
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
   * @return {Array.<LangString|string>} 
   **/
  async getNames() {
    const
    s   = df.namedNode(this.id),
    p   = nameType,
    res = new Set();

    for (const dataset of this.datasets) {
      for (const quad of dataset.match(s, p, null)) {
        const o = quad.object;
        try {
          if(stringType.equals(o.datatype)) {
            res.add(o.value);
          } else if(langStringType.equals(o.datatype)) {
            res.add(new LangString(o.value, o.language));
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    return res;
  }

  /** 
   * Does a real-time search in datasets.
   * Does not return the in-object data.
   * @return {Set.<LangString>} 
   **/
  async getOneLineBios() {
    const
    s   = df.namedNode(this.id),
    p   = olbType,
    res = new Set();

    for (const dataset of this.datasets) {
      for (const quad of dataset.match(s, p, null)) {
        const o = quad.object;
        try {
          if(!langStringType.equals(o.datatype)) continue;
          const langString = new LangString(o.value, o.language);
          res.add(langString);
        } catch (error) {
          console.error(error);
        }
      }
    }
    return res;
  }

  /** 
   * Does a real-time search in datasets.
   * Does not return the in-object data.
   * @return {Set.<string>} 
   **/
  async getEmails() {
    const
    s   = df.namedNode(this.id),
    p   = mboxType,
    res = new Set();

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
    return res;
  }


  /** 
   * Writes the model to a dataset that must conform to the DatasetCore interface.
   * The graph defaults to defaultGraph.
   * Resolves to `true` if the write succeeds.
   * 
   * @param {object} dataset
   * @param {(URL|UniformResourceName)} graph
   * @returns {Promise.<boolean>}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
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

      const id = df.namedNode(`${this.id}`);

      // foaf:name
      for (const name of this.names) {
        const q = quad(
          id, nameType, 
          typeof name === 'string' ?
            df.literal(name) :
            df.literal(name.str, name.lang)
        );
        dataset.add(q);
      }
      // bio:olb
      for (const olb of this.oneLineBios) {
        const q = quad(id, olbType, df.literal(olb.value, olb.lang?.iso639_1));
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
