import elastic from 'infrastructure/elasticsearch'

export default {
  async create(params) {
    const {
      index = 'media',
      contentType,
      key,
      Metadata,
      ETag,
      LastModified,
      ContentLength
    } = params
    return await elastic.create({
      index,
      type: 'image/jpeg',
      id: key,
      body: {
        originUrl: Metadata['origin-url'],
        ETag,
        LastModified,
        ContentLength
      }
    })
  },
  async initMapping(index, type, body) {

    const indexExists = await elastic.indices.exists({
        index
    })

    if (!indexExists) {
      await elastic.indices.create({
        index
      })
    }

    return await elastic.indices.putMapping({
        index,
        type,
        body
    })
  }
}
