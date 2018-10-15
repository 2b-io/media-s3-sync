import serializeError from 'serialize-error'

import formatParams from './format-params'
import mediaMapping from 'mapping/media'
import media from 'services/media'
import elasticSearch from 'services/elastic-search'

const fetchPage = async ({ prefix, maxKeys, nextToken }) => {
  const params = {
    Prefix: prefix || null,
    MaxKeys: maxKeys,
    ContinuationToken: nextToken || null
  }
  const {
    Contents,
    NextContinuationToken: _nextToken,
    IsTruncated
  } = await media.list({ params })

  await Contents.reduce(
    async (previousJob, file) => {
      await previousJob
      const { Key: key } = file
      console.log('PUSH_FILE -> ', key)

      try {
        const s3Object = await media.head({ key })
        const identifier = key.split("/")[1]
        const preset = key.split("/").length > 3 ? key.split("/")[4] : null
        const paramsElasticSearch = formatParams({ s3Object, key, identifier, preset })
        await elasticSearch.createOrUpdate({
          id: key,
          params: paramsElasticSearch
        })
      } catch (error) {
        console.log(serializeError(error))
      }
    },
    Promise.resolve()
  )

  if (IsTruncated) {
    return await fetchPage({
      prefix,
      maxKeys,
      nextToken: _nextToken
    })
  } else {
    console.log('FINISH')
    return true
  }
}

export default async (event, respond) => {
  const { prefix } = JSON.parse(event.body)
  await elasticSearch.initMapping({
    params: mediaMapping
  })

  try {
    await fetchPage({ prefix, maxKeys: 10 })
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "success"
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: serializeError(error)
    }
  }
}
