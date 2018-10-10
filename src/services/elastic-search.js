import elasticSearch from 'infrastructure/elastic-search'

export default {
  async update({ index, type, id, params }) {
    return await elasticSearch.update({
      index,
      type,
      id,
      body: params
    })
  },
  async remove({ index, type, id }) {
    return await elasticSearch.delete({
      index,
      type,
      id
    })
  },
  async create({ index, type, id, params }) {
    return await elasticSearch.create({
      index,
      type,
      id,
      body: params
    })
  },
  async checkExists({ index, type, id }){
    return await elasticSearch.exists({
      index: index || null,
      type: type || null,
      id: id || null
    })
  },
  async initMapping({ index, type, params }) {
    const indexExists = await elasticSearch.indices.exists({ index })

    if (indexExists) {
      return
    }

    await elasticSearch.indices.create({
      index
    })

    return await elasticSearch.indices.putMapping({
      index: index,
      type: type,
      body: {
        properties: params
      }
    })
  },
  async createOrUpdate({ index, type, id, params }) {
    const objectExists = await elasticSearch.exists({
      index,
      type,
      id
    })

    if (objectExists) {
      return await elasticSearch.update({
        index,
        type,
        id,
        body: {
          doc: params
        }
      })
    } else {
      return await elasticSearch.create({
        index,
        type,
        id,
        body: params
      })
    }
  }

}
