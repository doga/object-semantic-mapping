import * as prefixes from './rdf/prefixes.mjs';
import { dataFactory as df } from '../deps.mjs';

const 
a        = df.namedNode(`${prefixes.rdf}type`),
resource = df.namedNode(`${prefixes.rdf}Resource`);

class Model { 
  /** 
   * Well-known RDF named node prefixes.
   * @type {Object.<string, string>} 
   * @see {@link https://vocab.org/vann/}
   **/
  static wellKnownPrefixes = prefixes;


  /** 
   * A URL that represents a named node,
   * or a string that represents a blank node.
   * @type {(URL|string)} 
   * @see {@link https://rdf.js.org/data-model-spec/#namednode-interface}
   * @see {@link https://rdf.js.org/data-model-spec/#blanknode-interface}
   * @ignore
   **/
  #id; 


  /** 
   * Datasets where the nodes were found. Each must conform to the DatasetCore interface.
   * @type {Set.<object>} 
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   * @ignore
  **/
  #datasets;


  /** 
   * All RDF types of this model.
   * @type {Set.<URL>} 
   * @see {@link https://www.w3.org/TR/rdf11-schema/#ch_type}
   * @ignore
   **/
  #types;


  /** 
   * Reads up to `count` models from the given RDF `datasets` datasets. 
   * Each dataset must conform to the DatasetCore interface.
   * The nodes must match the RDF `types`. If `types` is not specified, then all types are matched.
   * If `modelClass` is provided, then it is used instead of `Model` to create a model.
   * `modelClass` should be a subclass of `Model`.
   * @param {(object|object[]|Set.<object>)} datasets
   * @param {({
   *   types:      (URL|URL[]|Set.<URL>)
   *   modelClass: (function|null|undefined),
   *   count:      (number|null|undefined)
   * }|null|undefined)} config
   * @returns {Promise.<Model[]>} 
   * @async
   * @static
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   **/
  static async readFrom(datasets, config) { 
    try {
      if(typeof config !== 'object')config = {};
      let {types, modelClass, count} = config;
      
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
      
      // verify types
      if(!types) {
        types = null;
      } else {
        if (types instanceof Array) {
          const t = new Set();
          for (const rdfType of types) if(rdfType instanceof URL) t.add(rdfType);
          types = t;
        }
        if(!(types instanceof Set)){
          if(!(types instanceof URL)) return Promise.reject(new TypeError('rdf type not recognised'));
          // types is assumed to be a single rdfType
          types = new Set([types]);
        }
      }

      // verify modelClass (can't really be done?)
      if(!modelClass) modelClass = Model;

      // verify count
      if (count) {
        if (typeof count !== 'number') return Promise.reject(new TypeError(`not a count`));
        count = Math.floor(count);
        if (count < 1) return Promise.reject(new TypeError(`not a count: ${count}`));
      }

      // read matching nodes
      const nodes = new Map();
      for (const dataset of datasets) {
        for (const quad of dataset.match(null, a, null)) {
          let 
          node = quad.subject,
          type = quad.object;

          if(!(
            ['NamedNode'].includes(node.termType) &&
            // !['BlankNode', 'NamedNode'].includes(node.termType) && // TODO allow blank nodes
            ['NamedNode'].includes(type.termType) 
          )) continue;
          
          node = node.value; type = type.value;
          
          let hasType = false;
          if (types) {
            for (const t of types) {
              hasType = t.toString() === type;
              if(hasType)break;
            }
            if(!hasType)continue;
          }

          if (!nodes.has(node)) {
            nodes.set(
              node, 
              {
                datasets: new Set([dataset]),
                types   : new Set([types]),
              }
            );
          } else {
            const nodeInfo = nodes.get(node);
            nodeInfo.datasets.add(dataset);
            nodeInfo.types.add(type);
          }
        }
      }

      // build models
      const models = [];
      for (const [iriString, modelInfo] of nodes) {
        try {
          const id = new URL(iriString), typeUrls = new Set();
          for (const t of modelInfo.types.keys()) {
          // for (const [t,_] of modelInfo.types) {
            typeUrls.add(t);
          }
          models.push(
            new modelClass(
              id, {types: typeUrls, datasets: modelInfo.datasets}
            )
          );
        } catch (error) {
          console.debug(`error building model`, error);
        }
      }
      // console.debug(`types`, types);
      // console.debug(`types`, types);
      // console.debug(`datasets`, datasets);
      // console.debug(`nodes`, nodes);
      console.debug(`models`, models);

      return Promise.resolve(models);
    } catch (error) {
      return Promise.reject(error);
    }
  }


