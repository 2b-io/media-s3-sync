import serializeError from 'serialize-error'

import formatParams from './format-params'
import mediaMapping from 'mapping/media'
import media from 'services/media'
import elasticSearch from 'services/elastic-search'

export default async (event) => {
  if (event.Records.length) {
    try {
      await elasticSearch.initMapping({
        index: 'media',
        type: 'media',
        params: mediaMapping
      })
      const { key } = event.Records[0].s3.object
      const bucket = config.aws.s3.bucket
      const s3Object = await media.head({ bucket, key })
      const params = formatParams({ s3Object, key })
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
  } else {
    return {
      statusCode: 500,
      body: event
    }
  }
}
