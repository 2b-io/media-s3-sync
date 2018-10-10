import serializeError from 'serialize-error'

import elasticSearch from 'services/elastic-search'

export default async (event) => {

  if (event.Records.length) {
    const key = event.Records[0].s3.object.key
    try {
      await elasticSearch.remove({
        index: 'media',
        type: 'media',
        id: key
      })
      return {
        statusCode: 204
      }
    } catch (error) {
      throw serializeError(error)
    }
  }
}
