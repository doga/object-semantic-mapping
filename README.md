![Qworum logo and name](https://raw.githubusercontent.com/doga/qworum-website/master/build/assets/images/logos/Qworum-logo-and-name.svg "Qworum logo and name")

# Object-semantic mapping for Qworum

When providing [Qworum](https://qworum.net) APIs that receive or return [semantic data](https://en.wikipedia.org/wiki/Semantic_Web), it is a good idea to provide an OSM (object-semantic mapping) library at the same time, or better yet, reuse an existing OSM.

Why Qworum API providers may wish to provide an OSM:

- implementing Qworum APIs becomes much easier.
- consuming Qworum APIs becomes much easier.

This repo can be used as a template for OSM authors.

## How to import this library into your frontend code

This library is an ECMAScript module that does not have any dependencies. Importing this library is simple:

- `import * as OSM from 'https://esm.sh/gh/doga/object-semantic-mapping@0.4.0/mod.mjs';`

## Usage example

_Tip: Run the examples below by typing this in your terminal (requires Deno):_

```shell
deno run \
  --allow-net --allow-run --allow-env --allow-read \
  https://deno.land/x/mdrb@2.0.0/mod.ts \
  --dax=false --mode=isolated \
  https://raw.githubusercontent.com/doga/object-semantic-mapping/main/README.md
```

<details data-mdrb>
<summary>Example: Create a model instance, and write it to an RDF dataset.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { Model, IRI } from './mod.mjs';
import * as N3 from 'https://esm.sh/gh/doga/N3@1.18.0/mod.mjs';
// import { Model } from 'https://esm.sh/gh/doga/object-semantic-mapping@0.4.0/mod.mjs';
const {schema} = Model.wellKnownPrefixes;

await demo();

async function demo() {
  console.info(`Creating new model instance ..`);
  const
  modelId   = IRI.parse('urn:isbn:0451450523'),
  modelType = IRI.parse(`${schema}Product`),
  model     = new Model(modelId, {types: modelType});

  console.info(`\nNew model instance:\n${model}`);

  console.info(`\nWriting the model instance to an empty dataset ..`);
  const store = new N3.Store();
  model.writeTo(store);

  const writer = new N3.Writer();
  for (const quad of store) writer.addQuad(quad);
  writer.end((err, res) => {
    if (!err) console.info(`\nUpdated dataset:\n${res}`);
  });


}
```

Sample output for the code above:

```text
<https://qworum.net/data/Do%C4%9FaArmangil.ttl#id> a <http://xmlns.com/foaf/0.1/Person> .
```

<details data-mdrb>
<summary>Example: Read model instances from a Turtle file.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { Model, IRI } from './mod.mjs';
import * as N3 from 'https://esm.sh/gh/doga/N3@1.18.0/mod.mjs';
// import { Model } from 'https://esm.sh/gh/doga/object-semantic-mapping@0.4.0/mod.mjs';
const {foaf, schema, person} = Model.wellKnownPrefixes;

await demo();

async function demo() {
  const
  store        = new N3.Store(),
  url          = IRI.parse('https://qworum.net/data/DoğaArmangil.ttl'),
  response     = await fetch(url),
  text         = await response.text(),
  parser       = new N3.Parser({baseIRI: `${url}`}),
  parseHandler = (error, quad, prefixes) => {if (quad){store.add(quad);}},
  dataset      = await parser.parse(text, parseHandler),
  types     = [
    `${foaf}Person`, 
    `${schema}Person`,
    `${person}Person`,
  ].map(t => IRI.parse(t)),
  models = await Model.readFrom(store, {types});

  for (const model of models){
    console.info(`${model}`);
  }
}
```

Sample output for the code above:

```text
<https://qworum.net/data/Do%C4%9FaArmangil.ttl#id> a <https://schema.org/Person>, <http://xmlns.com/foaf/0.1/Person> .
```

∎
