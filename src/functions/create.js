import mediaMapping from 'mapping/media'
import config from 'infrastructure/config'
import elasticSearch from 'services/elastic-search'
import media from 'services/media'
import retry from 'services/retry'
import s3toES from 'services/s3-to-es'

export default async (event) => {
  if (event.Records.length) {
    await event.Records.reduce(
      async (previousJob, file) => {
        await previousJob
        const { key } = file.s3.object
        const projectIdentifier = key.split('/')[ 1 ]
        try {
          await elasticSearch.initMapping(
            projectIdentifier,
            mediaMapping
          )
          const s3Object = await retry(10)(media.head)(key)
          const params = s3toES({
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
