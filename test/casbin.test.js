import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import Fastify from 'fastify'
import { Model, FileAdapter, setDefaultFileSystem } from 'casbin'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const plugin = await import('../index.js')

const modelPath = path.join(__dirname, 'fixtures', 'basic_model.conf')
const policyPath = path.join(__dirname, 'fixtures', 'basic_policy.csv')

setDefaultFileSystem(fs)

test('casbin should exist', async (t) => {
  const fastify = Fastify()

  fastify.register(plugin.default, {
    model: modelPath,
    adapter: policyPath
  })

  await fastify.ready()
  t.assert.ok(!fastify.casbin === false)
  t.assert.ok(fastify.casbin !== undefined)

  await fastify.close()
})

test('preloaded model and adapter should be accepted', async (t) => {
  const fastify = Fastify()
  const preloadedModel = new Model()
  preloadedModel.loadModel(modelPath)
  const preloadedAdapter = new FileAdapter(policyPath)

  fastify.register(plugin.default, {
    model: preloadedModel,
    adapter: preloadedAdapter
  })

  await fastify.ready()
  t.assert.ok(!fastify.casbin === false)
  t.assert.ok(fastify.casbin !== undefined)

  await fastify.close()
})

test('adapter can be omitted for in-memory storage', async (t) => {
  const fastify = Fastify()
  const preloadedModel = new Model()
  preloadedModel.loadModel(modelPath)

  fastify.register(plugin.default, {
    model: preloadedModel
  })

  await fastify.ready()
  t.assert.ok(!fastify.casbin === false)
  t.assert.ok(fastify.casbin !== undefined)

  await fastify.close()
})

test('casbinJsGetPermissionForUser should exist', async (t) => {
  const fastify = Fastify()

  fastify.register(plugin.default, {
    model: modelPath,
    adapter: policyPath
  })

  await fastify.ready()
  t.assert.ok(!fastify.casbin === false)
  t.assert.ok(fastify.casbin.casbinJsGetPermissionForUser !== undefined)

  await fastify.close()
})

test('calls loadPolicy on enforcer', async (t) => {
  const fastify = Fastify()

  fastify.register(plugin.default, {
    model: modelPath,
    adapter: policyPath
  })

  await fastify.ready()
  t.assert.ok(!fastify.casbin === false)

  await fastify.close()
})

test('calls casbinJsGetPermissionForUser with enforcer', async (t) => {
  const fastify = Fastify()

  fastify.register(plugin.default, {
    model: modelPath,
    adapter: policyPath
  })

  await fastify.ready()

  t.assert.ok(fastify.casbin.casbinJsGetPermissionForUser !== undefined)

  await fastify.close()
})

test('sets watcher on enforcer when provided', async (t) => {
  const fastify = Fastify()

  const watcher = {
    setUpdateCallback: () => {}
  }

  fastify.register(plugin.default, {
    model: modelPath,
    adapter: policyPath,
    watcher
  })

  await fastify.ready()
  t.assert.ok(!fastify.casbin === false)
  t.assert.ok(fastify.casbin !== undefined)

  await fastify.close()
})

test('closes adapter and watcher', async (t) => {
  const fastify = Fastify()

  let adapterClosed = false
  let watcherClosed = false

  const adapter = new FileAdapter(policyPath)
  adapter.close = () => { adapterClosed = true }

  const watcher = {
    setUpdateCallback: () => {},
    close: () => { watcherClosed = true }
  }

  fastify.register(plugin.default, {
    model: modelPath,
    adapter,
    watcher
  })

  await fastify.ready()
  t.assert.ok(!fastify.casbin === false)

  await fastify.close()
  t.assert.ok(adapterClosed)
  t.assert.ok(watcherClosed)
})