  /** 
   * Each dataset must conform to the DatasetCore interface.
   * 
   * @param {URL} id - A URL that identifies a named node, or a string that identifies a blank node.
   * @param {({
   *   types:    (URL|URL[]|Set.<URL>|null|undefined)
   *   datasets: {(object|object[]|Set.<object>|null|undefined)}
   * }|null|undefined)} config - If the nodes were read from one or more datasets, then `datasets` will contain those datasets. Each dataset must conform to the DatasetCore interface. If `type` is not specified, then it is `http://www.w3.org/2000/01/rdf-schema#Resource`.
   * @throws {(TypeError|Error)}
   * @see {@link https://rdf.js.org/data-model-spec/#namednode-interface}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   * @see {@link https://www.w3.org/TR/rdf11-schema/#ch_resource}
   **/
  constructor(id, info) {
    // verify id
    if(!(id instanceof URL)) throw new TypeError('not an id');
    // console.debug(`constr id `, id);

    // verify info
    if(!info)info = {};
    if(typeof info !== 'object') throw new TypeError('not an info');
    let {types, datasets} = info;
    
    // verify types
    if(!types) types = new Set();
    if (types instanceof Array) types = new Set(types);
    if (!(types instanceof Set)) types = new Set([types]);
    if(types.size === 0) types.add(new URL(resource.value)); // rdfs:Resource
    // console.debug(`constr types `, types);
    for (const [t,_] of types) {
      // console.debug(`constr t `, t); // BUG don't use Set? weird behaviour
      if(!(t instanceof URL)) throw new TypeError(`not a type: ${t}`);
    }  

    // verify datasets
    if(!datasets) datasets = new Set();
    if (datasets instanceof Array) datasets = new Set(datasets);
    if (!(datasets instanceof Set)) datasets = new Set([datasets]);
    for (const [dataset,_] of datasets.keys()) {
      if(typeof dataset === 'object') continue;
      throw new TypeError('not a dataset');
    }  

    // console.debug(`constr id`, id);
    // console.debug(`constr types`, types);
    // console.debug(`constr datasets`, datasets.size);
    this.#id = id;
    this.#types = types;
    this.#datasets = datasets;
  }


  /** 
   * A URL that represents a named node,
   * or a string that represents a blank node.
   * @returns {(URL|string)} 
   * @see {@link https://rdf.js.org/data-model-spec/#namednode-interface}
   * @see {@link https://rdf.js.org/data-model-spec/#blanknode-interface}
   **/
  get id(){return this.#id;}

  /** 
   * All RDF types of this model.
   * @returns {Set.<URL>} 
   * @see {@link https://www.w3.org/TR/rdf11-schema/#ch_type}
   * @ignore
   **/
  get types(){return this.#types;}

  /** 
   * Datasets where the nodes were found. Each must conform to the DatasetCore interface.
   * @returns {Set.<object>} 
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
  **/
  get datasets(){return this.#datasets;}


  /** 
   * Writes the model to a dataset that must conform to the DatasetCore interface.
   * Resolves to `true` if the write succeeds.
   * 
   * @param {object} dataset
   * @returns {Promise.<boolean>}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   **/
  async writeTo(dataset){ 
    try {
      const node = df.namedNode(`${this.id}`);
      for (const t of this.types) {
        dataset.add(
          df.quad(
            node, a, df.namedNode(`${t}`), df.defaultGraph()
          )
        );
      }
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }


  /** 
   * @return {string} 
   **/
  toString(){
    let types;
    for (const [t,_] of this.types) {
      if (types) {
        types += `, <${t}>`;
      } else {
        types = `<${t}>`;
      }
    }
    return `<${this.id}> a ${types} .`;
  }

}

export { Model };
