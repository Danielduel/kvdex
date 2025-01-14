import { assert } from "../deps.ts"
import { mockUser1, mockUser2, mockUser3 } from "../mocks.ts"
import { generateUsers, sleep, useDb } from "../utils.ts"

Deno.test({
  name: "serialized_indexable_collection - watchMany",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: async (t) => {
    await t.step("Should receive all document updates", async () => {
      await useDb(async (db) => {
        const id1 = "id1"
        const id2 = "id2"
        const id3 = "id3"
        let count = 0
        let lastDocs: any[] = []

        await db.is_users.set(id3, generateUsers(1)[0])

        await sleep(500)

        db.is_users.watchMany([id1, id2, id3], (docs) => {
          count++
          lastDocs = docs
        })

        await db.is_users.set(id1, mockUser1)
        await sleep(500)
        await db.is_users.delete(id1)
        await sleep(500)
        await db.is_users.set(id2, mockUser2, { overwrite: true })
        await sleep(500)
        await db.is_users.update(id3, mockUser3)
        await sleep(500)

        assert(count === 4)
        assert(lastDocs[0] === null)
        assert(lastDocs[1]?.value.username === mockUser2.username)
        assert(lastDocs[2]?.value.username === mockUser3.username)
      })
    })

    await t.step("Should not receive unrelated document updates", async () => {
      await useDb(async (db) => {
        const id1 = "id1"
        const id2 = "id1"
        const id3 = "id1"
        const id4 = "id4"
        let count = 0
        let lastDocs: any[] = []

        db.is_users.watchMany([id1, id2, id3], (docs) => {
          count++
          lastDocs = docs
        })

        await db.is_users.set(id4, mockUser1)
        await sleep(500)
        await db.is_users.set(id4, mockUser2, { overwrite: true })
        await sleep(500)
        await db.is_users.update(id4, mockUser3)
        await sleep(500)
        await db.is_users.delete(id4)
        await sleep(500)

        assert(count === 1)
        assert(lastDocs[0] === null)
        assert(lastDocs[1] === null)
        assert(lastDocs[2] === null)
      })
    })
  },
})
