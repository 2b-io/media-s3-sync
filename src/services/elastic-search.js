import elasticSearch from 'infrastructure/elastic-search'
import config from 'infrastructure/config'

const TYPE_NAME = `${ config.aws.elasticSearch.prefix }media`

export default {
  async remove(index, id) {
    return await elasticSearch.delete({
      index,
      type: TYPE_NAME,
      id
    })
  },
  async initMapping(index, mapping) {
    const indexExists = await elasticSearch.indices.exists({
      index
    })

    if (indexExists) {
      return
    }

    await elasticSearch.indices.create({
      index
    })

    return await elasticSearch.indices.putMapping({
      index,
      type: TYPE_NAME,
      body: {
        properties: mapping
      }
    })
  },
  async createOrUpdate(index, id, params) {
    const objectExists = await elasticSearch.exists({
      index,
      type: TYPE_NAME,
      id
    })

    if (objectExists) {
      return await elasticSearch.update({
        index,
        type: TYPE_NAME,
        id,
        body: {
          doc: params
        }
      })
    } else {
      return await elasticSearch.create({
        index,
        type: TYPE_NAME,
        id,
        body: params
      })
    }
  }
}
