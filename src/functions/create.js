import serializeError from 'serialize-error'

import formatParams from './format-params'
import mediaMapping from 'mapping/media'
import config from 'infrastructure/config'
import media from 'services/media'
import elasticSearch from 'services/elastic-search'

export default async (event) => {
  if (event.Records.length) {
    await event.Records.reduce(
      async (previousJob, file) => {
        await previousJob
        try {
          await elasticSearch.initMapping({
            index: 'media',
            type: 'media',
            params: mediaMapping
          })
          const s3Object = await media.head({
            bucket: config.aws.s3.bucket,
            key: file.s3.object.key
          })
          const params = formatParams({ s3Object, key: file.s3.object.key })
          await elasticSearch.createOrUpdate({
            index: 'media',
            type: 'media',
            id: file.s3.object.key,
            params
          })
        } catch (error) {
          console.log(serializeError(error))
        }
      },
      Promise.resolve()
    )
  } else {
    return {
      statusCode: 500,
      body: event
    }
  }
}
