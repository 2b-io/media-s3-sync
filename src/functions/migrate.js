import serializeError from 'serialize-error'

import config from 'infrastructure/config'
import formatParams from './format-params'
import mediaMapping from 'mapping/media'
import media from 'services/media'
import elasticSearch from 'services/elastic-search'

const fetchPage = async (prefix, maxKeys = 10, continuationToken) => {
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
      const projectIdentifier = key.split('/')[1]
      console.log('PUSH_FILE -> ', key)

      try {
        const s3Object = await media.head({ key })
        const paramsElasticSearch = formatParams({ s3Object, key })

        await elasticSearch.createOrUpdate(
          projectIdentifier,
          key,
          paramsElasticSearch
        )
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
      projectIdentifier,
      continuationToken,
      maxKeys
    } = JSON.parse(event.body)
    const prefix = `${ config.version }/${ projectIdentifier }`
    await elasticSearch.initMapping(
      projectIdentifier,
      mediaMapping
    )

    const {
      isTruncated,
      nextContinuationToken
    } = await fetchPage(prefix, maxKeys, continuationToken)

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
