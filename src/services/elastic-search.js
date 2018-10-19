import elasticSearch from 'infrastructure/elastic-search'
import config from 'infrastructure/config'

const INDEX_NAME = `${ config.aws.elasticSearch.prefix }media`
const TYPE_NAME = `${ config.aws.elasticSearch.prefix }media`

export default {
  async remove({ id }) {
    return await elasticSearch.delete({
      index: INDEX_NAME,
      type: TYPE_NAME,
      id
    })
  },
  async initMapping({ params }) {
    const indexExists = await elasticSearch.indices.exists({
      index: INDEX_NAME
    })

    if (indexExists) {
      return
    }

    await elasticSearch.indices.create({
      index: INDEX_NAME
    })

    return await elasticSearch.indices.putMapping({
      index: INDEX_NAME,
      type: TYPE_NAME,
      body: {
        properties: params
      }
    })
  },
  async createOrUpdate({ id, params }) {
    const objectExists = await elasticSearch.exists({
      index: INDEX_NAME,
      type: TYPE_NAME,
      id
    })

    if (objectExists) {
      return await elasticSearch.update({
        index: INDEX_NAME,
        type: TYPE_NAME,
        id,
        body: {
          doc: params
        }
      })
    } else {
      return await elasticSearch.create({
        index: INDEX_NAME,
        type: TYPE_NAME,
        id,
        body: params
      })
    }
  }
}
