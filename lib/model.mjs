import {prefixes} from './rdf/prefixes.mjs';
import {LangString} from './rdf/lang-string.mjs';
import { 
  IRI,
  UniformResourceName,
  dataFactory as df,
} from '../deps.mjs';

const 
{ rdf, rdfs, xsd } = prefixes,
a              = df.namedNode(`${rdf}type`),
langStringType = df.namedNode(`${rdf}langString`),
stringType     = df.namedNode(`${xsd}string`),
resource       = df.namedNode(`${rdf}Resource`);

// TODO add hasType(type)?

class Model { 
  /** 
   * Well-known RDF named node prefixes.
   * @type {Object.<string, string>} 
   * @see {@link https://vocab.org/vann/}
   **/
  static wellKnownPrefixes = prefixes;


  /** 
   * A URL or uniform resource name that represents a named node.
   * @type {(URL|UniformResourceName)} 
   * @see {@link https://rdf.js.org/data-model-spec/#namednode-interface}
   * @see {@link https://rdf.js.org/data-model-spec/#blanknode-interface}
   * @see {@link https://github.com/doga/IRI}
   * @ignore
   **/
  #id; 


  /** 
   * All RDF types of this model.
   * @type {Set.<URL|UniformResourceName>} 
   * @see {@link https://www.w3.org/TR/rdf11-schema/#ch_type}
   * @see {@link https://github.com/doga/IRI}
   * @ignore
   **/
  #types;


  /** 
   * Datasets where the nodes were found. Each must conform to the DatasetCore interface.
   * @type {Set.<object>} 
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   * @ignore
  **/
  #datasets;


