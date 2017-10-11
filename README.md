# json-factory

Super simple ORM for JSON objects in the browser, or JSON files on the server.

## Setup some fake data

```js
var faker = require('faker')

var addresses = []
var contacts = []

for (var i = 0; i < 50; i++) {
    addresses.push({
        id: `address__${i}`,
        line1: faker.address.streetAddress(),
        line2: faker.address.secondaryAddress(),
        city: faker.address.city()
    })
    
    contacts.push({
        id: `contact__${i}`,
        name: faker.name.findName(),
        address: `address__${i}`,
        phone: faker.phone.phoneNumber(),
        email: faker.internet.email(),
        avatar: faker.image.avatar()
    })
}
```

## Setup the factories

```js
const ContactsFactory = require('json-factory/dom')({
    name: 'contacts',
    data: contacts,
    joins: {
        address: {
            schema: 'addresses',
            on: (contact, address) => contact.address === address.id
        }
    }
})

const AddressesFactory = require('json-factory/dom')({
    name: 'addresses',
    data: addresses,
    joins: {}
});
```

## Retriving data

```js
var firstContact = ContactsFactory.first()
console.log(firstContact)

var contactById = ContactsFactory.first(c => c.id === `contact__${40}`)
console.log(contactById)

var contactsNameContainsA = ContactsFactory.get(c => c.name.toLowerCase().indexOf('a') > -1)
console.log(contactsNameContainsA);
```


## Updating data

```js
var contact = ContactsFactory.first(c => c.id === `contact__30`)
var newAddress = AddressesFactory.first(a => a.id === `address__40`)
console.log(contact, contact.address)

// set the address to the new address id
contact.address = newAddress.id
console.log(contact, contact.address);
```