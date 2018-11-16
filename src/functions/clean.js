import serializeError from 'serialize-error'

import elasticSearch from 'services/elastic-search'

export default async (event) => {
  try {
    const {
      lastSynchronized,
      projectIdentifier,
      continuationToken,
      maxKeys
    } = JSON.parse(event.body)

    const { deleted } = await elasticSearch.delete(projectIdentifier, {
      size: maxKeys,
      body: {
        query: {
          bool: {
            must: [ {
              range: {
                lastSynchronized: {
                  lte: new Date(lastSynchronized)
                }
              }
            } ]
          }
        }
      }
    })

    const isTruncated = maxKeys === deleted

    return {
      statusCode: isTruncated ? 206 : 200,
      body: JSON.stringify({
        message: isTruncated ? 'partial success' : 'success',
        isTruncated,
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(serializeError(error))
    }
  }
}
