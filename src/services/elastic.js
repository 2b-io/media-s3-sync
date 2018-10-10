import elastic from 'infrastructure/elasticsearch'

export default {
  async update({ index, type, id, params }) {
    return await elastic.update({
      index,
      type,
      id,
      body: {
        ...params
      }
    })
  },
  async remove({ index, type, id }) {
    return await elastic.delete({
      index,
      type,
      id
    })
  },
  async create({ index, type, id, params }) {
    return await elastic.create({
      index,
      type,
      id,
      body: {
        ...params
      }
    })
  },
  async checkExists({ index, type, id }){
    return await elastic.exists({
      index: index || null,
      type: type || null,
      id: id || null
    })
  },
  async initMapping({ index, type, params }) {
    const indexExists = await elastic.indices.exists({ index })

    if (indexExists) {
      return
    }

    await elastic.indices.create({
      index
    })

    const mapping = await elastic.indices.putMapping({
      index: index,
      type: type,
      body: {
        properties: {
          ...params
        }
      }
    })

    return mapping
  }
}
