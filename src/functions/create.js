import serializeError from 'serialize-error'

import formatParams from './format-params'
import media from 'services/media'
import elasticSearch from 'services/elastic-search'

export default async (event) => {
  if (event.Records.length) {
    const key = event.Records[0].s3.object.key
    try {
      const s3Object = await media.head({ key }).promise()
      const params = formatParams({ s3Object, key })
      await elasticSearch.initMapping({
        index: 'media',
        type: 'media',
        id: key
      })
      const object = await elasticSearch.createOrUpdate({
        index: 'media',
        type: 'media',
        id: key,
        params
      })
      return {
        statusCode: 201,
        body: JSON.stringify({
          object
        })
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: serializeError(error)
      }
    }
  }
}
