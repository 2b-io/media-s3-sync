import serializeError from 'serialize-error'

import formatParams from './format-params'
import mediaMapping from 'mapping/media'
import media from 'services/media'
import elasticSearch from 'services/elastic-search'

const fetchPage = async ({ prefix, maxKeys = 10, continuationToken }) => {
  const params = {
    Prefix: prefix || null,
    MaxKeys: maxKeys,
    ContinuationToken: continuationToken || null
  }
  const {
    Contents: contents,
    NextContinuationToken: nextContinuationToken,
    IsTruncated: isTruncated
  } = await media.list({ params })

  await contents.reduce(
    async (previousJob, file) => {
      await previousJob
      const { Key: key } = file
      console.log('PUSH_FILE -> ', key)

      try {
        const s3Object = await media.head({ key })
        const paramsElasticSearch = formatParams({ s3Object, key })
        await elasticSearch.createOrUpdate({
          id: key,
          params: paramsElasticSearch
        })
      } catch (error) {
        console.error(error)
      }
    },
    Promise.resolve()
  )

  return {
    isTruncated,
    nextContinuationToken
  }
}

export default async (event, respond) => {
  try {
    const {
      prefix,
      continuationToken,
      maxKeys
    } = JSON.parse(event.body)
    await elasticSearch.initMapping({
      params: mediaMapping
    })

    const {
      isTruncated,
      nextContinuationToken
    } = await fetchPage({ prefix, maxKeys, continuationToken })

    if (!isTruncated) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'success',
          isTruncated: false
        })
      }
    }

    return {
      statusCode: 206,
      body: JSON.stringify({
        message: 'partial success',
        isTruncated: true,
        nextContinuationToken
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: serializeError(error)
    }
  }
}
