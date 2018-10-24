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
        const { key } = file.s3.object
        const projectIdentifier = key.split('/')[1]
        try {
          await elasticSearch.initMapping(
            projectIdentifier,
            mediaMapping
          )
          const s3Object = await media.head({
            key
          })
          const params = formatParams({
            s3Object,
            key
          })
          return await elasticSearch.createOrUpdate(
            projectIdentifier,
            key,
            params
          )
        } catch (error) {
          console.error(error)
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