  /** 
   * Reads up to `count` models from the given RDF `datasets` datasets. 
   * Each dataset must conform to the DatasetCore interface.
   * The nodes must match the RDF `types`. If `types` is not specified, then all types are matched.
   * If `modelClass` is provided, then it is used instead of `Model` to create a model.
   * `modelClass` should be a subclass of `Model`.
   * @param {(object|object[]|Set.<object>)} datasets
   * @param {({
   *   types:      (URL|UniformResourceName|Array.<URL|UniformResourceName>|Set.<URL|UniformResourceName>|null|undefined)
   *   modelClass: (function|null|undefined),
   *   count:      (number|null|undefined)
   * }|null|undefined)} config
   * @returns {Promise.<Model[]>} 
   * @async
   * @static
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface}
   * @see {@link https://github.com/doga/IRI}
   **/
  static async readFrom(datasets, config) { 
    try {
      const {dataSets, types, modelClass, count} = Model._normaliseReadArgs(datasets, config);

      // read matching nodes
      const nodes = new Map();
      for (const dataset of dataSets) {
        for (const quad of dataset.match(null, a, null)) {
          let 
          node = quad.subject,
          type = quad.object;

          if(!(
            ['NamedNode'].includes(node.termType) &&
            // !['BlankNode', 'NamedNode'].includes(node.termType) && // TODO allow blank nodes?
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
            if(!count || (count && nodes.size < count))
            nodes.set(
              node, 
              {
                datasets: new Set([dataset]),
                types   : new Set([IRI.parse(type)]),
              }
            );
          } else {
            const nodeInfo = nodes.get(node);
            nodeInfo.datasets.add(dataset);
            nodeInfo.types.add(IRI.parse(type));
          }
        }
      }

      // build models
      const models = [];
      for (const [iriString, modelInfo] of nodes) {
        try {
          const id = IRI.parse(iriString), typeUrls = new Set();
          for (const t of modelInfo.types) {
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

      return Promise.resolve(models);
    } catch (error) {
      return Promise.reject(error);
    }
  }


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
  constructor(id, info) {
    // verify id
    if(!IRI.isIRI(id)) throw new TypeError('not an id');
    // console.debug(`constr id `, id);

    // verify info
    if(!info)info = {};
    if(typeof info !== 'object') throw new TypeError('not an info');
    let {types, datasets} = info;
    
    // verify types
    if(!types) types = new Set();
    if (types instanceof Array) types = new Set(types);
    if (!(types instanceof Set)) types = new Set([types]);
    if(types.size === 0) types.add(IRI.parse(resource.value)); // rdfs:Resource
    for (const t of types) {
      if(!IRI.isIRI(t)) throw new TypeError(`not a type: ${t}`);
    }  

    // verify datasets
    if(!datasets) datasets = new Set();
    if (datasets instanceof Array) datasets = new Set(datasets);
    if (!(datasets instanceof Set)) datasets = new Set([datasets]);
    for (const dataset of datasets) {
      if(typeof dataset === 'object') continue;
      throw new TypeError('not a dataset');
    }  

    this.#id = id;
    this.#types = types;
    this.#datasets = datasets;
  }


  /** 
   * A URL that represents a named node,
   * or a string that represents a blank node.
   * @returns {(URL|UniformResourceName)} 
   * @see {@link https://rdf.js.org/data-model-spec/#namednode-interface}
   * @see {@link https://rdf.js.org/data-model-spec/#blanknode-interface}
   **/
  get id(){return this.#id;}

  /** 
   * All RDF types of this model.
   * @returns {Set.<URL|UniformResourceName>} 
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
      if (!graph) {
        graph = df.defaultGraph();
      } else {
        if(!IRI.isIRI(graph)) throw new TypeError(`Not a graph`);
        graph = df.namedNode(graph.toString());
      }
      const node = df.namedNode(`${this.id}`);
      for (const t of this.types) {
        dataset.add(
          df.quad(
            node, a, df.namedNode(`${t}`), graph
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
    for (const t of this.types) {
      if (types) {
        types += `, <${t}>`;
      } else {
        types = `<${t}>`;
      }
    }
    return `<${this.id}> a ${types}.`;
  }

  /** 
   * Does a real-time search in the registered datasets.
   * @param {string} predicate - a named node value, such as https://schema.org/description
   * @return {Set.<LangString>} 
   **/
  async _getLangStrings(predicate) {
    try {
      const
      s   = df.namedNode(this.id),
      p   = df.namedNode(predicate),
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
      return Promise.resolve(res);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** 
   * Does a real-time search in the registered datasets.
   * @param {string} predicate - a named node value, such as https://schema.org/productId
   * @return {Set.<string>} 
   **/
  async _getStrings(predicate) {
    try {
      const
      s   = df.namedNode(this.id),
      p   = df.namedNode(predicate),
      res = new Set();

      for (const dataset of this.datasets) {
        for (const quad of dataset.match(s, p, null)) {
          const o = quad.object;
          try {
            if(!stringType.equals(o.datatype)) continue;
            res.add(o.value);
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
   * Normalises the call argument for readFrom().
   * @param {(object|object[]|Set.<object>)} datasets
   * @param {({
  *   types:      (URL|UniformResourceName|URL[]|UniformResourceName[]|Set.<URL>|Set.<UniformResourceName>|null|undefined)
  *   modelClass: (function|null|undefined),
  *   count:      (number|null|undefined)
  * }|null|undefined)} config
  * @returns {{
  *   datasets:   Set.<object>,
  *   types:      (Set.<URL|UniformResourceName>|null)
  *   modelClass: function,
  *   count:      (number|null)
  * }} 
  * @static
  **/
  static _normaliseReadArgs(datasets, config){
    if(typeof config !== 'object')config = {};
    let {types, modelClass, count} = config;
    
    // verify datasets
    if(!datasets) throw new TypeError('dataset not provided');
    if (datasets instanceof Array) {
      const ds = new Set();
      for (const dataset of datasets) ds.add(dataset);
      datasets = ds;
    }
    if(!(datasets instanceof Set)){
      if(typeof datasets !== 'object') throw new TypeError('dataset not recognised');
      // datasets is assumed to be a single dataset
      datasets = new Set([datasets]);
    }
    
    // verify types
    if(!types) {
      types = null;
    } else {
      if (types instanceof Array) {
        const t = new Set();
        for (const rdfType of types) if(IRI.isIRI(rdfType)) t.add(rdfType);
        types = t;
      }
      if(!(types instanceof Set)){
        if(!IRI.isIRI(types)) throw new TypeError('rdf type not recognised');
        // types is assumed to be a single rdfType
        types = new Set([types]);
      }
    }

    // verify modelClass (can't really be done?)
    if(!modelClass) modelClass = Model;

    // verify count
    if (count) {
      if (typeof count !== 'number') throw new TypeError(`not a count`);
      count = Math.floor(count);
      if (count < 1) throw new TypeError(`not a count: ${count}`);
    } else count = null;

    return {dataSets: datasets, types, modelClass, count};
  }

}

export { Model };
