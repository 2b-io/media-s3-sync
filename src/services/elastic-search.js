import elasticSearch from 'infrastructure/elastic-search'
import config from 'infrastructure/config'

const PREFIX = config.aws.elasticSearch.prefix
const TYPE_NAME = `${ PREFIX }-media`

export default {
  async remove(index, id) {
    return await elasticSearch.delete({
      index: `${ PREFIX }-${ index }`,
      type: TYPE_NAME,
      id
    })
  },
  async initMapping(index, mapping) {
    const indexExists = await elasticSearch.indices.exists({
      index: `${ PREFIX }-${ index }`
    })

    if (indexExists) {
      return
    }

    await elasticSearch.indices.create({
      index: `${ PREFIX }-${ index }`
    })

    return await elasticSearch.indices.putMapping({
      index: `${ PREFIX }-${ index }`,
      type: TYPE_NAME,
      body: {
        properties: mapping
      }
    })
  },
  async createOrUpdate(index, id, params) {
    const objectExists = await elasticSearch.exists({
      index: `${ PREFIX }-${ index }`,
      type: TYPE_NAME,
      id
    })

    if (objectExists) {
      return await elasticSearch.update({
        index: `${ PREFIX }-${ index }`,
        type: TYPE_NAME,
        id,
        body: {
          doc: params
        }
      })
    } else {
      return await elasticSearch.create({
        index: `${ PREFIX }-${ index }`,
        type: TYPE_NAME,
        id,
        body: params
      })
    }
  }
}
