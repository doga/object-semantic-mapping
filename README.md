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

_Tip: Run the example below by typing this in your terminal (requires Deno):_

```shell
deno run \
  --allow-net --allow-run --allow-env --allow-read \
  https://deno.land/x/mdrb@2.0.0/mod.ts \
  --dax=false --mode=isolated \
  https://raw.githubusercontent.com/doga/object-semantic-mapping/main/README.md
```

<details data-mdrb>
<summary>Example: Read persons .</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import * as N3 from 'https://esm.sh/gh/doga/N3@1.18.0/mod.mjs';
import { Model } from './mod.mjs';
// import { Model } from 'https://esm.sh/gh/doga/object-semantic-mapping@0.4.0/mod.mjs';
const {foaf} = Model.wellKnownPrefixes;

async function demo() {
      // console.log(`${foaf}Person`);
  const
  store        = new N3.Store(),
  url          = new URL('https://qworum.net/data/DoğaArmangil.ttl'),
  response     = await fetch(url),
  text         = await response.text(),
  parser       = new N3.Parser({baseIRI: `${url}`}),
  parseHandler = (error, quad, prefixes) => {if (quad){store.add(quad);}},
  dataset      = await parser.parse(text, parseHandler),
  persons      = await Model.readFrom(store, {types: new URL(`${foaf}Person`)});

  // console.log(`store:`, store);
  console.info(`persons[0]: ${persons[0]}`);
  // console.info(`persons[0]?.id: `, persons[0]?.id);

}

await demo();
```

Sample output for the code above:

```text

```

∎
