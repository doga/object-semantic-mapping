# object-semantic-mapping

ORM, but for RDF semantic data.

## How to import this library into your frontend code

This library is an ECMAScript module that does not have any dependencies. Importing this library is simple:

- `import { Language, I18nString, Person } from "https://esm.sh/gh/doga/object-semantic-mapping@0.1.5/mod.mjs";`

## Compatibility

Compatible with:

- N3 Stores created with [N3@1.17.2](https://github.com/doga/N3)
- Semantic data objects created with [qworum-for-web-pages@1.3.5](https://github.com/doga/qworum-for-web-pages)

## Usage

_Tip (requires Deno): Run the following example by typing this in your terminal:_

- `deno run --allow-net --allow-run --allow-env --allow-read https://deno.land/x/mdrb/mod.ts https://raw.githubusercontent.com/doga/object-semantic-mapping/main/README.md`.

<details data-mdrb>
<summary>Read semantic data from the Web, and manipulate it in-memory.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { Language, I18nString, Person } from "https://esm.sh/gh/doga/object-semantic-mapping@0.1.5/mod.mjs";
import { Qworum } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.3.5/mod.mjs";

async function test() {
  const turtleFile = new URL('https://qworum.net/data/DoğaArmangil.ttl');
  console.info(`Fetching: ${turtleFile}`);
  const
  response = await fetch(turtleFile),
  text     = await response.text(),
  semantic = await Qworum.SemanticData(text),
  persons  = Person.read(semantic);

  for (const person of persons) {
    console.info(`Found a person in the fetched file.`);
    console.info(`\nPerson's data before adding in-object data:`);
    displayPersonData(person);
    const
    store = await Qworum.SemanticData(''),
    email = 'a@b.com',
    bio   = [
      new I18nString('Une bio.', 'fr'),
      new I18nString('Eine Bio.', 'de')
    ];

    console.info(`\nAdding in-object email property to person: ${email}`);
    person.emails.push(email);
    console.info(`Adding in-object bio property to person: ${bio[0]}`);
    person.oneLineBios.push(bio[0]);
    console.info(`Adding in-object bio property to person: ${bio[1]}`);
    person.oneLineBios.push(bio[1]);
    console.info(`\nPerson's data as it exists in-object and in the fetched file:`);
    displayPersonData(person);

    person.writeTo(store);
    console.info(`\nWritten the person to an empty N3 store, which now contains:\n\n${store}`);
  }
  console.info(`\nNote that only the in-object data is written.`);
}

function displayPersonData(person) {
  console.info(`  ID:   <${person}>`);
  for (const name of person.allNames) console.info(`  name:  ${name}`);
  for (const bio of person.allOneLineBios) console.info(`  bio:   ${bio}`);
  for (const email of person.allEmails) console.info(`  email: <${email}>`);
}

await test();
```

Sample output for the code above:

```text

Fetching: https://qworum.net/data/Do%C4%9FaArmangil.ttl
Found a person in the fetched file.

Person's data before adding in-object data:
  ID:   <https://qworum.net/data/DoğaArmangil.ttl#id>
  name:  Doğa Armangil
  bio:   EPFL software engineer living in Switzerland. Patent author. Business owner in software.
  email: <d.armangil@qworum.net>
  email: <doga.armangil@alumni.epfl.ch>

Adding in-object email property to person: a@b.com
Adding in-object bio property to person: Une bio.
Adding in-object bio property to person: Eine Bio.

Person's data as it exists in-object and in the fetched file:
  ID:   <https://qworum.net/data/DoğaArmangil.ttl#id>
  name:  Doğa Armangil
  bio:   EPFL software engineer living in Switzerland. Patent author. Business owner in software.
  bio:   Une bio.
  bio:   Eine Bio.
  email: <d.armangil@qworum.net>
  email: <doga.armangil@alumni.epfl.ch>
  email: <a@b.com>

Written the person to an empty N3 store, which now contains:

SemanticData(<https://qworum.net/data/DoğaArmangil.ttl#id> a <http://xmlns.com/foaf/0.1/Person>, <https://schema.org/Person>, <http://sparql.cwrc.ca/ontologies/cwrc#NaturalPerson>, <http://www.w3.org/ns/prov#Agent>;
    <http://purl.org/vocab/bio/0.1/olb> "Une bio."@fr, "Eine Bio."@de;
    <http://xmlns.com/foaf/0.1/mbox> <mailto:a@b.com>.
)

Note that only the in-object data is written.
```

∎
