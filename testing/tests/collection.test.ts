import type { Document } from "../../mod.ts"
import { db, testPerson, reset, type Person } from "../config.ts"
import { assert } from "../deps.ts"

Deno.test({
  name: "collection",
  fn: async t => {
    // Test "add" method
    await t.step({
      name: "add",
      fn: async t => {
        await reset()
    
        await t.step({
          name: "Should add record and return commit result with random id of type string and versionstamp of type string",
          fn: async () => {
            await reset()
    
            const { id, versionstamp } = await db.people.add(testPerson)
    
            const person = await db.people.find(id)
    
            assert(typeof id === "string")
            assert(typeof versionstamp === "string")
            assert(typeof person === "object" && person?.id === id)
          }
        })
      }
    })

    // Test "set" method
    await t.step({
      name: "set",
      fn: async t => {
        await t.step({
          name: "Should set record and return commit result with id of type string and versionstamp of type string",
          fn: async () => {
            await reset()
    
            const { id, versionstamp } = await db.people.set("test_id", testPerson)
    
            const person = await db.people.find(id)
    
            assert(typeof id === "string")
            assert(typeof versionstamp === "string")
            assert(typeof person === "object" && person?.id === id)
          }
        })
    
        await t.step({
          name: "Should set record and return commit result with id of type number and versionstamp of type string",
          fn: async () => {
            await reset()
    
            const { id, versionstamp } = await db.people.set(123, testPerson)
    
            const person = await db.people.find(id)
    
            assert(typeof id === "number")
            assert(typeof versionstamp === "string")
            assert(typeof person === "object" && person?.id === id)
          }
        })
    
        await t.step({
          name: "Should set record and return commit result with id of type bigint and versionstamp of type string",
          fn: async () => {
            await reset()
    
            const { id, versionstamp } = await db.people.set(123n, testPerson)
    
            const person = await db.people.find(id)
    
            assert(typeof id === "bigint")
            assert(typeof versionstamp === "string")
            assert(typeof person === "object" && person?.id === id)
          }
        })
      }
    })

    // Test "find" method
    await t.step({
      name: "find",
      fn: async t => {
        await t.step({
          name: "Should return null",
          fn: async () => {
            await reset()
            const doc = await db.people.find("non_existing_id")
            assert(doc === null)
          }
        })
    
        await t.step({
          name: "Should return null",
          fn: async () => {
            await reset()
    
            const doc = await db.people.find(111, {
              consistency: "eventual"
            })
    
            assert(doc === null)
          }
        })
    
        await t.step({
          name: "Should find document by id and not return null",
          fn: async () => {
            await reset()
    
            const { id } = await db.people.add(testPerson)
            const doc = await db.people.find(id)
            assert(typeof doc === "object")
            assert(typeof doc?.value === "object")
            assert(doc?.value.name === testPerson.name)
          }
        })
    
        await t.step({
          name: "Should find document by id and not return null",
          fn: async () => {
            await reset()
    
            const { id } = await db.people.add(testPerson)
    
            const doc = await db.people.find(id, {
              consistency: "eventual"
            })
            
            assert(typeof doc === "object")
            assert(typeof doc?.value === "object")
            assert(doc?.value.name === testPerson.name)
          }
        })
      }
    })

    // Test "findMany" method
    await t.step({
      name: "findMany",
      fn: async t => {
        await t.step({
          name: "Should not find any documents",
          fn: async () => {
            await reset()

            const docs = await db.people.findMany(["123", 123, 123n, "abc"])

            assert(docs.length === 0)
          }
        })

        await t.step({
          name: "Should find 2 documents",
          fn: async () => {
            await reset()

            await db.people.set("123", testPerson)
            await db.people.set(123n, testPerson)

            const docs = await db.people.findMany(["123", 123, 123n, "abc"])

            assert(docs.length === 2)
            assert(docs.some(doc => doc.id === "123"))
            assert(docs.some(doc => doc.id === 123n))
          }
        })

        await t.step({
          name: "Should find 4 documents",
          fn: async () => {
            await reset()

            const arrayId = new Uint8Array()
            arrayId.fill(10)

            await db.people.set("123", testPerson)
            await db.people.set(123, testPerson)
            await db.people.set(123n, testPerson)
            await db.people.set(arrayId, testPerson)

            const docs = await db.people.findMany(["123", 123, 123n, arrayId])

            assert(docs.length === 4)
            assert(docs.some(doc => doc.id === "123"))
            assert(docs.some(doc => doc.id === 123))
            assert(docs.some(doc => doc.id === 123n))
            assert(docs.some(doc => doc.id instanceof Uint8Array && doc.id.every(n => arrayId.includes(n))))
          }
        })
      }
    })

    // Test "delete" method
    await t.step({
      name: "delete",
      fn: async t => {
        await t.step({
          name: "Should delete record by id",
          fn: async () => {
            await reset()
    
            const { id } = await db.people.add(testPerson)
            const p1 = await db.people.find(id)
    
            assert(p1 !== null)
    
            await db.people.delete(id)
            const p2 = await db.people.find(id)
    
            assert(p2 === null)
          }
        })
      }
    })
    
    // Test "deleteMany" method
    Deno.test({
      name: "deleteMany",
      fn: async t => {
        await t.step({
          name: "Should delete all records",
          fn: async () => {
            await reset()
    
            const r1 = await db.people.add(testPerson)
            const r2 = await db.people.add(testPerson)
            const id1 = r1.id
            const id2 = r2.id
    
            const p1_1 = await db.people.find(id1)
            const p2_1 = await db.people.find(id2)
    
            assert(p1_1 !== null)
            assert(p2_1 !== null)
    
            await db.people.deleteMany()
    
            const p1_2 = await db.people.find(id1)
            const p2_2 = await db.people.find(id2)
    
            assert(p1_2 === null)
            assert(p2_2 === null)
          }
        })
    
        await t.step({
          name: "Should only delete filtered records",
          fn: async () => {
            await reset()
    
            const r1 = await db.people.add(testPerson)
            const r2 = await db.people.add(testPerson)
            const id1 = r1.id
            const id2 = r2.id
    
            const p1_1 = await db.people.find(id1)
            const p2_1 = await db.people.find(id2)
    
            assert(p1_1 !== null)
            assert(p2_1 !== null)
    
            await db.people.deleteMany({
              filter: doc => doc.id === id1
            })
    
            const p1_2 = await db.people.find(id1)
            const p2_2 = await db.people.find(id2)
    
            assert(p1_2 === null)
            assert(p2_2 !== null)
          }
        })
    
        await t.step({
          name: "Should only delete the first 2 records",
          fn: async () => {
            await reset()
    
            await db.people.add(testPerson)
            await db.people.add(testPerson)
            await db.people.add(testPerson)
    
            const allPeople1 = await db.people.getMany()
    
            assert(allPeople1.length === 3)
    
            await db.people.deleteMany({
              limit: 2,
            })
    
            const allPeople2 = await db.people.getMany()
    
            assert(allPeople2.length === 1)
          }
        })
      }
    })

    // Test "getMany" method
    await t.step({
      name: "getMany",
      fn: async t => {
        await t.step({
          name: "Should retrieve all records",
          fn: async () => {
            await reset()
    
            const r1 = await db.people.add(testPerson)
            const r2 = await db.people.add(testPerson)
            const id1 = r1.id
            const id2 = r2.id
    
            const allPeople = await db.people.getMany()
    
            assert(allPeople.length === 2)
            assert(allPeople.some(p => p.id === id1))
            assert(allPeople.some(p => p.id === id2))
          }
        })
    
        await t.step({
          name: "Should only retrieve filtered records",
          fn: async () => {
            await reset()
    
            const r1 = await db.people.add(testPerson)
            const r2 = await db.people.add(testPerson)
            const id1 = r1.id
            const id2 = r2.id
    
            const allPeople = await db.people.getMany({
              filter: doc => doc.id === id1
            })
    
            assert(allPeople.length === 1)
            assert(allPeople.some(p => p.id === id1))
            assert(!allPeople.some(p => p.id === id2))
          }
        })
    
        await t.step({
          name: "Should only retrieve the first 2 records",
          fn: async () => {
            await reset()
    
            await db.people.add(testPerson)
            await db.people.add(testPerson)
            await db.people.add(testPerson)
    
            const allPeople1 = await db.people.getMany()
    
            assert(allPeople1.length === 3)
    
            const allPeople2 = await db.people.getMany({
              limit: 2
            })
    
            assert(allPeople2.length === 2)
          }
        })
      }
    })

    // Test "forEach" method
    await t.step({
      name: "forEach",
      fn: async t => {
        await t.step({
          name: "Should add all documents to list",
          fn: async () => {
            await reset()
    
            const r1 = await db.people.add(testPerson)
            const r2 = await db.people.add(testPerson)
            const id1 = r1.id
            const id2 = r2.id
    
            const allPeople = await db.people.getMany()
    
            assert(allPeople.length === 2)
    
            const list: Document<Person>[] = []
            await db.people.forEach(doc => list.push(doc))
    
            assert(list.length === 2)
            assert(list.some(doc => doc.id === id1))
            assert(list.some(doc => doc.id === id2))
          }
        })
    
        await t.step({
          name: "Should only add filtered documents to list",
          fn: async () => {
            await reset()
    
            const r1 = await db.people.add(testPerson)
            const r2 = await db.people.add(testPerson)
            const id1 = r1.id
            const id2 = r2.id
    
            const allPeople = await db.people.getMany()
    
            assert(allPeople.length === 2)
    
            const list: Document<Person>[] = []
            await db.people.forEach(doc => list.push(doc), {
              filter: doc => doc.id === id1
            })
    
            assert(list.length === 1)
            assert(list.some(doc => doc.id === id1))
            assert(!list.some(doc => doc.id === id2))
          }
        })
      }
    })
  }
})