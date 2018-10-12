import serializeError from 'serialize-error'

import elasticSearch from 'services/elastic-search'

export default async (event) => {
  if (event.Records.length) {
    await event.Records.reduce(async (previousJob, file) => {
      await previousJob
      try {
        await elasticSearch.remove({
          index: 'media',
          type: 'media',
          id: file.s3.object.key
        })
      } catch (error) {
        return {
          statusCode: 500,
          body: serializeError(error)
        }
      }
    })
  } else {
    return {
      statusCode: 500,
      body: event
    }
  }
}
