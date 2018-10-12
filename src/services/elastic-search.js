import elasticSearch from 'infrastructure/elastic-search'

import config from 'infrastructure/config'

export default {
  async remove({ id }) {
    return await elasticSearch.delete({
      index: config.aws.elasticSearch.index,
      type: config.aws.elasticSearch.type,
      id
    })
  },
  async initMapping({ params }) {
    const indexExists = await elasticSearch.indices.exists({
      index: config.aws.elasticSearch.index
    })

    if (indexExists) {
      return
    }

    await elasticSearch.indices.create({
      index: config.aws.elasticSearch.index
    })

    return await elasticSearch.indices.putMapping({
      index: config.aws.elasticSearch.index,
      type: config.aws.elasticSearch.type,
      body: {
        properties: params
      }
    })
  },
  async createOrUpdate({ id, params }) {
    const objectExists = await elasticSearch.exists({
      index: config.aws.elasticSearch.index,
      type: config.aws.elasticSearch.type,
      id
    })

    if (objectExists) {
      return await elasticSearch.update({
        index: config.aws.elasticSearch.index,
        type: config.aws.elasticSearch.type,
        id,
        body: {
          doc: params
        }
      })
    } else {
      return await elasticSearch.create({
        index: config.aws.elasticSearch.index,
        type: config.aws.elasticSearch.type,
        id,
        body: params
      })
    }
  }

}
