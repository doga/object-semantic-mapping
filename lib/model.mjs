import * as prefixes from './rdf/prefixes.mjs';
import { dataFactory as df } from '../deps.mjs';
const a = `${prefixes.rdf}type`;

class Model { 
  /** 
   * Well-known RDF named node prefixes.
   * @type {Object.<string, string>} 
   **/
  static wellKnownPrefixes = prefixes;

  /** 
   * Named node(s) and/or blank node(s) that identify a same thing/model.
   * @type {Set.<object>} 
   * @see {@link https://rdf.js.org/data-model-spec/#namednode-interface}
   * @see {@link https://rdf.js.org/data-model-spec/#blanknode-interface}
   * @ignore
   **/
  #nodes; 

  /** 
   * Datasets that conform to the DatasetCore interface.
   * @type {Set.<object>} 
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   * @ignore
   **/
  #datasets;

  /** 
   * Reads up to `count` models from the given RDF `datasets`. 
   * Each dataset must conform to the DatasetCore interface.
   * The nodes must match `rdfTypes`.
   * If `modelConstructor` is provided, then it is used instead of `Model` to create a model.
   * `modelConstructor` must be a subclass of `Model` (or `Model` itself).
   * @param {{
   *   datasets:         (object|object[]|Set.<object>),
   *   rdfTypes:         (string|string[]|Set.<string>),
   *   modelConstructor: (function|undefined),
   *   count:            (number|undefined)
   * }} sourceConfig
   * @return {Set.<Person>} 
   * @throws {(TypeError|Error)}
   * @async
   * @static
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   **/
  static async read(sourceConfig) { // TODO schema:sameAs
    try {
      let {datasets, rdfTypes, modelConstructor, count} = sourceConfig;
      
      // verify datasets
      if(!datasets) return Promise.reject(new TypeError('dataset not provided'));
      if (datasets instanceof Array) {
        const ds = new Set();
        for (const dataset of datasets) ds.add(dataset);
        datasets = ds;
      }
      if(!(datasets instanceof Set)){
        if(typeof datasets !== 'object') return Promise.reject(new TypeError('dataset not recognised'));
        // datasets is assumed to be a single dataset
        datasets = new Set([datasets]);
      }
      
      // verify rdfTypes
      if(!rdfTypes) return Promise.reject(new TypeError('rdf type not provided'));
      if (rdfTypes instanceof Array) {
        const t = new Set();
        for (const rdfType of rdfTypes) t.add(rdfType);
        rdfTypes = t;
      }
      if(!(rdfTypes instanceof Set)){
        if(typeof rdfTypes !== 'string') return Promise.reject(new TypeError('rdf type not recognised'));
        // rdfTypes is assumed to be a single rdfType
        rdfTypes = new Set([rdfTypes]);
      }

      // verify modelConstructor (can't really be done)
      if(!modelConstructor) modelConstructor = Model;

      // verify count
      if (count) {
        if (typeof count !== 'number') return Promise.reject(new TypeError(`not a count`));
        count = Math.floor(count);
        if (count < 1) return Promise.reject(new TypeError(`not a count: ${count}`));
      }  

      // read models
      const models = new Set();
      for (const dataset of datasets) {
        for (const rdfType of rdfTypes) {
          for (const quad of dataset.match(null, a, df.namedNode(rdfType))) {
            const node  = quad.subject;
            if(!['BlankNode', 'NamedNode'].includes(node.termType)) continue; 
            let model;
            if (node.termType === 'BlankNode') {
              node.scope = dataset; // WARNING blank nodes must have a scope
              model = new modelConstructor(node, dataset);
            } else {
              model = new modelConstructor(node, datasets);
            }
            if(!model)continue;
            models.add(model);
            if (count && count === models.size) return Promise.resolve(models);
          }
        }
      }
      return Promise.resolve(models);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** 
   * Each dataset must conform to the DatasetCore interface.
   * 
   * @param {(object|object[]|Set.<object>)} nodes - Named node(s) and/or blank node(s) that conform to the RDF/JS Data model specification.
   * @param {(object|object[]|Set.<object>|undefined)} datasets - If the nodes were read from one or more datasets, then this parameter will contain those datasets. Each dataset must conform to the DatasetCore interface.
   * @throws {(TypeError|Error)}
   * @see {@link https://rdf.js.org/data-model-spec/#namednode-interface}
   * @see {@link https://rdf.js.org/data-model-spec/#blanknode-interface}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   **/
  constructor(nodes, datasets) {
    // verify datasets
    if(!datasets) datasets = new Set();
    if (datasets instanceof Array) datasets = new Set(datasets);
    if (!(datasets instanceof Set)) datasets = new Set([datasets]);
    for (const dataset of datasets) {
      if(Model.isDataset(dataset)) continue;
      throw new TypeError('not a dataset');
    }

    // verify nodes
    if(!nodes) throw new TypeError('not an id set');
    if (nodes instanceof Array) nodes = new Set(nodes);
    if (!(nodes instanceof Set)) nodes = new Set([nodes]);
    for (const node of nodes) {
      if (!Model.isRdfNode(node, datasets)) 
        throw new TypeError('not a valid named node or blank node');
    }
    if(nodes.size === 0) throw new TypeError('model must be identified by at least one named node or blank node');

    this.#nodes = nodes;
    this.#datasets = datasets;
  }


  /** 
   * @return {Set.<object>} 
   **/
  get nodes() { return this.#nodes; }


  /** 
   * A set of RDF datasets.
   * @return {Set.<object>} 
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   **/
  get datasets() { return this.#datasets; }
  

  // /** 
  //  * Checks if both models share at least one same ID.
  //  * @param {Model} model
  //  * @return {boolean} 
  //  **/
  // isSameAs(model){
  //   if(!(model instanceof Model))return false;
  //   for (const id of this.nodes) {
  //     if(model.nodes.has(id))return true;
  //   }
  //   return false;
  // }
  

  /** 
   * @return {string} 
   **/
  toString(){
    let res;
    for (const id of this.nodes) {
      if (res) {
        res += '\n';
      } else {
        res = '';
      }
      res += `${id}`;
    }
    return res;
  }


  static isBlankNode(node, datasets){
    return (
      typeof node === 'object' && 
      ['BlankNode'].includes(node.termType) &&
      typeof node.value === 'string' &&
      // Model.isDataset(node.scope) && 
      datasets.has(node.scope)
    );
  }

  static isNamedNode(node){
    return (
      typeof node === 'object' && 
      ['NamedNode'].includes(node.termType) &&
      typeof node.value === 'string'
    );
  }

  static isRdfNode(node, datasets){
    return Model.isNamedNode(node) || Model.isBlankNode(node, datasets);
  }

  static isDataset(dataset){
    return (
      typeof dataset === 'object' &&
      ['number', 'bigint'].includes(typeof dataset.size) &&
      typeof dataset.add === 'function' &&
      typeof dataset.delete === 'function' &&
      typeof dataset.has === 'function' &&
      typeof dataset.match === 'function'
    );
  }

}

export { Model };
